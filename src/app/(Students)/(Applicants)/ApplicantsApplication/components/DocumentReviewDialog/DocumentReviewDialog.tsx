"use client";

import { AlertCircle, FileText, Info, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { type GradeItem, retryDocumentOcr, syncParseur } from "@/lib/api/documents";
import { isInvalidOrMismatchedDoc } from "../wizard-helpers";
import { DialogFooterBar } from "./DialogFooterBar";
import { DialogHeaderBar } from "./DialogHeaderBar";
import { DocumentPreviewCarousel } from "./DocumentPreviewCarousel";
import { DocumentReviewDrawer } from "./DocumentReviewDrawer";
import { ExtractedMetadataView } from "./ExtractedMetadataView";
import {
  type ConfirmedDataShape,
  type DocumentReviewDialogProps,
  type EditableGradeItem,
  type ExtractedDataShape,
  type ExtractedGradeRaw,
  generatePreviewPageUrls,
} from "./types";

export function DocumentReviewDialog({
  document: doc,
  currentYearLevel,
  open,
  onOpenChange,
  onConfirm,
}: DocumentReviewDialogProps) {
  const isMobile = useIsMobile();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPage, setCurrentPage] = useState(1);
  const [failedPages, setFailedPages] = useState<Record<number, boolean>>({});

  // Extracted data form states
  const [academicYear, setAcademicYear] = useState("");
  const [generalAverage, setGeneralAverage] = useState<string>("");
  const [gradeItems, setGradeItems] = useState<EditableGradeItem[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manualBypass, setManualBypass] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const isMismatch = isInvalidOrMismatchedDoc(doc, currentYearLevel ?? 1);
  const isReadOnly = doc?.status === "VERIFIED" || doc?.status === "STUDENT_CONFIRMED" || isMismatch;

  // Parse candidate page URLs safely
  const candidatePageUrls = useMemo(() => {
    if (!doc?.file_url) return [];
    return generatePreviewPageUrls(doc.file_url, doc.file_type);
  }, [doc?.file_url, doc?.file_type]);

  const validPageUrls = useMemo(() => {
    return candidatePageUrls.filter((_, idx) => !failedPages[idx]);
  }, [candidatePageUrls, failedPages]);

  // Extract raw JSON blobs
  const rawExtracted = useMemo(() => {
    if (!doc?.extracted_data) return {} as ExtractedDataShape;
    return (
      typeof doc.extracted_data === "string" ? JSON.parse(doc.extracted_data) : doc.extracted_data
    ) as ExtractedDataShape;
  }, [doc?.extracted_data]);

  const rawConfirmed = useMemo(() => {
    if (!doc?.confirmed_data) return null;
    return (
      typeof doc.confirmed_data === "string" ? JSON.parse(doc.confirmed_data) : doc.confirmed_data
    ) as ConfirmedDataShape;
  }, [doc?.confirmed_data]);

  // Sync state when dialog opens or document changes
  useEffect(() => {
    if (!doc || !open) {
      setManualBypass(false);
      setSyncMessage("");
      return;
    }

    setFailedPages({});
    setFormError("");

    // Populate AY
    const ay = rawConfirmed?.academic_year || rawExtracted?.academic_year || "";
    setAcademicYear(ay);

    // Populate GA
    const ga =
      rawConfirmed?.general_average != null
        ? String(rawConfirmed.general_average)
        : rawExtracted?.general_average != null
          ? String(rawExtracted.general_average)
          : "";
    setGeneralAverage(ga);

    // Populate Grades
    let rawList: ExtractedGradeRaw[] = [];
    if (Array.isArray(rawConfirmed?.grade_items) && rawConfirmed.grade_items.length > 0) {
      rawList = rawConfirmed.grade_items;
    } else if (Array.isArray(rawExtracted?.grades) && rawExtracted.grades.length > 0) {
      rawList = rawExtracted.grades.filter((g) => {
        const num = Number(g.grade);
        return g.grade != null && g.grade !== "" && !Number.isNaN(num) && num > 0;
      });
    }

    const initialItems: EditableGradeItem[] = rawList.map((g, idx) => ({
      id: `grade-${idx}-${Date.now()}`,
      subject_code: String(g.subject_code || ""),
      subject_name: String(g.subject_name || g.subject_code || `Subject ${idx + 1}`),
      units: g.units != null && !Number.isNaN(Number(g.units)) && Number(g.units) >= 0 ? Number(g.units) : 1,
      grade: g.grade != null && !Number.isNaN(Number(g.grade)) ? Number(g.grade) : "",
      semester: g.semester ? String(g.semester) : undefined,
    }));

    setGradeItems(initialItems);
  }, [doc, open, rawConfirmed, rawExtracted]);

  const isOcrPending =
    doc?.status === "PENDING" && !manualBypass && (!rawConfirmed?.grade_items || rawConfirmed.grade_items.length === 0);

  async function handleRetryOrSync() {
    if (!doc) return;
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await retryDocumentOcr(doc.document_id);
      if (res?.processed || res?.status === "PASSED_PRECHECK") {
        setSyncMessage("AI extraction complete! Refreshing fields...");
      } else {
        setSyncMessage("AI analysis dispatched. Please check again in a few seconds.");
      }
    } catch {
      try {
        const parseurRes = await syncParseur(doc.document_id);
        if (parseurRes?.ocr_data) {
          setSyncMessage("Extraction completed! Reloading data...");
        } else {
          setSyncMessage("Analysis still processing. You can also enter grades manually.");
        }
      } catch {
        setSyncMessage("AI analysis encountered an issue. You can enter grades manually below.");
      }
    } finally {
      setSyncing(false);
    }
  }

  // Track active slide in carousel
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentPage(carouselApi.selectedScrollSnap() + 1);
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (!doc) return null;

  function handlePageFailed(index: number) {
    setFailedPages((prev) => ({
      ...prev,
      [index]: true,
    }));
  }

  async function handleSubmit() {
    if (!doc || isMismatch) return;
    setFormError("");
    const parsedGa = generalAverage.trim() ? Number(generalAverage) : undefined;
    if (parsedGa !== undefined && (Number.isNaN(parsedGa) || parsedGa <= 0 || parsedGa > 100)) {
      setFormError("General Average must be a valid positive number (e.g., 1.00–5.00 or 75–100).");
      return;
    }

    setSubmitting(true);
    try {
      const validGradedItems = gradeItems.filter(
        (i) => i.grade !== "" && !Number.isNaN(Number(i.grade)) && Number(i.grade) > 0 && Number(i.grade) <= 100,
      );

      const payloadGradeItems: GradeItem[] | undefined =
        validGradedItems.length > 0
          ? validGradedItems.map((i) => ({
              subject_code: i.subject_code.trim() || i.subject_name.trim() || "N/A",
              subject_name: i.subject_name.trim() || i.subject_code.trim() || "N/A",
              units: Number(i.units) >= 0 ? Number(i.units) : 1,
              grade: Number(i.grade),
            }))
          : undefined;

      await onConfirm(doc.document_id, {
        academic_year: academicYear.trim() || rawExtracted?.academic_year || undefined,
        general_average: parsedGa ?? (rawExtracted?.general_average ? Number(rawExtracted.general_average) : undefined),
        grade_items: payloadGradeItems,
      });

      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to confirm document.");
    } finally {
      setSubmitting(false);
    }
  }

  // Shared content for OCR metadata, checklist, and verification status
  const renderDataReviewContent = () => (
    <>
      {isOcrPending && !isMismatch ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-sky-50/60 p-5 text-center dark:border-sky-900/40 dark:bg-sky-950/20 sm:p-6">
          <div className="relative mb-3 flex size-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50">
            <Sparkles className="size-6 text-amber-500 animate-pulse" />
            <Loader2 className="absolute size-10 animate-spin text-sky-600 opacity-60" />
          </div>
          <h4 className="text-sm font-semibold text-navy">AI is reading your document...</h4>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
            Our Vision AI is extracting your academic year, general average, and subject grades (10–25s). Please wait a moment.
          </p>
          {syncMessage && <p className="mt-2 text-xs font-medium text-sky-800 dark:text-sky-300">{syncMessage}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs!"
              disabled={syncing}
              onClick={handleRetryOrSync}
            >
              <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Checking..." : "Check Status"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs! text-muted-foreground hover:text-navy"
              onClick={() => setManualBypass(true)}
            >
              Enter manually instead
            </Button>
          </div>
          <div className="mt-6 w-full space-y-2 border-t border-sky-200/60 pt-4 text-left dark:border-sky-900/30">
            <p className="text-[0.7rem] font-medium text-sky-800 dark:text-sky-300">Awaiting extracted information:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-9 animate-pulse rounded-md bg-sky-100/70 dark:bg-sky-900/30" />
              <div className="h-9 animate-pulse rounded-md bg-sky-100/70 dark:bg-sky-900/30" />
            </div>
            <div className="h-16 animate-pulse rounded-md bg-sky-100/50 dark:bg-sky-900/20" />
          </div>
        </div>
      ) : (
        <>
          {isMismatch ? (
            <div className="rounded-xl border border-destructive/30 bg-bad-bg p-4 text-xs text-destructive">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="size-4.5 shrink-0 text-destructive" />
                <span>Document Requirement Mismatch</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-destructive/90">
                {doc.rejection_reason ||
                  (currentYearLevel && currentYearLevel >= 2
                    ? `Students in Year ${currentYearLevel} (2nd to 4th year) are required to submit an official College Transcript of Records (TOR). High School Form 138 / Form 9 cannot be confirmed for your application. Please close this dialog, remove this document, and upload your official TOR.`
                    : "1st-year applicants are only allowed to submit Senior High School Form 138 or Form 9 (SF9). College transcripts (TOR) cannot be confirmed for 1st-year applications. Please close this dialog, remove this document, and upload your high school report card.")}
              </p>
            </div>
          ) : doc.status === "NEEDS_REUPLOAD" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 shrink-0 text-amber-600" />
                  <span className="font-semibold">AI Extraction Notice</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs! gap-1 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
                  onClick={handleRetryOrSync}
                  disabled={syncing}
                >
                  <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Retrying..." : "Retry AI Extraction"}
                </Button>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                {doc.rejection_reason ||
                  "Automatic grade extraction could not read all fields. You can retry AI Extraction, replace the file, or enter your subjects and grades manually below."}
              </p>
            </div>
          ) : null}

          {/* Read-Only Metadata overview if extracted */}
          <ExtractedMetadataView
            extractedData={rawExtracted}
            isReadOnly={true}
            showConfirmedNotice={isReadOnly && !isMismatch}
          />

          {/* Document Verification & Legibility Confirmation Card */}
          <div className="rounded-xl border border-line bg-white p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-[#0a4f42]">
                <FileText className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy">Document Submission Confirmation</h4>
                <p className="text-[11px] text-muted-foreground">
                  Verify your document preview before final submission to the coordinator.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-slate-50/70 border border-slate-200/80 p-3 text-xs text-slate-700">
              <p className="font-semibold text-navy text-[11px] uppercase tracking-wider">Legibility Checklist:</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#0a4f42]" />
                  <span>Document is clear, sharp, upright, and free of glare or blur.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#0a4f42]" />
                  <span>Official school name, registrar stamp, and signature are visible.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#0a4f42]" />
                  <span>All required pages (front and back if applicable) are included.</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3 text-[11px] text-teal-950 flex items-start gap-2">
              <Info className="size-4 text-[#0a4f42] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Advisory:</strong> The system will scan your academic grades and credit units. The Scholarship
                Coordinator and Grantor will review the information alongside your document during evaluation.
              </p>
            </div>
          </div>
        </>
      )}

      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-bad-bg px-3 py-2 text-xs font-medium text-destructive">
          {formError}
        </div>
      )}
    </>
  );

  // -------------------------------------------------------------------------
  // MOBILE VIEW: Smooth Bottom Drawer with Segmented Controls (< 768px)
  // -------------------------------------------------------------------------
  if (isMobile) {
    return (
      <DocumentReviewDrawer
        document={doc}
        open={open}
        onOpenChange={onOpenChange}
        candidatePageUrls={candidatePageUrls}
        validPageUrls={validPageUrls}
        failedPages={failedPages}
        currentPage={currentPage}
        carouselApi={carouselApi}
        setCarouselApi={setCarouselApi}
        onPageFailed={handlePageFailed}
        isMismatch={isMismatch}
        isReadOnly={isReadOnly}
        submitting={submitting}
        onSubmit={handleSubmit}
      >
        {renderDataReviewContent()}
      </DocumentReviewDrawer>
    );
  }

  // -------------------------------------------------------------------------
  // DESKTOP VIEW: 2-Column Side-by-Side Dialog (>= 768px)
  // -------------------------------------------------------------------------
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95dvh] max-h-[95dvh] w-[96vw] max-w-6xl! flex-col gap-0 overflow-hidden p-0 rounded-2xl sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <DialogHeaderBar document={doc} />

        {/* Content Body: Two columns on desktop */}
        <div className="grid min-h-0 flex-1 grid-cols-12 overflow-hidden">
          {/* Left Column: Document Preview */}
          <div className="flex flex-col min-h-0 flex-1 col-span-5 border-r border-border">
            <ScrollArea className="flex-1 min-h-0 h-full">
              <DocumentPreviewCarousel
                document={doc}
                candidatePageUrls={candidatePageUrls}
                validPageUrls={validPageUrls}
                failedPages={failedPages}
                currentPage={currentPage}
                carouselApi={carouselApi}
                setCarouselApi={setCarouselApi}
                onPageFailed={handlePageFailed}
              />
            </ScrollArea>
          </div>

          {/* Right Column: Information Review & Confirmation */}
          <div className="flex flex-col min-h-0 flex-1 col-span-7">
            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="flex flex-col gap-4 p-5">{renderDataReviewContent()}</div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <DialogFooterBar
          isReadOnly={isReadOnly}
          isMismatch={isMismatch}
          submitting={submitting}
          disabled={isMismatch}
          onClose={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
