"use client";

import { CalendarClock, Eye, FileSignature } from "lucide-react";
import type { Applicant } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGwa, gwaSourceTitle } from "./applicant-helpers";

interface ApplicantMobileOverviewProps {
  applicant: Applicant;
}

export function ApplicantMobileOverview({ applicant }: ApplicantMobileOverviewProps) {
  return (
    <div className="p-3.5 space-y-3.5">
      {/* Accepted / Contract Signing Stage Banner */}
      {applicant.stage === "Accepted" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <FileSignature className="size-4" />
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Scholarship Agreement
                </h4>
                {applicant.hasContract && applicant.contractStatus === "PENDING" ? (
                  <Badge
                    variant="outline"
                    className="border-amber-400 bg-amber-100/90 text-amber-900 text-[0.6rem]! font-semibold dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                  >
                    Awaiting Signature
                  </Badge>
                ) : applicant.hasContract && applicant.contractStatus === "SIGNED" ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-400 bg-emerald-100/90 text-emerald-900 text-[0.6rem]! font-semibold dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                  >
                    Signed & Promoted
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-slate-300 bg-slate-100 text-slate-700 text-[0.6rem]! font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Contract Pending
                  </Badge>
                )}
              </div>

              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-snug">
                {applicant.hasContract && applicant.contractStatus === "PENDING" ? (
                  <>
                    Applicant has been accepted. Contract
                    {applicant.contractNumber ? ` #${applicant.contractNumber}` : ""} is awaiting student signature.
                  </>
                ) : (
                  <>Applicant has been accepted. Awaiting contract issuance by grantor.</>
                )}
              </p>

              <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 leading-normal">
                💡 Once signed, the applicant will automatically be promoted to active Scholar and moved to Scholars Monitor.
              </p>

              {applicant.contractDocumentUrl && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-[11px]! font-medium bg-white hover:bg-amber-100/60 border-amber-300 text-amber-900 dark:bg-slate-900 dark:text-amber-200"
                    onClick={() => window.open(applicant.contractDocumentUrl as string, "_blank")}
                  >
                    <Eye className="size-3" />
                    <span>View Contract</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Academic & Institution Information */}
      <div className="rounded-xl border border-border/70 bg-white p-3.5 shadow-2xs">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Academic & Institution Details
        </h3>
        <dl className="grid grid-cols-1 gap-2.5 text-xs">
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Scholarship Track</dt>
            <dd className="font-semibold text-foreground">{applicant.track || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Course of Study</dt>
            <dd className="font-semibold text-foreground">{applicant.course || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Current Year Level</dt>
            <dd className="font-semibold text-foreground">{applicant.year || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">General Weighted Average (GWA)</dt>
            <dd className="font-semibold tabular-nums text-foreground" title={gwaSourceTitle(applicant.gwaSource)}>
              {applicant.gwa !== null ? formatGwa(applicant.gwa) : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">School Name</dt>
            <dd className="font-semibold text-foreground">{applicant.schoolName || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-muted-foreground">School Address</dt>
            <dd className="font-semibold text-foreground wrap-break-word">{applicant.schoolAddress || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Personal, Contact & Affiliation Details */}
      <div className="rounded-xl border border-border/70 bg-white p-3.5 shadow-2xs">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Personal & Contact Details
        </h3>
        <dl className="grid grid-cols-1 gap-2.5 text-xs">
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Student Number</dt>
            <dd className="font-semibold text-foreground">{applicant.studentNumber || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Phone Number</dt>
            <dd className="font-semibold text-foreground">{applicant.phoneNumber || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2">
            <dt className="text-[11px] text-muted-foreground">Home Address</dt>
            <dd className="font-semibold text-foreground wrap-break-word">{applicant.studentAddress || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-muted-foreground">Relative Employed By Partner</dt>
            <dd className="font-semibold text-foreground">{applicant.relativeEmployee || "None / N/A"}</dd>
          </div>
        </dl>
      </div>

      {/* Interview Stage Status Info */}
      {applicant.stage === "Interview" && (
        <div className="rounded-xl border border-navy/20 bg-navy/5 p-3 text-xs text-navy">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 shrink-0 text-navy" />
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
              ) : (
                <>
                  Applicant is in <strong>Interview Stage</strong> (no meeting scheduled yet)
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
