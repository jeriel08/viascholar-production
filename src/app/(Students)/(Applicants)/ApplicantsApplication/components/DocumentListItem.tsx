"use client";

import { AlertCircle, Check, Eye, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ScholarDocument } from "@/lib/api/documents";
import { docStatusMeta, formatDateTime, isInvalidOrMismatchedDoc } from "./wizard-helpers";

const CONFIRMABLE = ["PENDING", "PASSED_PRECHECK", "NEEDS_REUPLOAD"];

interface DocumentListItemProps {
  doc: ScholarDocument;
  currentYearLevel: number;
  busy: boolean;
  retrying: boolean;
  onReview: (doc: ScholarDocument) => void;
  onRetryOcr: (docId: number) => void;
  onRequestReplace: (doc: ScholarDocument) => void;
  onRequestDelete: (doc: ScholarDocument) => void;
}

export function DocumentListItem({
  doc,
  currentYearLevel,
  busy,
  retrying,
  onReview,
  onRetryOcr,
  onRequestReplace,
  onRequestDelete,
}: DocumentListItemProps) {
  const meta = docStatusMeta(doc.status);
  const confirmable = CONFIRMABLE.includes(doc.status);
  const isLocked = doc.status === "STUDENT_CONFIRMED" || doc.status === "VERIFIED";

  // Check if document type fundamentally contradicts applicant's year level or was flagged as invalid type
  const isMismatch = isInvalidOrMismatchedDoc(doc, currentYearLevel);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-3.5 sm:p-4 shadow-2xs transition-colors hover:border-border/80">
      {/* Top Header: Document Title, Status Badge, and File Details */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm sm:text-base font-bold text-navy leading-snug">{doc.document_type}</h4>
          {doc.status !== "PENDING" && (
            <Badge
              variant={isMismatch ? "destructive" : meta.variant}
              className="h-5.5 px-2.5 text-xs! font-medium shrink-0"
            >
              {isMismatch ? "Invalid Doc Type" : meta.label}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {doc.file_name && (
            <>
              <span className="font-medium text-navy/80 break-all" title={doc.file_name}>
                {doc.file_name}
              </span>
              <span className="text-muted-foreground/60">·</span>
            </>
          )}
          <span className="whitespace-nowrap">Uploaded {formatDateTime(doc.uploaded_at)}</span>
        </div>
      </div>

      {/* Status Messages & Notices */}
      {doc.status === "PENDING" && (
        <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
          <Sparkles className="size-3.5 shrink-0 text-amber-500 animate-pulse" />
          <span>Analyzing document and extracting grades (15–30s). Please wait...</span>
        </div>
      )}

      {isMismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-bad-bg p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <span className="leading-relaxed">
            {doc.rejection_reason ||
              (currentYearLevel >= 2
                ? "High School Form 138 / Form 9 is not accepted for Year 2–4 applicants. Please remove this and upload your College Transcript of Records (TOR)."
                : "College TOR is not accepted for 1st-year applicants. Please remove this and upload your Senior High School Form 138 or Form 9.")}
          </span>
        </div>
      )}

      {!isMismatch && doc.status === "NEEDS_REUPLOAD" && doc.rejection_reason && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-bad-bg p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <span className="leading-relaxed">
            {doc.rejection_reason.includes("AI") ? "Notice: " : "Coordinator: "}
            {doc.rejection_reason}
          </span>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial">
          {doc.status === "PENDING" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs! text-navy border-sky-300 bg-sky-50/50 hover:bg-sky-100/60 dark:border-sky-800 dark:bg-sky-950/30 flex-1 sm:flex-initial"
              onClick={() => onReview(doc)}
              disabled={busy}
            >
              <Loader2 className="size-3.5 animate-spin text-sky-600" />
              View Progress
            </Button>
          ) : isMismatch ? (
            <div className="grid grid-cols-3 gap-2 w-full sm:flex sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs! text-navy w-full sm:w-auto"
                onClick={() => onReview(doc)}
                title="View uploaded document"
              >
                <Eye className="size-3.5" />
                <span>View</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs! text-navy w-full sm:w-auto"
                onClick={() => onRequestReplace(doc)}
                disabled={busy}
                title="Replace with correct document"
              >
                <RefreshCw className="size-3.5" />
                <span>Replace</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 gap-1.5 text-xs! w-full sm:w-auto"
                onClick={() => onRequestDelete(doc)}
                disabled={busy}
                title="Remove invalid document"
              >
                <Trash2 className="size-3.5" />
                <span>Remove</span>
              </Button>
            </div>
          ) : doc.status === "NEEDS_REUPLOAD" ? (
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs! text-navy border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 dark:border-amber-800 dark:bg-amber-950/30 w-full sm:w-auto"
                onClick={() => onRetryOcr(doc.document_id)}
                disabled={busy || retrying}
                title="Retry AI OCR analysis"
              >
                {retrying ? (
                  <Loader2 className="size-3.5 animate-spin text-amber-600" />
                ) : (
                  <Sparkles className="size-3.5 text-amber-600" />
                )}
                {retrying ? "Retrying..." : "Retry AI"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 text-xs! w-full sm:w-auto"
                onClick={() => onReview(doc)}
                disabled={busy}
              >
                <Check className="size-3.5" />
                Enter Manually
              </Button>
            </div>
          ) : confirmable ? (
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs! shadow-xs flex-1 sm:flex-initial"
              onClick={() => onReview(doc)}
              disabled={busy}
            >
              <Check className="size-3.5" />
              {busy ? "Confirming..." : "Review & Confirm"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs! text-navy flex-1 sm:flex-initial"
              onClick={() => onReview(doc)}
            >
              <Eye className="size-3.5" />
              View Document
            </Button>
          )}
        </div>

        {!isLocked && !isMismatch && (
          <TooltipProvider delayDuration={150}>
            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Replace ${doc.document_type} (select file or files)`}
                    className="size-8 text-muted-foreground hover:text-navy cursor-pointer"
                    onClick={() => onRequestReplace(doc)}
                    disabled={busy}
                  >
                    <RefreshCw className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Replace file</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Delete ${doc.document_type}`}
                    className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => onRequestDelete(doc)}
                    disabled={busy}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete document</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
