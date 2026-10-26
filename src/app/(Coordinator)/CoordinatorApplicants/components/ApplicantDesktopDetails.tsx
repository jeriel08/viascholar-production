"use client";

import { CalendarClock, Eye, FileSignature } from "lucide-react";
import type { Applicant } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGwa, gwaSourceTitle } from "./applicant-helpers";

interface ApplicantDesktopDetailsProps {
  applicant: Applicant;
}

export function ApplicantDesktopDetails({ applicant }: ApplicantDesktopDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Accepted / Contract Signing Stage Info */}
      {applicant.stage === "Accepted" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <FileSignature className="size-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Scholarship Agreement & Contract Status
                  </h4>
                  {applicant.hasContract && applicant.contractStatus === "PENDING" ? (
                    <Badge
                      variant="outline"
                      className="border-amber-400 bg-amber-100/90 text-amber-900 text-[0.65rem]! font-semibold dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200"
                    >
                      Awaiting Student Signature
                    </Badge>
                  ) : applicant.hasContract && applicant.contractStatus === "SIGNED" ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-400 bg-emerald-100/90 text-emerald-900 text-[0.65rem]! font-semibold dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                    >
                      Signed & Promoted
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-300 bg-slate-100 text-slate-700 text-[0.65rem]! font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Pending Contract Issuance
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {applicant.hasContract && applicant.contractStatus === "PENDING" ? (
                    <>
                      This applicant has been <strong>Accepted</strong> into the scholarship program. A digital scholarship agreement
                      {applicant.contractNumber ? ` (Contract #${applicant.contractNumber})` : ""} has been generated and is awaiting the student&apos;s digital signature.
                    </>
                  ) : (
                    <>
                      This applicant has been <strong>Accepted</strong>. The scholarship contract has not yet been issued by the grantor.
                    </>
                  )}
                </p>

                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-normal">
                  💡 <strong>Pipeline Notice:</strong> Accepted applicants remain in this list while they are in the contract signing stage. Once the student reviews and e-signs their agreement, their account will automatically graduate to active <strong>Scholar</strong> status and move to the Scholars Monitoring dashboard.
                </p>
              </div>
            </div>

            {applicant.contractDocumentUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs! font-medium bg-white hover:bg-amber-100/60 border-amber-300 text-amber-900 dark:bg-slate-900 dark:text-amber-200"
                onClick={() => window.open(applicant.contractDocumentUrl as string, "_blank")}
              >
                <Eye className="size-3.5" />
                <span>View Contract</span>
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Academic & Institution Information */}
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Academic & Institution Details
        </h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Scholarship Track</dt>
            <dd className="font-medium text-foreground">{applicant.track || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Course of Study</dt>
            <dd className="font-medium text-foreground">{applicant.course || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Current Year Level</dt>
            <dd className="font-medium text-foreground">{applicant.year || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">General Weighted Average (GWA)</dt>
            <dd className="font-medium tabular-nums text-foreground" title={gwaSourceTitle(applicant.gwaSource)}>
              {applicant.gwa !== null ? formatGwa(applicant.gwa) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">School Name</dt>
            <dd className="font-medium text-foreground">{applicant.schoolName || "—"}</dd>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <dt className="text-xs text-muted-foreground">School Address</dt>
            <dd className="font-medium text-foreground">{applicant.schoolAddress || "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Personal, Contact & Affiliation Details */}
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Personal, Contact & Affiliation Details
        </h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Student Number</dt>
            <dd className="font-medium text-foreground">{applicant.studentNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone Number</dt>
            <dd className="font-medium text-foreground">{applicant.phoneNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Home Address</dt>
            <dd className="font-medium text-foreground">{applicant.studentAddress || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Relative Employed By Partner</dt>
            <dd className="font-medium text-foreground">{applicant.relativeEmployee || "None / N/A"}</dd>
          </div>
        </dl>
      </div>

      {/* Interview Stage Status Info */}
      {applicant.stage === "Interview" && (
        <div className="rounded-xl border border-navy/20 bg-navy/5 p-3.5 text-xs text-navy flex items-center justify-between gap-3">
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
          {applicant.hasInterview && (
            <Badge variant="outline" className="border-navy/30 bg-white text-navy text-[0.65rem]!">
              Scheduled
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
