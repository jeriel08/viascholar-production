"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, FileText, HeartHandshake, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type GradeReport, reviewAcademicAppeal } from "@/lib/api/documents";
import { GrantorAppealConfirmDialog } from "./GrantorAppealConfirmDialog";

interface GrantorAppealDrawerProps {
  report: GradeReport | null;
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export function GrantorAppealDrawer({ report, open, onClose, onReviewed }: GrantorAppealDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [confirmDecision, setConfirmDecision] = useState<"APPROVED" | "DENIED" | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (!open || !report) return null;

  const scholar = report.scholar_profile;
  const rawAppealDocUrl = report.appeal_document?.file_url;
  const isAppealDocUrlValid = Boolean(
    rawAppealDocUrl &&
      (rawAppealDocUrl.startsWith("http://") ||
        rawAppealDocUrl.startsWith("https://") ||
        rawAppealDocUrl.startsWith("blob:") ||
        rawAppealDocUrl.startsWith("data:"))
  );
  const appealDocUrl = isAppealDocUrlValid ? rawAppealDocUrl : null;
  const isPending = report.appeal_status === "PENDING_GRANTOR";

  const handleDecision = async (decision: "APPROVED" | "DENIED") => {
    try {
      setIsSubmitting(true);
      const reportId = report.report_id || report.id;
      if (!reportId) throw new Error("Grade report ID missing.");

      await reviewAcademicAppeal(reportId, {
        decision,
        decision_notes: decisionNotes || undefined,
        grant_probation: decision === "APPROVED",
      });

      toast.success(
        decision === "APPROVED"
          ? "Appeal approved! Scholar has been granted a 1-semester probationary continuation."
          : "Appeal denied. Scholar academic record flagged as disqualified.",
      );
      setDecisionNotes("");
      setConfirmDialogOpen(false);
      setConfirmDecision(null);
      onReviewed();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit appeal decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="size-5 text-[#0a4f42]" />
              <h2 className="text-lg font-bold text-slate-900">Second Chance Academic Appeal Review</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {scholar?.first_name} {scholar?.last_name} • {scholar?.school_name} (AY {report.academic_year} •{" "}
              {report.semester})
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Banner */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900">Academic Standing Flag:</span>
                <Badge variant="outline" className="bg-white text-amber-900 border-amber-300 font-bold text-[10px]">
                  {report.evaluation_flag || "UNDER_REVIEW"}
                </Badge>
              </div>
              <p className="text-amber-800">
                Scholar attained a term GWA of{" "}
                <strong>{Number(report.gpa || report.general_average || 0).toFixed(2)}</strong>, falling below the
                required scholarship retention standard.
              </p>
            </div>
          </div>

          {/* Scholar's Written Appeal */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="size-4 text-[#0a4f42]" />
              Scholar's Statement of Explanation & Commitment
            </h3>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
              {report.appeal_notes || "No written statement submitted."}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Submitted:{" "}
              {report.appeal_submitted_at ? new Date(report.appeal_submitted_at).toLocaleString() : "Recently"}
            </p>
          </div>

          {/* Attached Supporting Proof (if any) */}
          {appealDocUrl && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Supporting Medical / Hardship Evidence</h3>
                <a
                  href={appealDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="h-64 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {appealDocUrl.toLowerCase().includes(".pdf") ? (
                  <iframe src={`${appealDocUrl}#toolbar=0`} className="w-full h-full border-0" title="Appeal proof" />
                ) : (
                  <Image src={appealDocUrl} alt="Appeal proof" fill unoptimized className="object-contain" />
                )}
              </div>
            </div>
          )}

          {/* Grantor Decision Notes */}
          {isPending ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <label htmlFor="grantor-decision-notes" className="text-xs font-bold text-slate-900 block">
                Grantor Decision Notes / Probation Terms (Optional)
              </label>
              <Textarea
                id="grantor-decision-notes"
                placeholder="e.g., Granted 1-semester probationary extension. Scholar must achieve minimum 85.00 GWA next term with no failing marks."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="text-xs min-h-20"
              />
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900">Recorded Decision:</span>
              <p className="text-slate-700 font-medium">Status: {report.appeal_status}</p>
              {report.appeal_decision_notes && <p className="text-slate-600">Notes: {report.appeal_decision_notes}</p>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isPending && (
          <div className="bg-white px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setConfirmDecision("DENIED");
                setConfirmDialogOpen(true);
              }}
              className="h-10 px-4 sm:px-5 rounded-lg border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
            >
              <X className="size-4" />
              <span>Deny Appeal & Disqualify</span>
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setConfirmDecision("APPROVED");
                setConfirmDialogOpen(true);
              }}
              className="h-10 px-4 sm:px-5 rounded-lg bg-[#0a4f42] hover:bg-[#083c32] text-white text-xs sm:text-sm font-semibold gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <CheckCircle2 className="size-4" />
              <span>Grant 1-Semester Probation</span>
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Denial & Probation Approvals */}
      <GrantorAppealConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        decision={confirmDecision}
        scholarName={`${scholar?.first_name || ""} ${scholar?.last_name || ""}`.trim() || "Scholar"}
        academicYear={report.academic_year}
        semester={report.semester}
        computedGwa={Number(report.gpa || report.general_average || 0)}
        decisionNotes={decisionNotes}
        onDecisionNotesChange={setDecisionNotes}
        onConfirm={() => {
          if (confirmDecision) {
            handleDecision(confirmDecision);
          }
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
