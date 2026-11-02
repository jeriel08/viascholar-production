"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Eye,
  FileSignature,
  FileText,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ApplicantDocumentsList } from "@/app/(Coordinator)/CoordinatorApplicants/components/ApplicantDocumentsList";
import { ApplicantEligibilityBanner } from "@/app/(Coordinator)/CoordinatorApplicants/components/ApplicantEligibilityBanner";
import {
  acceptWarning,
  formatGwa,
  getStageVariant,
  gwaSourceTitle,
} from "@/app/(Coordinator)/CoordinatorApplicants/components/applicant-helpers";
import { DocumentVerifyDialog } from "@/app/(Coordinator)/CoordinatorApplicants/components/DocumentVerifyDialog";
import { ScheduleMeetingDialog } from "@/app/(Grantor)/grantMeeting/components/ScheduleMeetingDialog";
import type { Applicant, Stage } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { type Contract, listContracts } from "@/lib/api/contracts";
import type { ScholarDocument } from "@/lib/api/documents";
import { CreateContractDialog } from "./CreateContractDialog";
import { GrantAcceptSafeguardDialog } from "./GrantAcceptSafeguardDialog";
import { GrantRejectDialog } from "./GrantRejectDialog";
import { GrantReopenDialog } from "./GrantReopenDialog";

interface GrantApplicantDialogProps {
  applicant: Applicant | null;
  acting: boolean;
  actionError: string | null;
  onClose: () => void;
  onMoveStage: (id: number, stage: Stage, rejectionReason?: string, confirmWithoutMeeting?: boolean) => void;
  onStagesChanged: (id: number, stage: Stage) => void;
  onMeetingScheduled: () => void;
  onContractCreated?: (contract: Contract) => void;
}

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80";

function DetailItem({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground" title={title}>
        {value}
      </p>
    </div>
  );
}

export function GrantApplicantDialog({
  applicant,
  acting,
  actionError,
  onClose,
  onMoveStage,
  onStagesChanged,
  onMeetingScheduled,
  onContractCreated,
}: GrantApplicantDialogProps) {
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [confirmingReopen, setConfirmingReopen] = useState(false);
  const [acceptWarningText, setAcceptWarningText] = useState<string | null>(null);
  const [docsToken, setDocsToken] = useState(0);
  const [verifyingDoc, setVerifyingDoc] = useState<ScholarDocument | null>(null);
  const [loadedDocs, setLoadedDocs] = useState<ScholarDocument[] | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);
  const [existingContract, setExistingContract] = useState<Contract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Fetch existing contracts whenever the applicant's profile changes
  useEffect(() => {
    if (!applicant?.profileId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingContract(null);
      return;
    }
    let isMounted = true;
    setLoadingContract(true);
    listContracts()
      .then((contracts) => {
        if (isMounted) {
          const found = contracts.find((c) => c.scholar_profile_id === applicant.profileId);
          setExistingContract(found ?? null);
        }
      })
      .catch((err) => {
        console.error("Failed to load existing contract:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingContract(false);
      });

    return () => {
      isMounted = false;
    };
  }, [applicant?.profileId]);

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
    setScheduling(false);
    setCreatingContract(false);
  }, [applicantId, applicant?.stage]);

  function handleClose() {
    setConfirmingReject(false);
    setConfirmingReopen(false);
    setAcceptWarningText(null);
    setVerifyingDoc(null);
    setLoadedDocs(null);
    setScheduling(false);
    setCreatingContract(false);
    onClose();
  }

  function handleVerifyDone(stage?: Stage) {
    setVerifyingDoc(null);
    setDocsToken((t) => t + 1);
    if (applicant && stage) onStagesChanged(applicant.id, stage);
  }

  function handleScheduleSuccess() {
    setScheduling(false);
    onMeetingScheduled();
  }

  const isDocsLoading = loadedDocs === null;
  const hasNoDocs = loadedDocs !== null ? loadedDocs.length === 0 : (applicant?.documentsCount ?? 0) === 0;
  const hasConfirmedDocs = Boolean(
    loadedDocs?.some((d) => d.status === "STUDENT_CONFIRMED" || d.status === "VERIFIED"),
  );
  const canSchedule = Boolean(applicant) && (applicant?.stage === "Endorsed" || applicant?.stage === "Interview");

  return (
    <>
      <Sheet open={!!applicant} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-6xl!" showCloseButton={false}>
          {applicant && (
            <>
              {/* Drawer Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-6 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-4.5" />
                    </span>
                    <h2 className="text-base font-semibold text-foreground">{applicant.name}</h2>
                    <Badge
                      variant={getStageVariant(applicant.stage)}
                      className="h-6 rounded-full px-2.5 text-xs! font-medium"
                    >
                      {applicant.stage}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {applicant.course} · {applicant.year} · Applied on {applicant.applied}
                  </p>
                </div>

                <SheetClose asChild>
                  <button
                    type="button"
                    className="shrink-0 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4.5" />
                  </button>
                </SheetClose>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-12">
                {/* Left: Documents Panel */}
                <div className="flex h-full flex-col overflow-hidden border-b border-border/70 lg:col-span-5 lg:border-b-0 lg:border-r">
                  <div className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <FileText className="size-3.5 text-muted-foreground" />
                      Documents uploaded by student
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {loadedDocs?.length ?? applicant?.documentsCount ?? 0}{" "}
                      {(loadedDocs?.length ?? applicant?.documentsCount ?? 0) === 1 ? "document" : "documents"}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-5">
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
                <div className="flex h-full flex-col overflow-hidden lg:col-span-7">
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-5 p-6">
                      {(applicant.stage === "Submitted" || applicant.stage === "Under review") && (
                        <>
                          {hasNoDocs && !isDocsLoading && (
                            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
                              <AlertCircle className="size-4 shrink-0" />
                              <span>Cannot pass applicant to interview: No documents have been submitted yet.</span>
                            </div>
                          )}
                          {!hasNoDocs && !hasConfirmedDocs && !isDocsLoading && (
                            <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
                              <AlertCircle className="size-4 shrink-0" />
                              <span>
                                Cannot pass applicant to interview: Submitted document(s) have not been confirmed by the
                                applicant yet (awaiting student review).
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Academic & Institution Information */}
                      <div className="space-y-4 rounded-xl border border-border/70 bg-card p-5">
                        <p className={SECTION_LABEL}>Academic & Institution Details</p>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                          <DetailItem label="Scholarship Track" value={applicant.track || "—"} />
                          <DetailItem label="Program" value={applicant.course || "—"} />
                          <DetailItem label="Current Year Level" value={applicant.year || "—"} />
                          <DetailItem
                            label="General Weighted Average (GWA)"
                            value={applicant.gwa !== null ? formatGwa(applicant.gwa) : "—"}
                            title={gwaSourceTitle(applicant.gwaSource)}
                          />
                          <DetailItem label="School Name" value={applicant.schoolName || "—"} />
                          <div className="sm:col-span-2 md:col-span-1">
                            <DetailItem label="School Address" value={applicant.schoolAddress || "—"} />
                          </div>
                        </dl>
                      </div>

                      {/* Personal, Contact & Affiliation Details */}
                      <div className="space-y-4 rounded-xl border border-border/70 bg-card p-5">
                        <p className={SECTION_LABEL}>Personal, Contact & Affiliation Details</p>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                          <DetailItem label="Student Number" value={applicant.studentNumber || "—"} />
                          <DetailItem label="Phone Number" value={applicant.phoneNumber || "—"} />
                          <DetailItem label="Home Address" value={applicant.studentAddress || "—"} />
                          <DetailItem
                            label="Relative Employed By Partner"
                            value={applicant.relativeEmployee || "None / N/A"}
                          />
                        </dl>
                      </div>

                      {/* Scholarship Agreement / Contract */}
                      {applicant.stage === "Accepted" && (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3.5 sm:items-center">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                {loadingContract ? (
                                  <Loader2 className="size-5 animate-spin" />
                                ) : (
                                  <FileSignature className="size-5" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold text-foreground">Scholarship Agreement</h4>
                                  {existingContract && (
                                    <Badge
                                      variant="outline"
                                      className={`rounded-full text-[0.65rem]! font-semibold ${
                                        existingContract.status === "SIGNED"
                                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                          : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                      }`}
                                    >
                                      {existingContract.status === "SIGNED" ? "Signed & Active" : "Awaiting Signature"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {existingContract
                                    ? `Contract #${existingContract.contract_number} has been generated (${existingContract.status === "SIGNED" ? "Signed by student" : "Awaiting student signature"}).`
                                    : "Application is approved. You can now issue the digital scholarship contract."}
                                </p>
                                {existingContract?.effective_date && (
                                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                                    Effective: {existingContract.effective_date}
                                    {existingContract.expiry_date ? ` · Expiry: ${existingContract.expiry_date}` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                            {existingContract &&
                              (existingContract.signed_document_url || existingContract.document_url) && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-xs! font-medium"
                                    onClick={() =>
                                      window.open(
                                        existingContract.signed_document_url || existingContract.document_url || "",
                                        "_blank",
                                      )
                                    }
                                  >
                                    <Eye className="size-3.5" />
                                    <span>View PDF</span>
                                  </Button>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Endorsed / Interview Stage Status Info */}
                      {(applicant.stage === "Interview" || applicant.stage === "Endorsed") && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
                          <div className="flex items-center gap-2.5">
                            <CalendarClock className="size-4 shrink-0 text-primary" />
                            <span>
                              {applicant.hasInterview && applicant.interviewAt ? (
                                <>
                                  Interview scheduled on{" "}
                                  <strong>
                                    {new Date(applicant.interviewAt).toLocaleString(undefined, {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </strong>
                                </>
                              ) : applicant.stage === "Endorsed" ? (
                                <>
                                  Applicant is <strong>Endorsed by Coordinator</strong> (ready for Grantor interview &
                                  review)
                                </>
                              ) : (
                                <>
                                  Applicant is in <strong>Interview Stage</strong> (no meeting scheduled yet)
                                </>
                              )}
                            </span>
                          </div>
                          {applicant.hasInterview && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-primary/30 bg-card text-[0.65rem]! text-primary"
                            >
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="shrink-0 border-t border-border/70 bg-card/90 px-6 py-4 backdrop-blur-xs">
                    {actionError && (
                      <p className="mb-3 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                        {actionError}
                      </p>
                    )}

                    {applicant.stage === "Rejected" ? (
                      <div className="flex w-full flex-col items-stretch justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5 sm:flex-row sm:items-center">
                        <div className="text-xs text-muted-foreground">
                          <p className="font-semibold text-foreground">Application is currently marked as Rejected</p>
                          <p className="mt-0.5">
                            If an applicant inquiry or clarification was accepted, you can reopen this application for
                            evaluation.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 shrink-0 gap-1.5 rounded-xl border-primary/30 px-3.5 text-xs! font-semibold text-primary hover:bg-primary/5"
                          disabled={acting}
                          onClick={() => setConfirmingReopen(true)}
                        >
                          <RotateCcw className="size-3.5" />
                          <span>Reopen Application</span>
                        </Button>
                      </div>
                    ) : applicant.stage === "Accepted" ? (
                      <div className="flex items-center justify-end gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9.5 rounded-xl text-xs! font-medium"
                          onClick={() => handleClose()}
                        >
                          Close
                        </Button>
                        <Button
                          type="button"
                          className="h-9.5 gap-1.5 rounded-xl text-xs! font-semibold"
                          onClick={() => setCreatingContract(true)}
                        >
                          <FileSignature className="size-3.5" />
                          <span>{existingContract ? "Re-issue Contract" : "Issue Scholarship Contract"}</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9.5 rounded-xl px-4 text-xs! font-medium border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 w-full sm:w-auto"
                            disabled={acting}
                            onClick={() => setConfirmingReject(true)}
                          >
                            Reject application
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2.5">
                          {canSchedule && (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9.5 rounded-xl px-4 text-xs! font-medium gap-1.5"
                              disabled={acting}
                              onClick={() => setScheduling(true)}
                            >
                              <CalendarClock className="size-3.5" />
                              {applicant.hasInterview ? "Reschedule meeting" : "Schedule meeting"}
                            </Button>
                          )}

                          {(applicant.stage === "Submitted" || applicant.stage === "Under review") && (
                            <Button
                              type="button"
                              className="h-9.5 rounded-xl px-5 text-xs! font-medium gap-1.5"
                              disabled={acting || isDocsLoading || hasNoDocs || !hasConfirmedDocs}
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
                              <ArrowRight className="size-3.5" />
                            </Button>
                          )}

                          {(applicant.stage === "Interview" || applicant.stage === "Endorsed") && (
                            <Button
                              type="button"
                              className="h-9.5 rounded-xl px-5 text-xs! font-semibold gap-1.5 bg-[#1b4332] hover:bg-[#143225] text-white shadow-xs"
                              disabled={acting}
                              onClick={() => {
                                const warning = acceptWarning(applicant.hasInterview, applicant.interviewAt);
                                if (warning) {
                                  setAcceptWarningText(warning);
                                } else {
                                  onMoveStage(applicant.id, "Accepted");
                                }
                              }}
                            >
                              Accept applicant
                              <ArrowRight className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <GrantAcceptSafeguardDialog
        warningText={acceptWarningText}
        onClose={() => setAcceptWarningText(null)}
        onConfirm={async () => {
          if (applicant) {
            setAcceptWarningText(null);
            await onMoveStage(applicant.id, "Accepted", undefined, true);
          }
        }}
      />

      <GrantRejectDialog
        open={confirmingReject}
        acting={acting}
        onClose={() => setConfirmingReject(false)}
        onConfirm={(reason) => {
          if (applicant) {
            onMoveStage(applicant.id, "Rejected", reason);
            setConfirmingReject(false);
          }
        }}
      />

      <GrantReopenDialog
        open={confirmingReopen}
        applicantName={applicant?.name}
        onClose={() => setConfirmingReopen(false)}
        onConfirm={async () => {
          if (applicant) {
            setConfirmingReopen(false);
            await onMoveStage(applicant.id, "Under review");
          }
        }}
      />

      <DocumentVerifyDialog
        document={verifyingDoc}
        applicantName={applicant?.name ?? ""}
        open={verifyingDoc !== null}
        onOpenChange={(open) => !open && setVerifyingDoc(null)}
        onDone={handleVerifyDone}
      />
      <ScheduleMeetingDialog
        applicationId={applicant?.id ?? null}
        applicantName={applicant?.name}
        open={scheduling}
        onOpenChange={setScheduling}
        mode={applicant?.hasInterview ? "reschedule" : "schedule"}
        onSuccess={handleScheduleSuccess}
      />
      <CreateContractDialog
        applicant={applicant}
        existingContract={existingContract}
        open={creatingContract}
        onOpenChange={setCreatingContract}
        onContractCreated={(contract) => {
          setExistingContract(contract);
          onContractCreated?.(contract);
        }}
      />
    </>
  );
}
