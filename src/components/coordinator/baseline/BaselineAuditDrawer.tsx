/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Lock,
  Plus,
  Save,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  coordinatorUpdateSubjects,
  freezeBaseline,
  getCoordinatorBaselineReview,
  type ProspectusSubject,
  type ScholarProspectus,
  type SchoolGradingSystem,
  type UpdateProspectusSubjectInput,
  unfreezeBaseline,
  verifySchoolGrading,
} from "@/lib/api/baseline";

interface BaselineAuditDrawerProps {
  scholarProfileId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ReviewDocument {
  document_id: number;
  document_type: string;
  label?: string | null;
  file_name?: string | null;
  file_url: string;
  file_type?: string | null;
  file_size?: string | null;
  uploaded_at: string;
}

interface BaselineReviewResponse {
  scholar_profile: {
    profile_id: number;
    student_name: string;
    student_number?: string | null;
    course_of_study?: string | null;
    school_name?: string | null;
    current_year_level?: number | null;
    email: string;
    academic_baseline_status: string;
  };
  school_grading_system?: SchoolGradingSystem | null;
  prospectus?: ScholarProspectus | null;
  documents?: ReviewDocument[];
  metrics: {
    total_subjects: number;
    total_units: number;
    credited_units: number;
    remaining_units: number;
    is_frozen: boolean;
  };
}

export function BaselineAuditDrawer({ scholarProfileId, open, onOpenChange, onSuccess }: BaselineAuditDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [data, setData] = useState<BaselineReviewResponse | null>(null);
  const [subjectsList, setSubjectsList] = useState<UpdateProspectusSubjectInput[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  const fetchReview = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const res = (await getCoordinatorBaselineReview(id)) as BaselineReviewResponse;
      setData(res);
      if (res.prospectus?.subjects) {
        setSubjectsList(
          res.prospectus.subjects.map((s: ProspectusSubject) => ({
            subject_id: s.subject_id,
            subject_code: s.subject_code,
            descriptive_title: s.descriptive_title,
            units: Number(s.units) || 3.0,
            year_level: s.year_level || 1,
            semester: s.semester || "1st Semester",
            status: s.status || "UNTAKEN",
            grade: s.grade != null ? Number(s.grade) : undefined,
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch baseline review:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && scholarProfileId) {
      fetchReview(scholarProfileId);
    }
  }, [open, scholarProfileId, fetchReview]);

  const handleFieldChange = (
    index: number,
    field: keyof UpdateProspectusSubjectInput,
    value: string | number | string[] | undefined,
  ) => {
    const updated = [...subjectsList];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectsList(updated);
  };

  const handleAddSubject = () => {
    setSubjectsList([
      ...subjectsList,
      {
        subject_code: "SUBJ 101",
        descriptive_title: "Subject Title",
        units: 3.0,
        year_level: 1,
        semester: "1st Semester",
        status: "UNTAKEN",
      },
    ]);
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjectsList(subjectsList.filter((_, i) => i !== idx));
  };

  const handleSaveSubjects = async () => {
    if (!data?.prospectus?.prospectus_id) return;
    try {
      setSaving(true);
      await coordinatorUpdateSubjects(data.prospectus.prospectus_id, {
        subjects: subjectsList,
      });
      if (scholarProfileId) fetchReview(scholarProfileId);
      onSuccess();
    } catch (err) {
      console.error("Failed to save subjects:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFreeze = async () => {
    if (!data?.prospectus?.prospectus_id) return;
    try {
      setActionLoading(true);
      await freezeBaseline(data.prospectus.prospectus_id);
      if (scholarProfileId) fetchReview(scholarProfileId);
      onSuccess();
    } catch (err) {
      console.error("Failed to freeze baseline:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfreeze = async () => {
    if (!data?.prospectus?.prospectus_id) return;
    try {
      setActionLoading(true);
      await unfreezeBaseline(data.prospectus.prospectus_id);
      if (scholarProfileId) fetchReview(scholarProfileId);
      onSuccess();
    } catch (err) {
      console.error("Failed to unfreeze baseline:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySchool = async (schoolId: number) => {
    try {
      await verifySchoolGrading(schoolId);
      if (scholarProfileId) fetchReview(scholarProfileId);
      onSuccess();
    } catch (err) {
      console.error("Failed to verify school grading:", err);
    }
  };

  if (!open || !scholarProfileId) return null;

  const docs = data?.documents || [];
  const currentDoc = docs[selectedDocIndex] || null;
  const isFrozen = data?.prospectus?.is_frozen || false;
  const school = data?.school_grading_system as SchoolGradingSystem | null;
  const scholar = data?.scholar_profile;
  const rawFileUrl = currentDoc?.file_url;
  const isFileUrlValid = Boolean(
    rawFileUrl &&
      (rawFileUrl.startsWith("http://") ||
        rawFileUrl.startsWith("https://") ||
        rawFileUrl.startsWith("blob:") ||
        rawFileUrl.startsWith("data:"))
  );
  const fileUrl = isFileUrlValid ? rawFileUrl : null;

  const totalUnits = subjectsList.reduce((acc, s) => acc + (Number(s.units) || 0), 0);
  const creditedUnits = subjectsList
    .filter((s) => s.status === "CREDITED" || s.status === "PASSED")
    .reduce((acc, s) => acc + (Number(s.units) || 0), 0);
  const remainingUnits = subjectsList
    .filter((s) => s.status !== "CREDITED" && s.status !== "PASSED")
    .reduce((acc, s) => acc + (Number(s.units) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-6xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <BookOpen className="size-5 text-[#0a4f42]" />
              <h2 className="text-lg font-bold text-slate-900">Academic Baseline Audit & Verification</h2>
              {scholar && (
                <Badge
                  variant="outline"
                  className="bg-[#0a4f42]/10 text-[#0a4f42] border-[#0a4f42]/30 text-xs font-bold"
                >
                  {scholar.student_name} {scholar.student_number ? `(${scholar.student_number})` : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {scholar?.course_of_study ? `${scholar.course_of_study} • ` : ""}
              {scholar?.school_name || "Institution"} • Verify curriculum prospectus against original document and
              freeze baseline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFrozen ? (
              <div className="flex flex-col items-end">
                <Badge className="bg-emerald-600/15 text-emerald-700 border-emerald-600/30 gap-1 text-xs py-1">
                  <Lock className="w-3.5 h-3.5" /> Baseline Locked
                </Badge>
                {data?.prospectus?.frozen_by_employee && (
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    by {data.prospectus.frozen_by_employee.first_name} {data.prospectus.frozen_by_employee.last_name}
                    {data.prospectus.frozen_by_employee.user?.role
                      ? ` (${data.prospectus.frozen_by_employee.user.role.charAt(0) + data.prospectus.frozen_by_employee.user.role.slice(1).toLowerCase()})`
                      : ""}
                  </span>
                )}
              </div>
            ) : (
              <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-xs py-1">
                Awaiting Coordinator Approval
              </Badge>
            )}

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {loading || !data ? (
          <div className="flex-1 flex items-center justify-center py-24 text-xs text-slate-500">
            {loading
              ? "Loading scholar curriculum documents and parsed subjects..."
              : "No baseline submission found for this scholar."}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: Document Preview */}
            <div className="lg:col-span-6 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700 shrink-0">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Uploaded Documents ({docs.length})
                </span>
                {currentDoc && (
                  <a
                    href={currentDoc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                  >
                    <span>Open External</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              {docs.length > 1 && (
                <div className="flex gap-1.5 px-3 pt-2 pb-1 overflow-x-auto bg-slate-900 shrink-0">
                  {docs.map((d, idx) => (
                    <Button
                      key={d.document_id || `doc-tab-${idx}`}
                      variant={selectedDocIndex === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDocIndex(idx)}
                      className={`text-[11px] h-7 px-2.5 whitespace-nowrap ${
                        selectedDocIndex === idx
                          ? "bg-[#0a4f42] hover:bg-[#083c32] text-white border-transparent"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {d.label || d.document_type}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex-1 p-2 bg-slate-950 flex items-center justify-center overflow-auto relative">
                {currentDoc && fileUrl ? (
                  currentDoc.file_type?.includes("pdf") || fileUrl.endsWith(".pdf") ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0`}
                      className="w-full h-full rounded-md border-0"
                      title="Uploaded Document Preview"
                    />
                  ) : (
                    <Image
                      src={fileUrl}
                      alt="Document preview"
                      fill
                      unoptimized
                      className="object-contain rounded-md"
                    />
                  )
                ) : (
                  <p className="text-xs text-slate-500">
                    {currentDoc ? "Document preview unavailable (file URL not found or inaccessible)." : "No document file uploaded."}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Verification Panel */}
            <div className="lg:col-span-6 flex flex-col h-full overflow-hidden p-5 space-y-4 bg-white">
              {/* School Scale Banner */}
              {school && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between shrink-0">
                  <span className="text-slate-500">
                    Scale:{" "}
                    <strong className="text-slate-900">
                      {Number(school.highest_grade)} max / {Number(school.passing_grade)} pass
                    </strong>
                  </span>
                  {!school.is_verified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifySchool(school.school_id)}
                      className="text-[11px] h-6 px-2 text-emerald-600 hover:text-emerald-700"
                    >
                      Verify Scale
                    </Button>
                  )}
                </div>
              )}

              {/* Metric Strip */}
              <div className="grid grid-cols-4 gap-2.5 shrink-0">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Subjects</span>
                  <span className="text-base font-black text-slate-900">{subjectsList.length}</span>
                </div>
                <div className="bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Total Units</span>
                  <span className="text-base font-black text-[#0a4f42]">{totalUnits.toFixed(1)}</span>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Credited Units</span>
                  <span className="text-base font-black text-emerald-900">{creditedUnits.toFixed(1)}</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Remaining Units</span>
                  <span className="text-base font-black text-amber-900">{remainingUnits.toFixed(1)}</span>
                </div>
              </div>

              {/* Audit Lock Banner */}
              {isFrozen ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 flex items-start gap-2.5 shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-emerald-900">
                    <span className="font-bold block">Academic Baseline Frozen & Audited</span>
                    <p className="text-[11px] text-emerald-700 leading-snug">
                      Approved by{" "}
                      <strong>
                        {data.prospectus?.frozen_by_employee
                          ? `${data.prospectus.frozen_by_employee.first_name} ${data.prospectus.frozen_by_employee.last_name}`
                          : "Authorized Staff"}
                      </strong>
                      {data.prospectus?.frozen_by_employee?.user?.role && (
                        <span>
                          {" "}
                          (
                          {data.prospectus.frozen_by_employee.user.role.charAt(0) +
                            data.prospectus.frozen_by_employee.user.role.slice(1).toLowerCase()}
                          )
                        </span>
                      )}
                      {data.prospectus?.frozen_by_employee?.title && (
                        <span> • {data.prospectus.frozen_by_employee.title}</span>
                      )}
                      {data.prospectus?.frozen_at && (
                        <span>
                          {" "}
                          on{" "}
                          {new Date(data.prospectus.frozen_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 flex items-center gap-2 shrink-0">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-amber-900">
                    Prospectus pending review — verify subjects before freezing
                  </span>
                </div>
              )}

              {/* Subject Table Column Headers */}
              <div className="grid grid-cols-12 gap-2 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                <div className="col-span-3">Code</div>
                <div className="col-span-4">Descriptive Title</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Grade</div>
                {!isFrozen && <div className="col-span-1 text-right">Action</div>}
              </div>

              {/* Editable Subjects Table */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                {subjectsList.map((sub, idx) => (
                  <div
                    key={sub.subject_id ? `subj-id-${sub.subject_id}` : `subj-idx-${sub.subject_code}-${idx}`}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs shadow-xs"
                  >
                    <div className="col-span-3">
                      <Input
                        value={sub.subject_code}
                        onChange={(e) => handleFieldChange(idx, "subject_code", e.target.value)}
                        className="h-8 text-xs font-mono py-1"
                        disabled={isFrozen}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={sub.descriptive_title}
                        onChange={(e) => handleFieldChange(idx, "descriptive_title", e.target.value)}
                        className="h-8 text-xs py-1"
                        disabled={isFrozen}
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={sub.status || "UNTAKEN"}
                        onValueChange={(val) => handleFieldChange(idx, "status", val)}
                        disabled={isFrozen}
                      >
                        <SelectTrigger size="sm" className="h-8 text-xs py-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNTAKEN">Untaken</SelectItem>
                          <SelectItem value="CREDITED">Credited</SelectItem>
                          <SelectItem value="ENROLLED">Enrolled</SelectItem>
                          <SelectItem value="PASSED">Passed</SelectItem>
                          <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Grade"
                        value={sub.grade ?? ""}
                        onChange={(e) =>
                          handleFieldChange(idx, "grade", e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        className="h-8 text-xs font-mono py-1"
                        disabled={isFrozen}
                      />
                    </div>
                    {!isFrozen && (
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubject(idx)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {!isFrozen && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubject}
                    className="w-full gap-1 text-xs h-8 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subject
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 mt-auto flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-slate-500">
                  Total: <strong>{subjectsList.length}</strong> subjects
                </div>

                <div className="flex items-center gap-2">
                  {!isFrozen ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveSubjects}
                        disabled={saving || !data?.prospectus}
                        className="h-9.5 rounded-xl gap-1.5 text-xs font-semibold px-3.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "Saving..." : "Save Edits"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleFreeze}
                        disabled={actionLoading || !data?.prospectus}
                        className="h-9.5 rounded-xl gap-1.5 text-xs font-bold px-4 bg-[#0a4f42] hover:bg-[#083c32] text-white shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {actionLoading ? "Freezing..." : "Freeze & Approve Baseline"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnfreeze}
                      disabled={actionLoading}
                      className="h-9.5 rounded-xl gap-1.5 text-xs font-semibold px-3.5 border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      {actionLoading ? "Unfreezing..." : "Unlock / Unfreeze Baseline"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
