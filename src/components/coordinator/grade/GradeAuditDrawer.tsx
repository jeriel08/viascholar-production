"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, GraduationCap, ShieldAlert, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type GradeItem,
  getDocument,
  requestDocumentChanges,
  type ScholarDocument,
  verifyDocument,
} from "@/lib/api/documents";
import { getSettings } from "@/lib/api/settings";
import { GradeAuditSkeleton } from "./GradeAuditSkeleton";
import { GradeAuditSubjectsTable } from "./GradeAuditSubjectsTable";
import { GradeFlagAppealConfirmDialog } from "./GradeFlagAppealConfirmDialog";
import { GradeGradingSystemLegend } from "./GradeGradingSystemLegend";
import { GradeRequestChangesDialog } from "./GradeRequestChangesDialog";

interface GradeAuditDrawerProps {
  documentId: number | null;
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export function GradeAuditDrawer({ documentId, open, onClose, onReviewed }: GradeAuditDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<ScholarDocument | null>(null);
  const [gradeThreshold, setGradeThreshold] = useState<number>(90);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [academicYear, setAcademicYear] = useState<string>("2025-2026");
  const [semester, setSemester] = useState<string>("2nd Semester");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [flagAppealDialogOpen, setFlagAppealDialogOpen] = useState(false);
  const [coordinatorNotes, setCoordinatorNotes] = useState("");

  useEffect(() => {
    if (!documentId || !open) return;
    async function loadData() {
      try {
        setLoading(true);
        const [data, settings] = await Promise.all([
          getDocument(documentId as number),
          getSettings().catch(() => ({ grade_threshold: 90 })),
        ]);
        setDoc(data);
        if (settings?.grade_threshold) {
          setGradeThreshold(Number(settings.grade_threshold));
        }

        const extracted = (data.confirmed_data || data.extracted_data || {}) as Record<string, unknown>;
        if (typeof extracted.academic_year === "string") setAcademicYear(extracted.academic_year);
        if (typeof extracted.semester === "string") setSemester(extracted.semester);

        const items = Array.isArray(extracted.grade_items)
          ? (extracted.grade_items as GradeItem[])
          : Array.isArray(extracted.subjects)
            ? (extracted.subjects as GradeItem[])
            : [];

        setGradeItems(
          items.map((item) => ({
            subject_code: item.subject_code || "",
            subject_name: item.subject_name || "",
            units: Number(item.units) || 3,
            grade: Number(item.grade) || 0,
          })),
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load document details.");
        onClose();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [documentId, open, onClose]);

  const { totalUnits, computedGwa } = useMemo(() => {
    let unitsSum = 0;
    let weightedSum = 0;
    for (const item of gradeItems) {
      const u = Number(item.units) || 0;
      const g = Number(item.grade) || 0;
      if (u > 0 && g > 0) {
        unitsSum += u;
        weightedSum += u * g;
      }
    }
    const gwa = unitsSum > 0 ? weightedSum / unitsSum : 0;
    return { totalUnits: unitsSum, computedGwa: gwa };
  }, [gradeItems]);

  const scholar = doc?.scholar_profile;
  const scholarName = scholar ? `${scholar.first_name || ""} ${scholar.last_name || ""}`.trim() : "Scholar";
  const schoolGrading = scholar?.school_grading_system;

  const isPassingGrade = useCallback(
    (grade: number) => {
      if (Number.isNaN(grade) || grade <= 0) return true;
      const highestGrade = schoolGrading?.highest_grade != null ? Number(schoolGrading.highest_grade) : undefined;
      const passingGrade = schoolGrading?.passing_grade != null ? Number(schoolGrading.passing_grade) : undefined;
      const failingGrade = schoolGrading?.failing_grade != null ? Number(schoolGrading.failing_grade) : undefined;

      if (highestGrade != null && passingGrade != null) {
        if (highestGrade < (failingGrade ?? 5.0)) {
          // Inverted 5-point scale (e.g. 1.0 highest, 3.0 passing)
          return grade <= passingGrade && grade >= highestGrade;
        }
        // Direct 4-point scale or percentage scale
        return grade >= passingGrade && grade <= highestGrade;
      }

      if (grade <= 5.0 && grade >= 1.0) {
        return grade <= 3.0;
      }
      return grade >= 75.0;
    },
    [schoolGrading],
  );

  const isGwaPassing = useCallback(
    (gwa: number, thresholdPercent: number) => {
      if (gwa <= 0) return true;
      const scale = schoolGrading?.grading_scale;
      if (scale === "NUMERIC_4_POINT") {
        const requiredGwa =
          thresholdPercent <= 90
            ? 2.0 + ((thresholdPercent - 75) / 15) * 1.5
            : 3.5 + ((thresholdPercent - 90) / 10) * 0.5;
        return gwa >= requiredGwa;
      }
      if (scale === "NUMERIC_5_POINT" || scale === "NUMERIC_1_POINT_PASSING") {
        const requiredGwa = 3.0 - (thresholdPercent - 75) * (2.0 / 25);
        return gwa <= requiredGwa;
      }
      return gwa >= thresholdPercent;
    },
    [schoolGrading],
  );

  const failedSubjects = useMemo(() => {
    return gradeItems.filter((item) => {
      const g = Number(item.grade);
      return !Number.isNaN(g) && g > 0 && !isPassingGrade(g);
    });
  }, [gradeItems, isPassingGrade]);

  const isGwaDeficient = useMemo(() => {
    return computedGwa > 0 && !isGwaPassing(computedGwa, gradeThreshold);
  }, [computedGwa, gradeThreshold, isGwaPassing]);

  const hasDeficiency = failedSubjects.length > 0 || isGwaDeficient;

  const failedSubjectsSummary = useMemo(() => {
    return failedSubjects.map((s) => `${s.subject_code || s.subject_name} (${Number(s.grade).toFixed(2)})`).join(", ");
  }, [failedSubjects]);

  if (!open || !documentId) return null;

  const handleVerify = async () => {
    if (gradeItems.length === 0) {
      toast.error("Please ensure at least one subject grade is present before verifying.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await verifyDocument(documentId, {
        academic_year: academicYear,
        semester: semester,
        general_average: computedGwa,
        grade_items: gradeItems,
        notes: coordinatorNotes || undefined,
      });
      toast.success(
        res.isEligible
          ? "Grades verified successfully! Scholar is cleared for the next term."
          : "Grades recorded. Scholar flagged as Under Review / Academic Appeal required.",
      );
      setFlagAppealDialogOpen(false);
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify grades.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    try {
      setIsSubmitting(true);
      await requestDocumentChanges(documentId, coordinatorNotes);
      toast.success("Correction request sent to scholar.");
      setRequestChangesOpen(false);
      setCoordinatorNotes("");
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawFileUrl = doc?.file_url;
  const isFileUrlValid = Boolean(
    rawFileUrl &&
      (rawFileUrl.startsWith("http://") ||
        rawFileUrl.startsWith("https://") ||
        rawFileUrl.startsWith("blob:") ||
        rawFileUrl.startsWith("data:"))
  );
  const fileUrl = isFileUrlValid ? rawFileUrl : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-6xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <GraduationCap className="size-5 text-[#0a4f42]" />
              <h2 className="text-lg font-bold text-slate-900">Certified Copy of Grades (CCG) Audit</h2>
              {scholar && (
                <Badge
                  variant="outline"
                  className="bg-[#0a4f42]/10 text-[#0a4f42] border-[#0a4f42]/30 text-xs font-bold"
                >
                  {scholarName} {scholar.student_number ? `(${scholar.student_number})` : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {scholar?.course_of_study ? `${scholar.course_of_study} • ` : ""}
              AY {academicYear} • {semester} • {doc?.document_type || "CCG"} • Uploaded{" "}
              {doc?.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {loading || !doc ? (
          <GradeAuditSkeleton />
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Document Preview */}
            <div className="lg:col-span-6 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
                <span className="text-xs font-semibold text-slate-300">Document Scan</span>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                  >
                    <span>Open External</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <div className="flex-1 p-2 bg-slate-950 flex items-center justify-center overflow-auto relative">
                {fileUrl ? (
                  fileUrl.toLowerCase().includes(".pdf") ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-full rounded-md border-0"
                      title="CCG preview"
                    />
                  ) : (
                    <Image src={fileUrl} alt="Uploaded CCG" fill unoptimized className="object-contain rounded-md" />
                  )
                ) : (
                  <p className="text-xs text-slate-500">
                    {rawFileUrl ? "Document preview unavailable (file URL not found or inaccessible)." : "No document preview available."}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Grade Verification Panel */}
            <div className="lg:col-span-6 flex flex-col h-full overflow-hidden p-5 space-y-4 bg-white">
              {/* Metric Strip */}
              <div className="grid grid-cols-3 gap-2.5 shrink-0">
                <div className="bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Total Units</span>
                  <span className="text-base font-black text-[#0a4f42]">{totalUnits.toFixed(1)}</span>
                </div>
                <div
                  className={`border p-2.5 rounded-xl text-center ${
                    isGwaDeficient ? "bg-rose-50/70 border-rose-200" : "bg-emerald-50/70 border-emerald-100"
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold block ${
                      isGwaDeficient ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    Computed GWA
                  </span>
                  <span className={`text-base font-black ${isGwaDeficient ? "text-rose-900" : "text-emerald-900"}`}>
                    {computedGwa > 0 ? computedGwa.toFixed(2) : "—"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Status</span>
                  <Badge variant="outline" className="mt-1 text-[10px] font-bold">
                    {doc.status}
                  </Badge>
                </div>
              </div>

              {/* Grading System Legend */}
              <GradeGradingSystemLegend
                schoolName={scholar?.school_name}
                schoolGrading={schoolGrading}
                gradeThreshold={gradeThreshold}
              />

              {/* Real-time Academic Standing Banner */}
              {hasDeficiency ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 flex items-start gap-2.5 shrink-0">
                  <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-rose-900">
                    <span className="font-bold block">
                      Academic Deficiencies Detected (
                      {failedSubjects.length > 0
                        ? `${failedSubjects.length} failed subject${failedSubjects.length > 1 ? "s" : ""}`
                        : "GWA below retention standard"}
                      )
                    </span>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      Certifying this CCG will record these grades and notify the scholar to submit an{" "}
                      <span className="font-semibold underline">Academic Second Chance Appeal</span> for Grantor review.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-900">
                    All subjects passed • Good Academic Standing
                  </span>
                </div>
              )}

              {/* Subjects Table */}
              <GradeAuditSubjectsTable
                items={gradeItems}
                onChange={setGradeItems}
                disabled={isSubmitting}
                passingGrade={schoolGrading?.passing_grade ? Number(schoolGrading.passing_grade) : undefined}
                highestGrade={schoolGrading?.highest_grade ? Number(schoolGrading.highest_grade) : undefined}
                failingGrade={schoolGrading?.failing_grade ? Number(schoolGrading.failing_grade) : undefined}
              />

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 mt-auto flex items-center justify-between gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => {
                    setCoordinatorNotes("");
                    setRequestChangesOpen(true);
                  }}
                  className="h-9.5 rounded-xl border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 text-xs font-semibold px-3.5"
                >
                  Request Correction
                </Button>

                {hasDeficiency ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setCoordinatorNotes("");
                      setFlagAppealDialogOpen(true);
                    }}
                    className="h-9.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 gap-1.5 shadow-xs"
                  >
                    <ShieldAlert className="size-4" />
                    <span>Record & Flag for Academic Appeal</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleVerify}
                    className="h-9.5 rounded-xl bg-[#0a4f42] hover:bg-[#083c32] text-white text-xs font-bold px-5 gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve & Clear Standing</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <GradeRequestChangesDialog
        open={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        notes={coordinatorNotes}
        onNotesChange={setCoordinatorNotes}
        onConfirm={handleRequestChanges}
        isSubmitting={isSubmitting}
      />

      <GradeFlagAppealConfirmDialog
        open={flagAppealDialogOpen}
        onOpenChange={setFlagAppealDialogOpen}
        scholarName={scholarName}
        failedCount={failedSubjects.length}
        failedSubjectsText={failedSubjectsSummary}
        isGwaDeficient={isGwaDeficient}
        computedGwa={computedGwa}
        notes={coordinatorNotes}
        onNotesChange={setCoordinatorNotes}
        onConfirm={handleVerify}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
