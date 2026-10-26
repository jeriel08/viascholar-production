"use client";

import { AlertCircle, ArrowRight, CalendarClock, FileSignature, FileText, RotateCcw, User, X } from "lucide-react";
import { useState } from "react";
import { cn } from "cn";
import type { Applicant, Stage } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import type { ScholarDocument } from "@/lib/api/documents";
import { ApplicantDocumentsList } from "./ApplicantDocumentsList";
import { ApplicantEligibilityBanner } from "./ApplicantEligibilityBanner";
import { acceptWarning, getStageVariant } from "./applicant-helpers";
import { ApplicantMobileOverview } from "./ApplicantMobileOverview";
import { DocumentVerifyContent } from "./DocumentVerifyContent";

export interface ApplicantMobileDrawerProps {
  applicant: Applicant;
  open: boolean;
  onClose: () => void;
  loadedDocs: ScholarDocument[] | null;
  docsToken: number;
  setLoadedDocs: (docs: ScholarDocument[] | null) => void;
  verifyingDoc: ScholarDocument | null;
  setVerifyingDoc: (doc: ScholarDocument | null) => void;
  handleVerifyDone: (stage?: Stage) => void;
  canSchedule: boolean;
  canPassToInterview: boolean;
  hasNoDocs: boolean;
  hasConfirmedDocs: boolean;
  isDocsLoading: boolean;
  acting: boolean;
  actionError: string | null;
  onMoveStage: (
    id: number,
    stage: Stage,
    rejectionReason?: string,
    confirmWithoutMeeting?: boolean,
  ) => Promise<void> | void;
  setScheduling: (open: boolean) => void;
  setConfirmingReject: (open: boolean) => void;
  setConfirmingReopen: (open: boolean) => void;
  setAcceptWarningText: (text: string | null) => void;
}

export function ApplicantMobileDrawer({
  applicant,
  open,
  onClose,
  loadedDocs,
  docsToken,
  setLoadedDocs,
  verifyingDoc,
  setVerifyingDoc,
  handleVerifyDone,
  canSchedule,
  canPassToInterview,
  hasNoDocs,
  hasConfirmedDocs,
  isDocsLoading,
  acting,
  actionError,
  onMoveStage,
  setScheduling,
  setConfirmingReject,
  setConfirmingReopen,
  setAcceptWarningText,
}: ApplicantMobileDrawerProps) {
  const [mobileSection, setMobileSection] = useState<"overview" | "documents">("overview");

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="flex h-[92dvh] max-h-[92dvh]! flex-col rounded-t-[24px] border-t border-border bg-slate-50 text-slate-900 focus:outline-none p-0 overflow-hidden shadow-2xl">
        {/* Accessible hidden header for screen readers */}
        <DrawerHeader className="sr-only">
          <DrawerTitle>{verifyingDoc ? `Verify ${verifyingDoc.document_type}` : applicant.name}</DrawerTitle>
          <DrawerDescription>Applicant review and document verification drawer</DrawerDescription>
        </DrawerHeader>

        {/* Multi-step Sliding Container */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden">
          {/* STEP 1: Applicant Overview & Documents (Slides left when verifying document) */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out bg-slate-50",
              verifyingDoc ? "-translate-x-full pointer-events-none" : "translate-x-0",
            )}
          >
            {/* Visual Header Bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0a4f42] shadow-2xs">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate text-sm font-bold text-slate-900">{applicant.name}</h2>
                    <Badge
                      variant={getStageVariant(applicant.stage)}
                      className="h-5 px-1.5 text-[0.65rem] font-semibold"
                    >
                      {applicant.stage}
                    </Badge>
                    {applicant.stage === "Accepted" && applicant.hasContract && applicant.contractStatus === "PENDING" && (
                      <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 h-5 px-1.5 text-[0.65rem] font-medium border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300"
                      >
                        <FileSignature className="size-3 text-amber-600 dark:text-amber-400" />
                        Signing Contract
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-[0.68rem] text-slate-500">
                    {applicant.course} · {applicant.year}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Segmented Switcher: Overview vs Documents */}
            <div className="shrink-0 border-b border-border bg-slate-100/90 px-3 py-1.5">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1">
                <button
                  type="button"
                  onClick={() => setMobileSection("overview")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                    mobileSection === "overview"
                      ? "bg-white text-navy shadow-xs"
                      : "text-muted-foreground hover:text-navy",
                  )}
                >
                  <User className="size-3.5" />
                  <span>Overview & Actions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSection("documents")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all",
                    mobileSection === "documents"
                      ? "bg-white text-navy shadow-xs"
                      : "text-muted-foreground hover:text-navy",
                  )}
                >
                  <FileText className="size-3.5" />
                  <span>Documents</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[0.65rem] font-bold text-navy">
                    {loadedDocs?.length ?? applicant?.documentsCount ?? 0}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {mobileSection === "overview" ? (
                <ApplicantMobileOverview applicant={applicant} />
              ) : (
                <div className="p-3.5 space-y-3.5">
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
              )}
            </div>

            {/* Sticky Action Buttons Footer */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg flex flex-col gap-2">
              {actionError && (
                <p className="rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">{actionError}</p>
              )}

              {/* Schedule / Reschedule Meeting button */}
              {canSchedule && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 text-xs font-semibold"
                  disabled={acting}
                  onClick={() => setScheduling(true)}
                >
                  <CalendarClock className="size-4" />
                  {applicant.hasInterview ? "Reschedule meeting" : "Schedule meeting"}
                </Button>
              )}

              {/* Pass to Interview button */}
              {(applicant.stage === "Submitted" || applicant.stage === "Under review") && (
                <div className="flex flex-col gap-2">
                  {hasNoDocs && !isDocsLoading && (
                    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[0.72rem] text-amber-800">
                      <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
                      <span>Cannot pass to interview: No documents submitted yet.</span>
                    </div>
                  )}
                  {!hasNoDocs && !hasConfirmedDocs && !isDocsLoading && (
                    <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[0.72rem] text-amber-800">
                      <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
                      <span>Awaiting student document review & confirmation first.</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    className="h-10 text-xs font-semibold bg-navy text-white hover:bg-navy/90"
                    disabled={acting || !canPassToInterview}
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
                  className="h-10 text-xs font-semibold bg-navy text-white hover:bg-navy/90"
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
              {applicant.stage !== "Rejected" && applicant.stage !== "Accepted" && applicant.stage !== "Endorsed" && (
                <Button
                  type="button"
                  variant="destructive"
                  className="h-10 text-xs font-semibold"
                  disabled={acting}
                  onClick={() => setConfirmingReject(true)}
                >
                  Reject application
                </Button>
              )}

              {/* Reopen Application */}
              {applicant.stage === "Rejected" && (
                <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-2.5">
                  <div className="text-[0.7rem] text-muted-foreground">
                    <p className="font-semibold text-navy">Application is marked as Rejected</p>
                    <p>Reopening will return the application to &ldquo;Under review&rdquo;.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 px-3 text-xs font-semibold border-navy/30 text-navy hover:bg-navy/5 gap-1.5"
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

          {/* STEP 2: Document Verification View (Pulls in from the right) */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out bg-white",
              verifyingDoc ? "translate-x-0" : "translate-x-full pointer-events-none",
            )}
          >
            {verifyingDoc && (
              <DocumentVerifyContent
                document={verifyingDoc}
                applicantName={applicant.name}
                onBack={() => setVerifyingDoc(null)}
                onClose={() => setVerifyingDoc(null)}
                onDone={(stage) => {
                  handleVerifyDone(stage);
                  setVerifyingDoc(null);
                }}
                isMobileDrawer={true}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
