import { apiGet, apiPost } from "../api";

const D = "/api/proxy/disbursements";

export interface DisbursementDocument {
  document_id: number;
  file_url: string;
  file_name: string;
  file_size?: string;
  file_type?: string;
  status?: string;
  extracted_data?: ExtractedOfficialReceiptData | null;
}

export type DisbursementStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "RELEASED"
  | "CHECK_ISSUED"
  | "OR_SUBMITTED"
  | "CLAIMED"
  | "SETTLED"
  | "CANCELLED";

export interface DisbursementItem {
  disbursement_id: number;
  scholar_profile_id: number;
  academic_year: string;
  semester: string;
  amount: number;
  voucher_number?: string | null;
  check_payee?: string | null;
  check_number?: string | null;
  bank_name?: string | null;
  payment_method?: string | null;
  status: DisbursementStatus;
  date_issued?: string | null;
  date_claimed?: string | null;
  or_number?: string | null;
  or_payment_date?: string | null;
  or_document_id?: number | null;
  or_verified_at?: string | null;
  settled_at?: string | null;
  settled_by_employee_id?: number | null;
  approved_by_employee_id?: number | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
  scholar_profile?: {
    profile_id: number;
    first_name: string;
    last_name: string;
    student_number?: string;
    school_name?: string;
    course_of_study?: string;
    current_year_level?: number;
    phone_number?: string;
  };
  term_enrollment?: {
    enrollment_id: number;
    academic_year: string;
    semester: string;
    year_level: number;
    total_units: number;
    total_assessment: number;
    soa_document?: DisbursementDocument | null;
    cor_document?: DisbursementDocument | null;
  } | null;
  or_document?: DisbursementDocument | null;
  approved_by_employee?: {
    employee_id: number;
    first_name: string;
    last_name: string;
    title?: string | null;
  } | null;
  settled_by_employee?: {
    employee_id: number;
    first_name: string;
    last_name: string;
    title?: string | null;
  } | null;
}

export interface ConsolidatedUniversityBilling {
  school_name: string;
  total_amount: number;
  pending_amount: number;
  authorized_amount: number;
  settled_amount: number;
  total_scholars: number;
  pending_count: number;
  disbursements: DisbursementItem[];
}

export interface DisbursementVoucherDetails {
  voucher_number: string;
  authorized_at: string;
  authorized_by: string;
  payee_school: string;
  total_amount: number;
  item_count: number;
  items: DisbursementItem[];
}

export async function getGrantorConsolidatedBilling(
  academicYear?: string,
  semester?: string,
): Promise<ConsolidatedUniversityBilling[]> {
  const params = new URLSearchParams();
  if (academicYear) params.append("academic_year", academicYear);
  if (semester) params.append("semester", semester);
  const qStr = params.toString();
  return apiGet<ConsolidatedUniversityBilling[]>(`${D}/grantor/consolidated-report${qStr ? `?${qStr}` : ""}`);
}

export async function authorizeGrantorDisbursementBatch(dto: {
  disbursement_ids: number[];
  voucher_prefix?: string;
  remarks?: string;
}): Promise<{
  message: string;
  voucher_number: string;
  total_amount: number;
  disbursements: DisbursementItem[];
}> {
  return apiPost<{
    message: string;
    voucher_number: string;
    total_amount: number;
    disbursements: DisbursementItem[];
  }>(`${D}/grantor/authorize-batch`, dto);
}

export async function getDisbursementVoucherDetails(voucherNumber: string): Promise<DisbursementVoucherDetails> {
  return apiGet<DisbursementVoucherDetails>(`${D}/grantor/voucher/${voucherNumber}`);
}

export async function getDisbursementsQueue(params?: {
  status?: string;
  school?: string;
  search?: string;
  academic_year?: string;
  semester?: string;
}): Promise<DisbursementItem[]> {
  const q = new URLSearchParams();
  if (params?.status) q.append("status", params.status);
  if (params?.school) q.append("school", params.school);
  if (params?.search) q.append("search", params.search);
  if (params?.academic_year) q.append("academic_year", params.academic_year);
  if (params?.semester) q.append("semester", params.semester);
  const qStr = q.toString();
  return apiGet<DisbursementItem[]>(`${D}/queue${qStr ? `?${qStr}` : ""}`);
}

export async function recordCoordinatorCheckIssuance(
  id: number,
  dto: {
    check_number: string;
    bank_name: string;
    date_issued: string;
    voucher_number?: string;
    payment_method?: string;
    remarks?: string;
  },
): Promise<{ message: string; disbursement: DisbursementItem }> {
  return apiPost<{ message: string; disbursement: DisbursementItem }>(`${D}/coordinator/${id}/issue-check`, dto);
}

export async function settleCoordinatorOfficialReceipt(
  id: number,
  dto: {
    approved: boolean;
    remarks?: string;
    rejection_reason?: string;
  },
): Promise<{ message: string; disbursement: DisbursementItem }> {
  return apiPost<{ message: string; disbursement: DisbursementItem }>(`${D}/coordinator/${id}/settle-or`, dto);
}

export interface ExtractedOfficialReceiptData {
  or_number?: string | null;
  student_id?: string | null;
  student_name?: string | null;
  amount_paid?: number | null;
  payment_date?: string | null;
  school_name?: string | null;
  payment_mode?: string | null;
  check_number_reference?: string | null;
  remarks?: string | null;
  confidence_level?: string | null;
}

export interface UploadReceiptResponse {
  file_url: string;
  file_name: string;
  file_size: string;
  extracted_data?: ExtractedOfficialReceiptData | null;
}

export async function uploadOfficialReceiptFile(file: File): Promise<UploadReceiptResponse> {
  const formData = new FormData();
  formData.append("files", file);
  return apiPost<UploadReceiptResponse>(`${D}/scholar/upload-receipt`, formData);
}

export async function getMyScholarDisbursements(): Promise<DisbursementItem[]> {
  return apiGet<DisbursementItem[]>(`${D}/scholar/my-disbursements`);
}

export async function submitScholarOfficialReceipt(
  id: number,
  dto: {
    or_number: string;
    or_payment_date: string;
    file_url: string;
    or_amount?: number;
    file_name?: string;
    remarks?: string;
    extracted_data?: ExtractedOfficialReceiptData | null;
  },
): Promise<{ message: string; disbursement: DisbursementItem }> {
  return apiPost<{ message: string; disbursement: DisbursementItem }>(`${D}/scholar/${id}/submit-or`, dto);
}
