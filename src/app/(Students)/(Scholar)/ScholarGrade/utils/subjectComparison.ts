import type { GradeItem } from "@/lib/api/documents";
import type { EnrolledSubjectItem } from "@/lib/api/enrollment";

export function normalizeSubjectCode(code?: string): string {
  if (!code) return "";
  return code
    .trim()
    .toUpperCase()
    .replace(/[\s\-_.\/\\]+/g, "")
    .replace(/(?<=[A-Z])III$/g, "3")
    .replace(/(?<=[A-Z])II$/g, "2")
    .replace(/(?<=[A-Z])I$/g, "1");
}

export type SubjectMatchStatus = "MATCHED" | "EXTRA" | "MISSING_GRADE";

export interface SubmittedItemComparison {
  item: GradeItem;
  status: SubjectMatchStatus;
  matchedEnrolledSubject?: EnrolledSubjectItem;
}

export interface SubjectComparisonResult {
  isMatch: boolean;
  enrolledCount: number;
  submittedCount: number;
  matchedCount: number;
  missingEnrolledSubjects: EnrolledSubjectItem[];
  extraSubmittedSubjects: GradeItem[];
  subjectsMissingGrades: GradeItem[];
  submittedItemsWithStatus: SubmittedItemComparison[];
  mismatchReasons: string[];
}

export function compareEnrolledAndSubmittedSubjects(
  enrolledSubjects: EnrolledSubjectItem[] = [],
  submittedItems: GradeItem[] = [],
): SubjectComparisonResult {
  if (enrolledSubjects.length === 0) {
    return {
      isMatch: false,
      enrolledCount: 0,
      submittedCount: submittedItems.length,
      matchedCount: 0,
      missingEnrolledSubjects: [],
      extraSubmittedSubjects: submittedItems,
      subjectsMissingGrades: [],
      submittedItemsWithStatus: submittedItems.map((item) => ({
        item,
        status: "EXTRA" as const,
      })),
      mismatchReasons: ["No approved enrolled subjects found for this academic term."],
    };
  }

  // Map enrolled subjects by normalized subject code
  const enrolledMap = new Map<string, EnrolledSubjectItem>();
  for (const sub of enrolledSubjects) {
    const norm = normalizeSubjectCode(sub.subject_code);
    if (norm) {
      enrolledMap.set(norm, sub);
    }
  }

  const matchedEnrolledCodes = new Set<string>();
  const extraSubmittedSubjects: GradeItem[] = [];
  const subjectsMissingGrades: GradeItem[] = [];
  const submittedItemsWithStatus: SubmittedItemComparison[] = [];

  for (const item of submittedItems) {
    const normCode = normalizeSubjectCode(item.subject_code);
    const enrolledMatch = normCode ? enrolledMap.get(normCode) : undefined;
    const hasValidGrade =
      item.grade !== undefined &&
      item.grade !== null &&
      !Number.isNaN(Number(item.grade)) &&
      Number(item.grade) > 0;

    if (!enrolledMatch) {
      extraSubmittedSubjects.push(item);
      submittedItemsWithStatus.push({
        item,
        status: "EXTRA",
      });
    } else {
      matchedEnrolledCodes.add(normCode);
      if (!hasValidGrade) {
        subjectsMissingGrades.push(item);
        submittedItemsWithStatus.push({
          item,
          status: "MISSING_GRADE",
          matchedEnrolledSubject: enrolledMatch,
        });
      } else {
        submittedItemsWithStatus.push({
          item,
          status: "MATCHED",
          matchedEnrolledSubject: enrolledMatch,
        });
      }
    }
  }

  // Identify enrolled subjects not found in the submitted list
  const missingEnrolledSubjects: EnrolledSubjectItem[] = [];
  for (const sub of enrolledSubjects) {
    const norm = normalizeSubjectCode(sub.subject_code);
    if (!matchedEnrolledCodes.has(norm)) {
      missingEnrolledSubjects.push(sub);
    }
  }

  const mismatchReasons: string[] = [];

  if (missingEnrolledSubjects.length > 0) {
    mismatchReasons.push(
      `${missingEnrolledSubjects.length} enrolled course(s) missing from grade slip: ${missingEnrolledSubjects
        .map((s) => s.subject_code)
        .join(", ")}`,
    );
  }

  if (extraSubmittedSubjects.length > 0) {
    mismatchReasons.push(
      `${extraSubmittedSubjects.length} course(s) on grade slip not found in enrolled courses: ${extraSubmittedSubjects
        .map((s) => s.subject_code || s.subject_name || "Unknown")
        .join(", ")}`,
    );
  }

  if (subjectsMissingGrades.length > 0) {
    mismatchReasons.push(
      `${subjectsMissingGrades.length} course(s) do not have a valid numeric grade recorded: ${subjectsMissingGrades
        .map((s) => s.subject_code || s.subject_name || "Unknown")
        .join(", ")}`,
    );
  }

  const isMatch =
    missingEnrolledSubjects.length === 0 &&
    extraSubmittedSubjects.length === 0 &&
    subjectsMissingGrades.length === 0 &&
    submittedItems.length > 0;

  return {
    isMatch,
    enrolledCount: enrolledSubjects.length,
    submittedCount: submittedItems.length,
    matchedCount: matchedEnrolledCodes.size,
    missingEnrolledSubjects,
    extraSubmittedSubjects,
    subjectsMissingGrades,
    submittedItemsWithStatus,
    mismatchReasons,
  };
}

