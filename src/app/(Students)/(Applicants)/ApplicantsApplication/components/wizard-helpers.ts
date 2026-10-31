import type { Application, ApplicationStatus } from "@/lib/api/applications";
import type { DocumentStatus, ScholarDocument } from "@/lib/api/documents";
import { type ApplicationFormValues, applicationSchema } from "@/lib/validation";

export type WizardStep = 1 | 2 | 3;

export const WIZARD_STEPS: Array<{ step: WizardStep; label: string; sub: string }> = [
  { step: 1, label: "Applicant Details", sub: "Personal & school info" },
  { step: 2, label: "Documents", sub: "Form 138 / TOR" },
  { step: 3, label: "Status", sub: "Track progress" },
];

// Where the applicant should land based on backend state.
export function resolveStep(app: Application | null, docs: ScholarDocument[]): WizardStep {
  if (!app) return 1;
  if (app.status === "REJECTED" || app.status === "APPROVED") return 3;
  if (app.stage === "Draft") return 2;
  const progressed = docs.some((d) => d.status === "STUDENT_CONFIRMED" || d.status === "VERIFIED");
  return progressed ? 3 : 2;
}

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export function appStatusMeta(status: ApplicationStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "APPROVED":
      return { label: "Approved", variant: "default" };
    case "REJECTED":
      return { label: "Rejected", variant: "destructive" };
    case "UNDER_REVIEW":
      return { label: "Under review", variant: "secondary" };
    default:
      return { label: "Pending", variant: "outline" };
  }
}

export function docStatusMeta(status: DocumentStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "VERIFIED":
      return { label: "Verified", variant: "default" };
    case "STUDENT_CONFIRMED":
      return { label: "Confirmed", variant: "secondary" };
    case "PASSED_PRECHECK":
      return { label: "Pre-check passed", variant: "secondary" };
    case "NEEDS_REUPLOAD":
      return { label: "Needs re-upload", variant: "destructive" };
    case "REJECTED":
      return { label: "Rejected", variant: "destructive" };
    case "PENDING":
      return { label: "Analyzing with AI...", variant: "outline" };
    default:
      return { label: "Pending", variant: "outline" };
  }
}

export function formatDateTime(iso: string): string {
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

export function getRequiredDocumentInfo(yearLevel: number = 1) {
  if (yearLevel >= 2) {
    return {
      type: "TOR",
      shortLabel: "Transcript of Records (TOR)",
      badge: "College Transcript of Records (TOR)",
      title: "Official College Transcript of Records (TOR)",
      requirementTitle: `Year ${yearLevel} Requirement: Transcript of Records (TOR)`,
      description:
        "Students in Year 2 to 4+ are required to submit an official College Transcript of Records (TOR). High school report cards (Form 138 / Form 9) are not accepted.",
      uploadPrompt:
        "Upload your official College Transcript of Records (TOR). Single or multi-page PDFs and images are supported.",
      uploadButtonLabel: "Upload Transcript of Records (TOR)",
      mismatchMessage: `Students in Year ${yearLevel} (2nd to 4th year) are required to submit an official College Transcript of Records (TOR). High School Form 138 / Form 9 cannot be accepted. Please remove this document and upload your official TOR.`,
    };
  }

  return {
    type: "Form 138",
    shortLabel: "Form 138 / Form 9",
    badge: "Senior High School Form 138 / Form 9",
    title: "Senior High School Report Card (Form 138 or Form 9 / SF9)",
    requirementTitle: "1st-Year Requirement: Form 138 or Form 9",
    description:
      "1st-year applicants are only allowed to submit their Senior High School Form 138 or Form 9 (SF9) report card. College transcripts (TOR) cannot be accepted.",
    uploadPrompt:
      "Upload your Grade 12 Senior High School Form 138 or Form 9 (SF9). If your report card has multiple pages (e.g., front & back), select both files.",
    uploadButtonLabel: "Upload Form 138 / Form 9",
    mismatchMessage:
      "1st-year applicants are only allowed to submit Senior High School Form 138 or Form 9 (SF9). College transcripts (TOR) cannot be accepted. Please remove this document and upload your high school report card.",
  };
}

export function isHighSchoolDoc(docType: string): boolean {
  return /138|137|form\s*9|sf9|report card|high school|shs|senior high/i.test(docType || "");
}

export function isInvalidOrMismatchedDoc(doc: ScholarDocument | null | undefined, yearLevel: number = 1): boolean {
  if (!doc) return false;
  const reason = (doc.rejection_reason || "").toLowerCase();
  if (
    reason.includes("document type mismatch") ||
    reason.includes("invalid document type") ||
    reason.includes("mismatch") ||
    reason.includes("statement of account") ||
    reason.includes("unsupported document") ||
    reason.includes("form 138/sf9") ||
    reason.includes("high school report card")
  ) {
    return true;
  }

  let detectedType: string | undefined;
  if (doc.extracted_data) {
    try {
      const ext = typeof doc.extracted_data === "string" ? JSON.parse(doc.extracted_data) : doc.extracted_data;
      detectedType = ext?.detected_document_type;
    } catch {
      // Ignore JSON parse error
    }
  }

  if (
    detectedType === "STATEMENT_OF_ACCOUNT" ||
    detectedType === "CERTIFICATE_OF_REGISTRATION" ||
    detectedType === "OTHER"
  ) {
    return true;
  }

  if (yearLevel >= 2) {
    if (isHighSchoolDoc(doc.document_type) || detectedType === "FORM_138") {
      return true;
    }
  }

  if (yearLevel === 1) {
    if (
      (!isHighSchoolDoc(doc.document_type) && doc.document_type) ||
      detectedType === "TRANSCRIPT_OF_RECORDS" ||
      detectedType === "CERTIFICATE_OF_GRADES"
    ) {
      return true;
    }
  }

  return false;
}

export function getDefaultDocumentType(yearLevel: number = 1): string {
  return yearLevel >= 2 ? "TOR" : "Form 138";
}

export function getWizardSteps(yearLevel: number = 1): Array<{ step: WizardStep; label: string; sub: string }> {
  return [
    { step: 1, label: "Applicant Details", sub: "Personal & school info" },
    { step: 2, label: "Documents", sub: yearLevel >= 2 ? "Transcript (TOR)" : "Form 138 / Form 9" },
    { step: 3, label: "Status", sub: "Track progress" },
  ];
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function validateChosenFiles(files: File[]): string | null {
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeOk = /^(image\/(jpeg|png|webp)|application\/pdf)$/i.test(f.type);
    if (!ALLOWED_EXTENSIONS.includes(ext) && !mimeOk) {
      return `File "${f.name}" is not supported. Allowed formats: JPG, PNG, WEBP, PDF.`;
    }
    if (f.size > MAX_FILE_BYTES) {
      return `File "${f.name}" exceeds the 10MB size limit.`;
    }
  }
  return null;
}

// Validates the step-1 form, mapping the first Zod issue per field.
export function parseApplicationForm(values: Record<string, string>): {
  data?: ApplicationFormValues;
  fieldErrors: Record<string, string>;
} {
  const normalized = {
    ...values,
    phone_number: values.phone_number?.trim() ? values.phone_number.trim() : undefined,
    relative_employee: values.relative_employee?.trim() ?? "",
  };
  const parsed = applicationSchema.safeParse(normalized);
  if (parsed.success) return { data: parsed.data, fieldErrors: {} };
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { fieldErrors };
}
