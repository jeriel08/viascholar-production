import type { Applicant, Stage } from "@/components/Coordinatorshared";
import type { ApplicationStatus, ApplicationWithProfile } from "@/lib/api/applications";
import type { Contract } from "@/lib/api/contracts";

export type StageFilter = Stage | "all";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const STAGE_FILTERS: { value: StageFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Submitted", label: "Submitted" },
  { value: "Under review", label: "Under review" },
  { value: "Interview", label: "Interview" },
  { value: "Endorsed", label: "Endorsed" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

export function getStageVariant(stage: Stage): BadgeVariant {
  switch (stage) {
    case "Accepted":
      return "default";
    case "Interview":
      return "secondary";
    case "Endorsed":
      return "secondary";
    case "Under review":
      return "outline";
    case "Rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function matchesQuery(a: Applicant, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return (
    a.name.toLowerCase().includes(q) ||
    a.course.toLowerCase().includes(q) ||
    a.track.toLowerCase().includes(q) ||
    a.stage.toLowerCase().includes(q) ||
    a.year.toLowerCase().includes(q) ||
    a.applied.toLowerCase().includes(q) ||
    (a.gwa !== null && String(a.gwa).includes(q))
  );
}

export function getStageCount(list: Applicant[], filter: StageFilter): number {
  if (filter === "all") return list.length;
  return list.filter((a) => a.stage === filter).length;
}

// ============================================================
// BACKEND MAPPING (GET /applications → Applicant row)
// ============================================================
// Backend stage is a free-text label (e.g. "Submitted", "Under Review");
// normalize it onto the frontend Stage union.

export function normalizeStage(raw: string): Stage {
  const s = raw.trim().toLowerCase();
  if (s === "under review" || s === "under_review") return "Under review";
  if (s.includes("interview")) return "Interview";
  if (s === "endorsed to grantor" || s === "endorsed") return "Endorsed";
  if (s === "accepted" || s === "approved") return "Accepted";
  if (s === "rejected") return "Rejected";
  // Written by PATCH /documents/:id/verify when a coordinator confirms a
  // document — the application is under review either way.
  if (s === "document verification complete" || s === "flagged for review") return "Under review";
  return "Submitted";
}

// The Stage column must never contradict the authoritative backend status:
// status and stage are written independently (approvals, interview
// scheduling, and verification each write their own stage label), so a
// terminal status always wins over a stale label.
export function resolveDisplayStage(status: ApplicationStatus, stage: string): Stage {
  if (status === "APPROVED") return "Accepted";
  if (status === "REJECTED") return "Rejected";
  return normalizeStage(stage);
}

// College TORs use a 1.0–5.0 scale while Form 138 uses percent — only append
// % for percent-scale values so "1.25" never renders as "1.25%".
export function formatGwa(gwa: number): string {
  return gwa > 5 ? `${gwa}%` : `${gwa}`;
}

export function gwaSourceTitle(source?: "confirmed" | "verified" | null): string | undefined {
  if (source === "confirmed") return "Student-confirmed average";
  if (source === "verified") return "Verified grade report";
  return undefined;
}

export function formatYearLevel(level?: number | null): string {
  if (level === 1) return "1st year";
  if (level === 2) return "2nd year";
  if (level === 3) return "3rd year";
  if (level === 4) return "4th year";
  if (level === 5) return "5th year";
  if (level === 6) return "Masteral";
  if (level === 7) return "Doctoral";
  if (typeof level === "number") return `${level}th year`;
  return "—";
}

export function formatAppliedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatInterviewDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Warning when endorsing/approving before any interview happened, mirroring
// the reject-confirm pattern. Null means a past interview exists — proceed.
export function acceptWarning(hasInterview: boolean | undefined, interviewAt?: string | null): string | null {
  if (!hasInterview) return "No interview has been scheduled for this applicant yet.";
  const d = interviewAt ? new Date(interviewAt) : null;
  if (d && !Number.isNaN(d.getTime()) && d.getTime() > Date.now()) {
    return `The interview is scheduled for ${formatInterviewDateTime(interviewAt as string)}, which hasn't happened yet.`;
  }
  return null;
}

export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

export function mapApplicationToApplicant(
  row: ApplicationWithProfile,
  contract?: Contract | null | unknown,
): Applicant {
  const p = row.scholar_profile;
  const firstName = p?.first_name ?? "";
  const lastName = p?.last_name ?? "";
  const name = `${firstName} ${lastName}`.trim() || `Applicant #${row.application_id}`;
  const validContract =
    contract && typeof contract === "object" && "contract_number" in contract ? (contract as Contract) : null;
  const firstContract = validContract ?? p?.contracts?.[0];
  return {
    id: row.application_id,
    name,
    initials: getInitials(firstName, lastName),
    course: p?.course_of_study?.trim() || "—",
    year: formatYearLevel(p?.current_year_level),
    track: p?.scholarship_track?.trim() || "—",
    gwa: row.general_average !== null ? Number(row.general_average) : null,
    gwaSource: row.general_average_source,
    hasInterview: row.interview_at != null,
    interviewAt: row.interview_at ?? null,
    profileId: p?.profile_id ?? null,
    applied: formatAppliedDate(row.submitted_at),
    stage: resolveDisplayStage(row.status, row.stage),
    studentNumber: p?.student_number ?? null,
    studentAddress: p?.student_address ?? null,
    phoneNumber: p?.phone_number ?? null,
    schoolName: p?.school_name ?? null,
    schoolAddress: p?.school_address ?? null,
    relativeEmployee: p?.relative_employee ?? null,
    documentsCount: p?._count?.documents ?? 0,
    hasContract:
      Boolean(firstContract) ||
      Boolean(p?.contracts && p.contracts.length > 0) ||
      Boolean(p?._count?.contracts && p._count.contracts > 0),
    contractStatus: firstContract?.status ?? p?.contracts?.[0]?.status ?? null,
    contractNumber: firstContract?.contract_number ?? p?.contracts?.[0]?.contract_number ?? null,
    contractId: firstContract?.contract_id ?? p?.contracts?.[0]?.contract_id ?? null,
    contractDocumentUrl: validContract ? validContract.signed_document_url || validContract.document_url || null : null,
  };
}

// Stage → PATCH /applications/:id/stage payload. Note: the backend only lets
// ADMIN/GRANTOR approve or reject — a coordinator "accept" is an endorsement
// (UNDER_REVIEW + label) that escalates the application to the grantor.
export function stageToUpdatePayload(
  stage: Stage,
  rejectionReason?: string,
): { status: ApplicationStatus; stage: string; rejection_reason?: string } {
  switch (stage) {
    case "Accepted":
      return { status: "APPROVED", stage: "Accepted" };
    case "Endorsed":
      return { status: "UNDER_REVIEW", stage: "Endorsed to Grantor" };
    case "Rejected":
      return { status: "REJECTED", stage: "Rejected", rejection_reason: rejectionReason };
    case "Interview":
      return { status: "UNDER_REVIEW", stage: "Interview" };
    case "Under review":
      return { status: "UNDER_REVIEW", stage: "Under review" };
    default:
      return { status: "PENDING", stage: "Submitted" };
  }
}
