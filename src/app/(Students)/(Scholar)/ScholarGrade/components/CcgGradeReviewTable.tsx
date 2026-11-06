"use client";

import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  FileUp,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GradeItem, ScholarDocument } from "@/lib/api/documents";
import type { EnrolledSubjectItem } from "@/lib/api/enrollment";
import { compareEnrolledAndSubmittedSubjects } from "../utils/subjectComparison";

interface CcgGradeReviewTableProps {
  doc: ScholarDocument;
  academicYear: string;
  setAcademicYear: (ay: string) => void;
  semester: string;
  setSemester: (sem: string) => void;
  gradeItems: GradeItem[];
  enrolledSubjects?: EnrolledSubjectItem[];
  setGradeItems?: React.Dispatch<React.SetStateAction<GradeItem[]>>;
  previewGwa: string;
  discarding: boolean;
  confirming: boolean;
  onDiscard: () => void;
  onConfirm: () => void;
  onAddSubject?: () => void;
}

export function CcgGradeReviewTable({
  doc,
  academicYear,
  semester,
  gradeItems,
  enrolledSubjects = [],
  previewGwa,
  discarding,
  confirming,
  onDiscard,
  onConfirm,
}: CcgGradeReviewTableProps) {
  const comparison = useMemo(
    () => compareEnrolledAndSubmittedSubjects(enrolledSubjects, gradeItems),
    [enrolledSubjects, gradeItems],
  );

  const hasMismatch = !comparison.isMatch;

  return (
    <div className="space-y-4">
      {doc.status === "NEEDS_REUPLOAD" && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Correction Notice: </span>
            <span>{doc.rejection_reason || "Please check your document legibility or re-upload a clearer copy."}</span>
          </div>
        </div>
      )}

      {/* Mismatch Alert & Block Notice */}
      {hasMismatch && (
        <div className="rounded-2xl border border-rose-300 bg-linear-to-br from-rose-50/80 via-white to-rose-50/40 p-4 md:p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="size-5.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-rose-950">
                    Subject & Grade Mismatch Detected
                  </h4>
                  <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold">
                    Submission Blocked
                  </Badge>
                </div>
                <p className="text-xs text-rose-900/90 leading-relaxed">
                  The subjects and grades extracted from your grade slip do not match your officially approved enrolled course load ({comparison.enrolledCount} enrolled vs {comparison.submittedCount} detected). Grade submission is blocked until a matching Certified Copy of Grades is uploaded.
                </p>
              </div>
            </div>

            <Button
              type="button"
              disabled={discarding}
              onClick={onDiscard}
              className="h-9 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 gap-2 shadow-xs shrink-0 self-start sm:self-center cursor-pointer"
            >
              {discarding ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
              <span>Submit another file</span>
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-1">
            <span className="font-bold block">Discrepancy Details:</span>
            <ul className="list-disc list-inside space-y-1 font-medium text-[11px] leading-relaxed">
              {comparison.mismatchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header Info Banner with Preview Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-teal-50/70 border border-teal-200 p-3.5">
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy truncate max-w-xs">{doc.file_name || "CCG Document"}</span>
            <Badge variant="outline" className="text-[10px] font-bold bg-white text-teal-800 border-teal-300">
              {gradeItems.length} Courses Detected
            </Badge>
            {hasMismatch ? (
              <Badge variant="outline" className="text-[10px] font-bold bg-rose-50 text-rose-800 border-rose-300">
                Mismatch Found
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border-emerald-300">
                All Enrolled Courses Matched
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Scanned registrar grade slip. The coordinator will audit and verify your grades for scholarship renewal.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {doc.file_url && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="h-7 px-2.5 text-xs font-semibold text-[#0a4f42] border-teal-300 bg-white hover:bg-teal-50"
            >
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <ExternalLink className="size-3" />
                <span>Open File</span>
              </a>
            </Button>
          )}
          <Badge className="bg-[#0a4f42] text-white text-xs font-bold px-3 py-1 shadow-xs">
            Detected GWA: {previewGwa}
          </Badge>
        </div>
      </div>

      {/* Detected Academic Term */}
      <div className="p-4 rounded-xl border border-line bg-[#fdfcfb] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-navy">
          <Calendar className="size-4 text-[#0a4f42]" />
          <span>Academic Term:</span>
          <Badge variant="secondary" className="text-xs font-semibold text-navy bg-white border border-slate-200">
            {academicYear} • {semester}
          </Badge>
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          {hasMismatch ? (
            <>
              <XCircle className="size-3.5 text-rose-600" />
              <span className="text-rose-700 font-semibold">Verification Blocked (Course Mismatch)</span>
            </>
          ) : (
            <>
              <FileCheck2 className="size-3.5 text-emerald-600" />
              <span>Ready for Coordinator Verification</span>
            </>
          )}
        </div>
      </div>

      {/* Missing Enrolled Courses Panel (if any enrolled courses were omitted from grade slip) */}
      {comparison.missingEnrolledSubjects.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-amber-600" />
              Enrolled Courses Missing From This Grade Slip ({comparison.missingEnrolledSubjects.length})
            </span>
            <Badge variant="outline" className="bg-white text-amber-800 border-amber-300 text-[10px] font-bold">
              Required
            </Badge>
          </div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            The following approved courses from your start-of-term registration do not appear on the uploaded grade slip. Your submitted grades must account for all enrolled courses:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {comparison.missingEnrolledSubjects.map((sub, idx) => (
              <div
                key={sub.subject_code ? `missing-${sub.subject_code}-${idx}` : `missing-${idx}`}
                className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-navy text-xs">{sub.subject_code}</span>
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                    {Number(sub.units || 3).toFixed(1)} units
                  </Badge>
                </div>
                <p className="text-[11px] text-stone-600 truncate">{sub.descriptive_title || "No description"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Read-Only Extracted Courses Table (Preview of Extracted Data) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-navy flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#0a4f42]" />
            Scanned Course Grades ({gradeItems.length})
          </span>
          <span className="text-[11px] text-muted-foreground">Read-only AI extraction preview</span>
        </div>

        <div className="border border-line rounded-xl overflow-hidden text-xs bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fdfcfb] border-b border-line text-[#8a8a84] font-bold text-[10px] uppercase">
              <tr>
                <th className="p-2.5 w-32">Subject Code</th>
                <th className="p-2.5">Descriptive Title</th>
                <th className="p-2.5 w-20 text-center">Units</th>
                <th className="p-2.5 w-24 text-center">Grade</th>
                <th className="p-2.5 w-40 text-center">Enrollment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {gradeItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                    Document uploaded. No readable course grades detected.
                  </td>
                </tr>
              ) : (
                comparison.submittedItemsWithStatus.map(({ item, status }, idx) => {
                  const isMatched = status === "MATCHED";
                  const isExtra = status === "EXTRA";
                  const isMissingGrade = status === "MISSING_GRADE";

                  return (
                    <tr
                      key={item.subject_code ? `ccg-${item.subject_code}-${idx}` : `ccg-idx-${idx}`}
                      className={`hover:bg-[#faf8f5] ${
                        isExtra ? "bg-rose-50/40" : isMissingGrade ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="p-2.5 font-mono font-bold text-navy">{item.subject_code || "—"}</td>
                      <td className="p-2.5 text-slate-700 font-medium">{item.subject_name || "—"}</td>
                      <td className="p-2.5 text-center font-semibold text-slate-900">
                        {Number(item.units || 1).toFixed(1)}
                      </td>
                      <td
                        className={`p-2.5 text-center font-bold ${
                          isMissingGrade ? "text-amber-700" : "text-emerald-800"
                        }`}
                      >
                        {item.grade ? Number(item.grade).toFixed(2) : "—"}
                      </td>
                      <td className="p-2.5 text-center">
                        {isMatched ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-semibold gap-1"
                          >
                            <CheckCircle2 className="size-2.5 text-emerald-600" />
                            Enrolled & Graded
                          </Badge>
                        ) : isExtra ? (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-800 border-rose-300 text-[10px] font-semibold gap-1"
                          >
                            <XCircle className="size-2.5 text-rose-600" />
                            Not in Enrolled Load
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-semibold gap-1"
                          >
                            <AlertTriangle className="size-2.5 text-amber-600" />
                            Missing Grade
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Legibility Checklist */}
      <div className="rounded-xl border border-line bg-white p-4 space-y-2.5 text-xs text-slate-700 shadow-2xs">
        <p className="font-semibold text-navy text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="size-3.5 text-[#0a4f42]" />
          Submission Confirmation
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {hasMismatch
            ? "Submission is currently blocked because the courses or grades on this slip do not match your officially approved enrolled course load. Please click 'Submit another file' to upload a matching Certified Copy of Grades."
            : "By confirming, you submit your official grade slip for review. The Scholarship Coordinator will verify your grades and GPA against your scholarship agreement guidelines."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-line">
        <Button
          type="button"
          variant="outline"
          disabled={discarding || confirming}
          onClick={onDiscard}
          className={`h-9 rounded-xl text-xs font-semibold cursor-pointer gap-1.5 ${
            hasMismatch
              ? "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold"
              : "border-line text-stone-700 hover:bg-stone-50"
          }`}
        >
          {discarding ? (
            <Loader2 className="size-3.5 animate-spin mr-1" />
          ) : hasMismatch ? (
            <FileUp className="size-3.5 mr-1" />
          ) : (
            <RotateCcw className="size-3.5 mr-1" />
          )}
          <span>Submit another file</span>
        </Button>

        <Button
          type="button"
          disabled={confirming || doc.status === "NEEDS_REUPLOAD" || gradeItems.length === 0 || hasMismatch}
          onClick={onConfirm}
          className={`h-9 rounded-xl text-white text-xs font-bold px-5 gap-1.5 shadow-xs cursor-pointer ${
            hasMismatch
              ? "bg-stone-400 cursor-not-allowed opacity-60"
              : "bg-[#0a4f42] hover:bg-[#083c32]"
          }`}
        >
          {confirming ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          <span>{hasMismatch ? "Submission Blocked (Subject Mismatch)" : "Confirm & Submit Grade Slip for Audit"}</span>
        </Button>
      </div>
    </div>
  );
}
