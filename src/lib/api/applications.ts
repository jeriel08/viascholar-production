import { apiGet, apiPatch, apiPost } from "../api";

const B = "/api/proxy/applications";

export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

// Mirrors the backend Application row (GET /applications/me returns one).
export interface Application {
  application_id: number;
  scholar_profile_id: number;
  status: ApplicationStatus;
  stage: string;
  submitted_at: string;
  stage_updated_at?: string | null;
  interview_at?: string | null;
  interview_meeting_link?: string | null;
  reschedule_reason?: string | null;
  decision_at?: string | null;
  provider_notes?: string | null;
  rejection_reason?: string | null;
}

// Mirrors the backend ScholarProfile row as included by GET /applications
// (findAll includes the full scholar_profile relation).
export interface ScholarProfileSummary {
  profile_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  student_number?: string | null;
  student_address?: string | null;
  phone_number?: string | null;
  scholarship_track?: string | null;
  course_of_study?: string | null;
  school_name?: string | null;
  school_address?: string | null;
  relative_employee?: string | null;
  current_year_level?: number | null;
  _count?: {
    documents: number;
    contracts?: number;
  };
  contracts?: {
    contract_id: number;
    contract_number: string;
    status: string;
  }[];
}

// GET /applications returns each Application with its scholar_profile
// (and reviewed_by_employee) plus the applicant's General Average — the
// student's confirmed document average when present, otherwise the latest
// verified grade report GPA (null when neither exists yet).
export interface ApplicationWithProfile extends Application {
  scholar_profile: ScholarProfileSummary | null;
  general_average: number | null;
  general_average_source: "confirmed" | "verified" | null;
}

export function createApplication(data: {
  scholarship_track: string;
  student_number: string;
  student_address: string;
  course_of_study: string;
  school_name: string;
  school_address: string;
  current_year_level?: number;
  phone_number?: string;
  relative_employee?: string;
}) {
  return apiPost<Application>(B, data);
}

export function getMyApplication() {
  return apiGet<Application>(`${B}/me`);
}

export function finalizeApplication() {
  return apiPost<Application>(`${B}/me/finalize`);
}

export function requestReschedule(data: { reason: string; preferred_availability?: string }) {
  return apiPost<{ ok: boolean }>(`${B}/me/request-reschedule`, data);
}

export function listApplications(params?: { status?: ApplicationStatus; track?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.track) qs.set("track", params.track);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiGet<ApplicationWithProfile[]>(`${B}${query ? `?${query}` : ""}`);
}

// Every document an applicant has uploaded — for coordinator review.
// Same shape as GET /documents/me (file, OCR data, confirmed data).
export function getApplicationDocuments(applicationId: number) {
  return apiGet<import("./documents").ScholarDocument[]>(`${B}/${applicationId}/documents`);
}

export function scheduleInterview(
  id: number,
  data: {
    interview_at: string;
    duration_minutes?: number;
    provider_notes?: string;
    manual_meeting_link?: string;
  },
) {
  return apiPost<Application>(`${B}/${id}/schedule-interview`, data);
}

export function rescheduleInterview(
  id: number,
  data: {
    new_interview_at: string;
    duration_minutes?: number;
    reschedule_notes?: string;
    manual_meeting_link?: string;
  },
) {
  return apiPatch<Application>(`${B}/${id}/reschedule-interview`, data);
}

export function updateStage(
  id: number,
  data: {
    status: ApplicationStatus;
    stage: string;
    interview_at?: string;
    interview_meeting_link?: string;
    interview_calendar_event_id?: string;
    reschedule_reason?: string;
    provider_notes?: string;
    rejection_reason?: string;
    confirm_without_meeting?: boolean;
  },
) {
  return apiPatch<Application>(`${B}/${id}/stage`, data);
}
