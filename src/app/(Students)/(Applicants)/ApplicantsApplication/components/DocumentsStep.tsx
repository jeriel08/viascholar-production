/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type GradeItem,
  retryDocumentOcr,
  type ScholarDocument,
} from "@/lib/api/documents";
import { DocumentListItem } from "./DocumentListItem";
import { DocumentReviewDialog } from "./DocumentReviewDialog";
import { DocumentStatusBanner } from "./DocumentStatusBanner";
import { DocumentUploadCard } from "./DocumentUploadCard";
import {
  getDefaultDocumentType,
  isInvalidOrMismatchedDoc,
  validateChosenFiles,
} from "./wizard-helpers";

interface DocumentsStepProps {
  documents: ScholarDocument[];
  currentYearLevel?: number;
  onUpload: (files: File[], type: string) => Promise<void>;
  onReplace: (id: number, files: File[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onConfirm: (
    id: number,
    data: {
      academic_year?: string;
      general_average?: number;
      grade_items?: GradeItem[];
    },
  ) => Promise<void>;
  onBack: () => void;
  onSubmitApplication: () => void;
  onViewStatus?: () => void;
  hasConfirmed: boolean;
  isSubmitted?: boolean;
  isSubmittingApp?: boolean;
}

export function DocumentsStep({
  documents,
  currentYearLevel = 1,
  onUpload,
  onReplace,
  onDelete,
  onConfirm,
  onBack,
  onSubmitApplication,
  onViewStatus,
  hasConfirmed,
  isSubmitted = false,
  isSubmittingApp = false,
}: DocumentsStepProps) {
  const [picked, setPicked] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScholarDocument | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ScholarDocument | null>(
    null,
  );
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<number | null>(null);
  const [confirmReplaceTarget, setConfirmReplaceTarget] =
    useState<ScholarDocument | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  const targetDocType = getDefaultDocumentType(currentYearLevel);
  const mismatchedDoc = documents.find((d) =>
    isInvalidOrMismatchedDoc(d, currentYearLevel),
  );
  const hasConfirmedDoc =
    hasConfirmed ||
    documents.some(
      (d) => d.status === "STUDENT_CONFIRMED" || d.status === "VERIFIED",
    );
  const hasNeedsReupload = documents.some((d) => d.status === "NEEDS_REUPLOAD");
  const shouldShowUploadCard = !hasConfirmedDoc || hasNeedsReupload;

  async function handleRetryOcr(docId: number) {
    try {
      setRetryingId(docId);
      setError("");
      await retryDocumentOcr(docId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to retry AI extraction.";
      setError(msg);
    } finally {
      setRetryingId(null);
    }
  }

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list);
    const violation = validateChosenFiles(files);
    if (violation) {
      setError(violation);
      return;
    }
    setError("");
    setPicked(files);
  }

  async function handleUpload() {
    if (picked.length === 0) {
      setError("Choose at least one file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      setPhase(
        picked.length > 1
          ? "Uploading files (merging all pages into 1 PDF)..."
          : "Uploading & analyzing...",
      );
      await onUpload(picked, targetDocType);
      setPicked([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload documents.",
      );
    } finally {
      setUploading(false);
      setPhase(null);
    }
  }

  async function handleReplaceSelected(list: FileList | null) {
    if (!list || list.length === 0 || replaceTarget === null) return;
    const files = Array.from(list);
    const violation = validateChosenFiles(files);
    if (violation) {
      setError(violation);
      return;
    }

    setActingId(replaceTarget);
    setError("");
    try {
      await onReplace(replaceTarget, files);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to replace document.",
      );
    } finally {
      setActingId(null);
      setReplaceTarget(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  }

  function handleRequestReplace(doc: ScholarDocument) {
    setConfirmReplaceTarget(doc);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.document_id);
      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete document.",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DocumentStatusBanner
        shouldShowUploadCard={shouldShowUploadCard}
        currentYearLevel={currentYearLevel}
        mismatchedDoc={mismatchedDoc}
      />

      {shouldShowUploadCard && (
        <DocumentUploadCard
          currentYearLevel={currentYearLevel}
          picked={picked}
          onPickFiles={pickFiles}
          onRemovePicked={(f) => setPicked((p) => p.filter((x) => x !== f))}
          onUpload={handleUpload}
          uploading={uploading}
          phase={phase}
          error={error}
          hasConfirmed={hasConfirmed}
          hasDocuments={documents.length > 0}
        />
      )}

      <Card className="rounded-[18px]! border-border bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg! text-navy">
            My documents ({documents.length})
          </CardTitle>
          <CardDescription className="text-sm!">
            Confirm each document so coordinators can verify it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing uploaded yet — your files will appear here.
            </p>
          ) : (
            documents.map((doc) => (
              <DocumentListItem
                key={doc.document_id}
                doc={doc}
                currentYearLevel={currentYearLevel}
                busy={actingId === doc.document_id}
                retrying={retryingId === doc.document_id}
                onReview={setReviewTarget}
                onRetryOcr={handleRetryOcr}
                onRequestReplace={handleRequestReplace}
                onRequestDelete={setDeleteTarget}
              />
            ))
          )}
          <input
            ref={replaceInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => handleReplaceSelected(e.target.files)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 px-5 text-sm! font-medium shadow-xs"
          onClick={onBack}
        >
          Back to Details
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {!isSubmitted && !hasConfirmedDoc && (
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              {documents.some((d) => d.status === "PENDING")
                ? "Analyzing document with AI. Please wait..."
                : documents.some((d) => d.status === "PASSED_PRECHECK")
                  ? "Please review and confirm your extracted grades to submit."
                  : "Upload and confirm your required document to submit your application."}
            </p>
          )}
          {isSubmitted ? (
            <Button
              type="button"
              className="h-11 px-7 text-sm! font-semibold shadow-xs"
              onClick={onViewStatus ?? onBack}
            >
              View Application Status
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 px-7 text-sm! font-semibold shadow-xs"
              disabled={!hasConfirmedDoc || isSubmittingApp}
              onClick={onSubmitApplication}
            >
              {isSubmittingApp
                ? "Submitting application..."
                : "Submit Application"}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReplaceTarget !== null}
        onOpenChange={(open) => !open && setConfirmReplaceTarget(null)}
        title="Replace document?"
        description={
          confirmReplaceTarget
            ? confirmReplaceTarget.status === "PASSED_PRECHECK"
              ? `${confirmReplaceTarget.document_type} has passed AI pre-check. Uploading a new file will discard current extracted grades and restart AI extraction with the new file. Are you sure you want to proceed?`
              : `Uploading a new file will replace ${confirmReplaceTarget.document_type}. Do you want to proceed?`
            : "Uploading a new file will replace this document."
        }
        confirmLabel="Choose New File"
        onConfirm={async () => {
          if (!confirmReplaceTarget) return;
          setReplaceTarget(confirmReplaceTarget.document_id);
          setConfirmReplaceTarget(null);
          setTimeout(() => {
            replaceInputRef.current?.click();
          }, 100);
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.status === "PASSED_PRECHECK"
            ? "Delete pre-checked document?"
            : "Delete document?"
        }
        description={
          deleteTarget
            ? deleteTarget.status === "PASSED_PRECHECK"
              ? `${deleteTarget.document_type}${deleteTarget.file_name ? ` (${deleteTarget.file_name})` : ""} has passed AI pre-check. Deleting it will permanently discard the extracted grades. You will need to upload and extract your document again.`
              : `${deleteTarget.document_type}${deleteTarget.file_name ? ` (${deleteTarget.file_name})` : ""} will be permanently removed.`
            : "This document will be permanently removed."
        }
        confirmLabel="Delete"
        acting={deleting}
        onConfirm={handleDelete}
      />

      <DocumentReviewDialog
        document={reviewTarget}
        currentYearLevel={currentYearLevel}
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && setReviewTarget(null)}
        onConfirm={async (id, data) => {
          setActingId(id);
          try {
            await onConfirm(id, data);
          } finally {
            setActingId(null);
          }
        }}
      />
    </div>
  );
}
