import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../api";
import { compressDocumentFiles } from "../image-compression";

const B = "/api/proxy/documents";

export type DocumentStatus =
  | "PENDING"
  | "PASSED_PRECHECK"
  | "STUDENT_CONFIRMED"
  | "VERIFIED"
  | "NEEDS_REUPLOAD"
  | "REJECTED";

export type GradeReportStatus = "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";

export interface ScholarDocument {
  document_id: number;
  scholar_profile_id: number;
  document_type: string;
  label?: string | null;
  file_name?: string | null;
  file_url: string;
  file_size?: string | null;
  file_type?: string | null;
  status: DocumentStatus;
  rejection_reason?: string | null;
  extracted_data?: Record<string, unknown> | null;
  confirmed_data?: Record<string, unknown> | null;
  uploaded_at: string;
  verified_at?: string | null;
  scholar_profile?: {
    profile_id?: number;
    user_id?: number;
    user?: {
      user_id?: number;
      email?: string;
      role?: string;
    } | null;
    first_name?: string;
    last_name?: string;
    student_number?: string;
    course_of_study?: string;
    school_name?: string;
    school_id?: number | null;
    school_grading_system?: {
      school_name: string;
      grading_scale: string;
      passing_grade: number;
      highest_grade: number;
      failing_grade: number;
    } | null;
  } | null;
}

export interface GradeItem {
  item_id?: number;
  subject_code?: string;
  subject_name?: string;
  units?: number;
  grade: number;
  raw_status?: string | null;
}

export interface GradeReport {
  report_id: number;
  id?: number;
  scholar_profile_id: number;
  document_id?: number | null;
  academic_year: string;
  semester: string;
  term?: string | null;
  gpa: number;
  general_average?: number;
  status: GradeReportStatus;
  evaluation_flag?: "CLEARED" | "BELOW_PASSING_MARK" | "ACADEMIC_FAILURE" | string | null;
  is_eligible: boolean;
  appeal_status?: "NONE" | "PENDING_GRANTOR" | "APPROVED" | "DENIED" | string;
  appeal_notes?: string | null;
  appeal_document_id?: number | null;
  appeal_submitted_at?: string | null;
  appeal_reviewed_at?: string | null;
  appeal_decision_notes?: string | null;
  remarks?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  grade_items: GradeItem[];
  document?: ScholarDocument | null;
  appeal_document?: ScholarDocument | null;
  scholar_profile?: {
    profile_id: number;
    first_name: string;
    last_name: string;
    student_number?: string;
    school_name?: string;
    course_of_study?: string;
    school_grading_system?: {
      school_name: string;
      grading_scale: string;
      passing_grade: number;
      highest_grade: number;
      failing_grade: number;
    } | null;
    user?: {
      user_id: number;
      email: string;
    } | null;
  } | null;
}

export async function uploadDocuments(files: File[], documentType: string) {
  const preparedFiles = await compressDocumentFiles(files);
  const form = new FormData();
  for (const file of preparedFiles) {
    form.append("files", file);
  }
  form.append("document_type", documentType);
  return apiPost<ScholarDocument>(`${B}/upload`, form);
}

export async function replaceDocument(id: number, files: File[] | File) {
  const list = Array.isArray(files) ? files : [files];
  const preparedFiles = await compressDocumentFiles(list);
  const form = new FormData();
  for (const file of preparedFiles) {
    form.append("files", file);
  }
  return apiPut<ScholarDocument>(`${B}/${id}/replace`, form);
}

export function deleteDocument(id: number) {
  return apiDelete<{ success: boolean; message: string }>(`${B}/${id}`);
}

export function getMyDocuments(documentType?: string) {
  const query = documentType ? `?document_type=${encodeURIComponent(documentType)}` : "";
  return apiGet<ScholarDocument[]>(`${B}/me${query}`);
}

export function getGradeReportsMe() {
  return apiGet<GradeReport[]>(`${B}/grade-reports/me`);
}

export function getGradeReports(params?: {
  status?: GradeReportStatus;
  academic_year?: string;
  semester?: string;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.academic_year) qs.set("academic_year", params.academic_year);
  if (params?.semester) qs.set("semester", params.semester);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiGet<GradeReport[]>(`${B}/grade-reports${query ? `?${query}` : ""}`);
}

export function updateGradeReportStatus(id: number, data: { status: GradeReportStatus; remarks?: string }) {
  return apiPatch<GradeReport>(`${B}/grade-reports/${id}/status`, data);
}

export function submitAcademicAppeal(
  reportId: number,
  data: {
    appeal_notes: string;
    appeal_document_id?: number;
  },
) {
  return apiPost<GradeReport>(`${B}/grade-reports/${reportId}/appeal`, data);
}

export function reviewAcademicAppeal(
  reportId: number,
  data: {
    decision: "APPROVED" | "DENIED";
    decision_notes?: string;
    grant_probation?: boolean;
  },
) {
  return apiPatch<GradeReport>(`${B}/grade-reports/${reportId}/appeal`, data);
}

export function getPendingAcademicAppeals() {
  return apiGet<GradeReport[]>(`${B}/grade-reports/appeals`);
}

export function getExtractedData(id: number) {
  return apiGet<ScholarDocument & { smart_warnings?: string[] }>(`${B}/${id}/extracted-data`);
}

export function confirmDocument(
  id: number,
  data: {
    academic_year?: string;
    semester?: string;
    general_average?: number;
    grade_items?: GradeItem[];
  },
) {
  return apiPatch<ScholarDocument>(`${B}/${id}/confirm`, data);
}

export function getPendingDocuments() {
  return apiGet<ScholarDocument[]>(`${B}/pending`);
}

export function getDocument(id: number) {
  return apiGet<ScholarDocument>(`${B}/${id}`);
}

export function syncParseur(id: number) {
  return apiPost<{ ocr_data: Record<string, unknown> }>(`${B}/${id}/sync-parseur`);
}

export function retryDocumentOcr(id: number) {
  return apiPost<{ processed: boolean; status: string; extracted_data: Record<string, unknown> }>(
    `${B}/${id}/retry-ocr`,
  );
}

export function requestDocumentChanges(id: number, reason: string) {
  return apiPatch<ScholarDocument>(`${B}/${id}/request-changes`, { reason });
}

export function verifyDocument(
  id: number,
  data: {
    academic_year?: string;
    semester?: string;
    general_average?: number;
    grade_items?: GradeItem[];
    notes?: string;
  },
) {
  return apiPatch<VerifyDocumentResult>(`${B}/${id}/verify`, data);
}

export interface VerifyDocumentResult {
  report: {
    report_id: number;
    academic_year: string;
    semester: string;
    gpa: number | string;
    status: string;
    is_eligible: boolean;
  };
  isEligible: boolean;
  evaluationFlag: string;
  application: { application_id: number; status: string; stage: string } | null;
}
