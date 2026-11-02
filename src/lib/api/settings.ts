import { apiDelete, apiGet, apiPatch, apiPost } from "../api";

const B = "/api/proxy/settings";

// GET /settings — SystemSetting row. Prisma Decimals arrive as numbers
// (or numeric strings); normalize defensively with toNum().
export interface GlobalSettings {
  setting_id: number;
  grade_threshold: number;
  updated_at: string;
  updated_by_user_id: number | null;
}

export interface SchoolGrading {
  school_id: number;
  school_name: string;
  grading_scale: string;
  passing_grade: number;
  highest_grade: number;
  failing_grade: number;
  is_verified?: boolean;
  special_codes: Record<string, string> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolGradingInput {
  school_name: string;
  grading_scale: string;
  passing_grade: number;
  highest_grade: number;
  failing_grade: number;
  is_verified?: boolean;
  special_codes?: Record<string, string>;
  notes?: string;
}

function toNum(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeGrading<T extends Omit<SchoolGrading, "special_codes"> & { special_codes: unknown }>(
  row: T,
): SchoolGrading {
  return {
    ...row,
    passing_grade: toNum(row.passing_grade),
    highest_grade: toNum(row.highest_grade),
    failing_grade: toNum(row.failing_grade),
    special_codes:
      row.special_codes && typeof row.special_codes === "object" ? (row.special_codes as Record<string, string>) : null,
  };
}

export async function getSettings(): Promise<GlobalSettings> {
  const res = await apiGet<GlobalSettings>(B);
  return { ...res, grade_threshold: toNum(res.grade_threshold, 90) };
}

export async function updateSettings(grade_threshold: number): Promise<GlobalSettings> {
  const res = await apiPatch<GlobalSettings>(B, { grade_threshold });
  return { ...res, grade_threshold: toNum(res.grade_threshold, 90) };
}

export async function listSchoolGradings(): Promise<SchoolGrading[]> {
  const rows = await apiGet<Array<SchoolGrading & { special_codes: unknown }>>(`${B}/schools`);
  return rows.map(normalizeGrading);
}

export async function createSchoolGrading(data: SchoolGradingInput): Promise<SchoolGrading> {
  const row = await apiPost<SchoolGrading & { special_codes: unknown }>(`${B}/schools`, data);
  return normalizeGrading(row);
}

export async function updateSchoolGrading(id: number, data: Partial<SchoolGradingInput>): Promise<SchoolGrading> {
  const row = await apiPatch<SchoolGrading & { special_codes: unknown }>(`${B}/schools/${id}`, data);
  return normalizeGrading(row);
}

export async function verifySchoolGrading(id: number): Promise<SchoolGrading> {
  const row = await apiPatch<SchoolGrading & { special_codes: unknown }>(`${B}/schools/${id}/verify`, {});
  return normalizeGrading(row);
}

export async function deleteSchoolGrading(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`${B}/schools/${id}`);
}

export interface AcademicProgram {
  program_id: number;
  program_code: string;
  program_name: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicProgramInput {
  program_code: string;
  program_name: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export async function listAcademicPrograms(onlyActive = false): Promise<AcademicProgram[]> {
  const query = onlyActive ? "?only_active=true" : "";
  return apiGet<AcademicProgram[]>(`${B}/programs${query}`);
}

export async function createAcademicProgram(data: AcademicProgramInput): Promise<AcademicProgram> {
  return apiPost<AcademicProgram>(`${B}/programs`, data);
}

export async function updateAcademicProgram(
  id: number,
  data: Partial<AcademicProgramInput>,
): Promise<AcademicProgram> {
  return apiPatch<AcademicProgram>(`${B}/programs/${id}`, data);
}

export async function deleteAcademicProgram(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`${B}/programs/${id}`);
}

export interface School {
  school_id: number;
  school_name: string;
  school_code: string | null;
  address: string | null;
  contact_email: string | null;
  contact_number: string | null;
  is_active: boolean;
  grading_system_id: number | null;
  grading_system?: SchoolGrading | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolInput {
  school_name: string;
  school_code?: string;
  address?: string;
  contact_email?: string;
  contact_number?: string;
  grading_system_id?: number;
  is_active?: boolean;
}

export async function listSchools(onlyActive = false): Promise<School[]> {
  const query = onlyActive ? "?only_active=true" : "";
  return apiGet<School[]>(`${B}/schools-list${query}`);
}

export async function createSchool(data: SchoolInput): Promise<School> {
  return apiPost<School>(`${B}/schools-list`, data);
}

export async function updateSchool(id: number, data: Partial<SchoolInput>): Promise<School> {
  return apiPatch<School>(`${B}/schools-list/${id}`, data);
}

export async function deleteSchool(id: number): Promise<{ message: string; school?: School }> {
  return apiDelete<{ message: string; school?: School }>(`${B}/schools-list/${id}`);
}

