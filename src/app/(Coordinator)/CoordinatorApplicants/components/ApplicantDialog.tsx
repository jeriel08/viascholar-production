/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { AlertCircle, ArrowRight, CalendarClock, FileSignature, FileText, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Applicant, Stage } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ScholarDocument } from "@/lib/api/documents";
import { ApplicantActionDialogs } from "./ApplicantActionDialogs";
import { ApplicantDesktopDetails } from "./ApplicantDesktopDetails";
import { ApplicantDocumentsList } from "./ApplicantDocumentsList";
import { ApplicantEligibilityBanner } from "./ApplicantEligibilityBanner";
import { ApplicantMobileDrawer } from "./ApplicantMobileDrawer";
import { acceptWarning, getStageVariant } from "./applicant-helpers";
import { DocumentVerifyDialog } from "./DocumentVerifyDialog";

interface ApplicantDialogProps {
  applicant: Applicant | null;
  acting: boolean;
  actionError: string | null;
  onClose: () => void;
  onMoveStage: (
    id: number,
    stage: Stage,
    rejectionReason?: string,
    confirmWithoutMeeting?: boolean,
  ) => Promise<void> | void;
  onStagesChanged: (id: number, stage: Stage) => void;
  onMeetingScheduled?: () => void;
}

export function ApplicantDialog({
  applicant,
  acting,
  actionError,
  onClose,
  onMoveStage,
  onStagesChanged,
  onMeetingScheduled,
}: ApplicantDialogProps) {
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [confirmingReopen, setConfirmingReopen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptWarningText, setAcceptWarningText] = useState<string | null>(null);
  const [docsToken, setDocsToken] = useState(0);
  const [verifyingDoc, setVerifyingDoc] = useState<ScholarDocument | null>(null);
  const [loadedDocs, setLoadedDocs] = useState<ScholarDocument[] | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const applicantId = applicant?.id;

  // biome-ignore lint/correctness/useExhaustiveDependencies: applicantId intentionally resets loaded docs on applicant switch
  useEffect(() => {
    setLoadedDocs(null);
  }, [applicantId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: applicantId and stage intentionally reset confirmation state
  useEffect(() => {
    setAcceptWarningText(null);
    setConfirmingReject(false);
    setConfirmingReopen(false);
    setRejectReason("");
    setScheduling(false);
  }, [applicantId, applicant?.stage]);

  function handleClose() {
    setConfirmingReject(false);
    setConfirmingReopen(false);
    setRejectReason("");
    setAcceptWarningText(null);
    setVerifyingDoc(null);
    setLoadedDocs(null);
    setScheduling(false);
    onClose();
  }

  function handleVerifyDone(stage?: Stage) {
    setVerifyingDoc(null);
    setDocsToken((t) => t + 1);
    if (applicant && stage) onStagesChanged(applicant.id, stage);
  }

  function handleScheduleSuccess() {
    setScheduling(false);
    if (applicant) {
      onStagesChanged(applicant.id, "Interview");
    }
    onMeetingScheduled?.();
  }

  const isDocsLoading = loadedDocs === null;
  const hasNoDocs = loadedDocs !== null ? loadedDocs.length === 0 : (applicant?.documentsCount ?? 0) === 0;
  const hasConfirmedDocs = Boolean(
    loadedDocs?.some((d) => d.status === "STUDENT_CONFIRMED" || d.status === "VERIFIED"),
  );
  const canPassToInterview = !isDocsLoading && !hasNoDocs && hasConfirmedDocs;
  const isPastInterview =
    (applicant?.stage as string) === "Endorsed" ||
    (applicant?.stage as string) === "Accepted" ||
    (applicant?.stage as string) === "Approved" ||
    (applicant?.stage as string) === "Scholar" ||
    (applicant?.stage as string) === "Rejected";
  const canSchedule = Boolean(applicant) && !isPastInterview && applicant?.stage === "Interview";
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        applicant && (
          <ApplicantMobileDrawer
            applicant={applicant}
            open={!!applicant}
            onClose={handleClose}
            loadedDocs={loadedDocs}
            docsToken={docsToken}
            setLoadedDocs={setLoadedDocs}
            verifyingDoc={verifyingDoc}
            setVerifyingDoc={setVerifyingDoc}
            handleVerifyDone={handleVerifyDone}
            canSchedule={canSchedule}
            canPassToInterview={canPassToInterview}
            hasNoDocs={hasNoDocs}
            hasConfirmedDocs={hasConfirmedDocs}
            isDocsLoading={isDocsLoading}
            acting={acting}
            actionError={actionError}
            onMoveStage={onMoveStage}
            setScheduling={setScheduling}
            setConfirmingReject={setConfirmingReject}
            setConfirmingReopen={setConfirmingReopen}
            setAcceptWarningText={setAcceptWarningText}
          />
        )
      ) : (
        <Sheet open={!!applicant} onOpenChange={(open) => !open && handleClose()}>
          <SheetContent side="right" className="w-full max-w-6xl! bg-slate-50 p-0 gap-0" showCloseButton={false}>
            {applicant && (
              <>
                {/* Drawer Header */}
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <FileText className="size-5 text-[#0a4f42]" />
                      <h2 className="text-lg font-bold text-slate-900">{applicant.name}</h2>
                      <Badge variant={getStageVariant(applicant.stage)} className="h-6 px-2.5 text-xs!">
                        {applicant.stage}
                      </Badge>
                      {applicant.stage === "Accepted" &&
                        applicant.hasContract &&
                        applicant.contractStatus === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs! font-medium border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            <FileSignature className="size-3.5 text-amber-600 dark:text-amber-400" />
                            Signing Contract
                          </Badge>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {applicant.course} · {applicant.year} · Applied on {applicant.applied}
                    </p>
                  </div>

                  <SheetClose asChild>
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <X className="size-5" />
                    </button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Left: Documents Panel */}
                  <div className="lg:col-span-5 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200 shrink-0">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        Documents uploaded by student
                      </span>
                      <span className="text-xs text-slate-500">
                        {loadedDocs?.length ?? applicant?.documentsCount ?? 0}{" "}
                        {(loadedDocs?.length ?? applicant?.documentsCount ?? 0) === 1 ? "document" : "documents"}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <ApplicantEligibilityBanner
                        applicant={applicant}
                        documents={loadedDocs}
                        onInspectDocument={setVerifyingDoc}
                      />

                      <ApplicantDocumentsList
                        applicationId={applicant.id}
                        refreshToken={docsToken}
                        onVerify={setVerifyingDoc}
                        onDocumentsLoaded={setLoadedDocs}
                      />
                    </div>
                  </div>

                  {/* Right: Applicant Details & Actions */}
                  <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white">
                    <div className="flex-1 overflow-y-auto p-5">
                      <ApplicantDesktopDetails applicant={applicant} />
                    </div>

                    {/* Action Buttons Footer */}
                    <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5 flex flex-col gap-2">
                      {actionError && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{actionError}</p>
                      )}

                      {/* Schedule / Reschedule Meeting button */}
                      {canSchedule && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 text-sm!"
                          disabled={acting}
                          onClick={() => setScheduling(true)}
                        >
                          <CalendarClock className="size-4" />
                          {applicant.hasInterview ? "Reschedule meeting" : "Schedule meeting"}
                        </Button>
                      )}

                      {/* Pass to Interview button (only in Submitted or Under review stages) */}
                      {(applicant.stage === "Submitted" || applicant.stage === "Under review") && (
                        <div className="flex flex-col gap-2">
                          {hasNoDocs && !isDocsLoading && (
                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>Cannot pass applicant to interview: No documents have been submitted yet.</span>
                            </div>
                          )}
                          {!hasNoDocs && !hasConfirmedDocs && !isDocsLoading && (
                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                              <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>
                                Cannot pass applicant to interview: Submitted document(s) have not been confirmed by the
                                applicant yet (awaiting student review).
                              </span>
                            </div>
                          )}
                          <Button
                            type="button"
                            className="h-10 text-sm!"
                            disabled={acting || !canPassToInterview}
                            title={
                              hasNoDocs
                                ? "Applicant has not submitted any documents yet"
                                : !hasConfirmedDocs
                                  ? "Applicant must review and confirm their document first"
                                  : undefined
                            }
                            onClick={async () => {
                              try {
                                await onMoveStage(applicant.id, "Interview");
                                setScheduling(true);
                              } catch {
                                // Handled by actionError in parent
                              }
                            }}
                          >
                            Pass to Interview
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      )}

                      {/* Accept / Endorse Applicant button */}
                      {applicant.stage === "Interview" && (
                        <Button
                          type="button"
                          className="h-10 text-sm!"
                          disabled={acting}
                          onClick={() => {
                            const warning = acceptWarning(applicant.hasInterview, applicant.interviewAt);
                            if (warning) {
                              setAcceptWarningText(warning);
                            } else {
                              onMoveStage(applicant.id, "Endorsed");
                            }
                          }}
                        >
                          Accept applicant
                          <ArrowRight className="size-4" />
                        </Button>
                      )}

                      {/* Reject Application */}
                      {applicant.stage !== "Rejected" &&
                        applicant.stage !== "Accepted" &&
                        applicant.stage !== "Endorsed" && (
                          <Button
                            type="button"
                            variant="destructive"
                            className="h-10 text-sm!"
                            disabled={acting}
                            onClick={() => setConfirmingReject(true)}
                          >
                            Reject application
                          </Button>
                        )}

                      {/* Reopen Application (e.g. after successful inquiry) */}
                      {applicant.stage === "Rejected" && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3">
                          <div className="text-xs text-muted-foreground">
                            <p className="font-semibold text-navy">Application is currently marked as Rejected</p>
                            <p>
                              If an applicant inquiry or clarification was accepted, you can reopen this application for
                              evaluation.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-4 text-xs! font-semibold border-navy/30 text-navy hover:bg-navy/5 shrink-0 gap-1.5"
                            disabled={acting}
                            onClick={() => setConfirmingReopen(true)}
                          >
                            <RotateCcw className="size-3.5" />
                            <span>Reopen Application</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      )}

      {!isMobile && (
        <DocumentVerifyDialog
          document={verifyingDoc}
          applicantName={applicant?.name ?? ""}
          open={verifyingDoc !== null}
          onOpenChange={(open) => !open && setVerifyingDoc(null)}
          onDone={handleVerifyDone}
        />
      )}

      <ApplicantActionDialogs
        applicant={applicant}
        acting={acting}
        confirmingReject={confirmingReject}
        setConfirmingReject={setConfirmingReject}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmingReopen={confirmingReopen}
        setConfirmingReopen={setConfirmingReopen}
        acceptWarningText={acceptWarningText}
        setAcceptWarningText={setAcceptWarningText}
        scheduling={scheduling}
        setScheduling={setScheduling}
        onMoveStage={onMoveStage}
        handleScheduleSuccess={handleScheduleSuccess}
      />
    </>
  );
}
