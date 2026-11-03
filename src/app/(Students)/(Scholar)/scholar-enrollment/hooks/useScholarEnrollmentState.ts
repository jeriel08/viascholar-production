"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { SocketContext } from "@/contexts/SocketContext";
import {
  type BillingBreakdown,
  type CurrentEnrollmentState,
  clearDraftDocument,
  discardEnrollmentDraft,
  type EnrolledSubjectItem,
  type EnrollmentAuditResult,
  getCurrentEnrollment,
  runPreAudit,
  saveEnrollmentDraft,
  submitTermEnrollment,
  uploadConsolidatedDocument,
  uploadCorDocument,
  uploadSoaDocument,
} from "@/lib/api/enrollment";

export function useScholarEnrollmentState() {
  const { socket } = useContext(SocketContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentState, setEnrollmentState] = useState<CurrentEnrollmentState | null>(null);

  // Upload & mode state
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [isUploadingCor, setIsUploadingCor] = useState(false);
  const [isUploadingSoa, setIsUploadingSoa] = useState(false);
  const [isUploadingConsolidated, setIsUploadingConsolidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Form & Extracted Data state
  const [corDocId, setCorDocId] = useState<number | undefined>();
  const [soaDocId, setSoaDocId] = useState<number | undefined>();
  const [corFile, setCorFile] = useState<{
    name: string;
    size?: string;
    url?: string;
  } | null>(null);
  const [soaFile, setSoaFile] = useState<{
    name: string;
    size?: string;
    url?: string;
  } | null>(null);
  const [consolidatedFile, setConsolidatedFile] = useState<{
    name: string;
    size?: string;
    url?: string;
  } | null>(null);

  const [academicYear, setAcademicYear] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [yearLevel, setYearLevel] = useState<number>(1);

  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubjectItem[]>([]);
  const [totalAssessment, setTotalAssessment] = useState<number>(0);
  const [assessmentDate, setAssessmentDate] = useState<string>("");
  const [billingBreakdown, setBillingBreakdown] = useState<BillingBreakdown>({});
  const [auditResult, setAuditResult] = useState<EnrollmentAuditResult | null>(null);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentEnrollment();
      setEnrollmentState(data);

      if (data.enrollment) {
        setAcademicYear(data.enrollment.academic_year || "");
        setSemester(data.enrollment.semester || "");
        setYearLevel(data.enrollment.year_level || data.scholar.current_year_level || 1);
        setIsConsolidated(data.enrollment.is_consolidated);
        setEnrolledSubjects(data.enrollment.enrolled_subjects || []);
        setTotalAssessment(Number(data.enrollment.total_assessment) || 0);
        setAssessmentDate(data.enrollment.assessment_date ? data.enrollment.assessment_date.slice(0, 10) : "");
        setBillingBreakdown(data.enrollment.billing_breakdown || {});
        setCorDocId(data.enrollment.cor_document_id ?? undefined);
        setSoaDocId(data.enrollment.soa_document_id ?? undefined);

        if (data.enrollment.is_consolidated && data.enrollment.cor_document) {
          setConsolidatedFile({
            name: data.enrollment.cor_document.file_name,
            size: data.enrollment.cor_document.file_size,
            url: data.enrollment.cor_document.file_url,
          });
          setCorFile(null);
          setSoaFile(null);
        } else {
          setConsolidatedFile(null);
          if (data.enrollment.cor_document) {
            setCorFile({
              name: data.enrollment.cor_document.file_name,
              size: data.enrollment.cor_document.file_size,
              url: data.enrollment.cor_document.file_url,
            });
          } else {
            setCorFile(null);
          }
          if (data.enrollment.soa_document) {
            setSoaFile({
              name: data.enrollment.soa_document.file_name,
              size: data.enrollment.soa_document.file_size,
              url: data.enrollment.soa_document.file_url,
            });
          } else {
            setSoaFile(null);
          }
        }
      } else {
        setAcademicYear("");
        setSemester("");
        setYearLevel(data.scholar?.current_year_level || 1);
        setEnrolledSubjects([]);
        setTotalAssessment(0);
        setAssessmentDate("");
        setBillingBreakdown({});
        setCorDocId(undefined);
        setSoaDocId(undefined);
        setCorFile(null);
        setSoaFile(null);
        setConsolidatedFile(null);
        setAuditResult(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load enrollment state.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchState();
      toast.info("Enrollment status updated by coordinator.");
    };
    const handleAppealUpdate = () => {
      fetchState();
    };
    socket.on("enrollment:approved", handleUpdate);
    socket.on("enrollment:changes_requested", handleUpdate);
    socket.on("enrollment:rejected", handleUpdate);
    socket.on("grade_report:appeal_decided", handleAppealUpdate);
    socket.on("grade_report:appealed", handleAppealUpdate);
    socket.on("grade_report:verified", handleAppealUpdate);
    return () => {
      socket.off("enrollment:approved", handleUpdate);
      socket.off("enrollment:changes_requested", handleUpdate);
      socket.off("enrollment:rejected", handleUpdate);
      socket.off("grade_report:appeal_decided", handleAppealUpdate);
      socket.off("grade_report:appealed", handleAppealUpdate);
      socket.off("grade_report:verified", handleAppealUpdate);
    };
  }, [socket, fetchState]);

  // Trigger pre-audit when subjects or term details change
  useEffect(() => {
    if (enrolledSubjects.length === 0) {
      setAuditResult(null);
      return;
    }
    let isCancelled = false;
    const ay = academicYear || enrollmentState?.enrollment?.academic_year || "2025-2026";
    const sem = semester || enrollmentState?.enrollment?.semester || "1st Semester";
    const yr =
      yearLevel || enrollmentState?.enrollment?.year_level || enrollmentState?.scholar?.current_year_level || 1;

    runPreAudit({
      academic_year: ay,
      semester: sem,
      year_level: yr,
      total_units: enrolledSubjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0),
      enrolled_subjects: enrolledSubjects,
      total_assessment: totalAssessment,
      assessment_date: assessmentDate || undefined,
    })
      .then((res) => {
        if (!isCancelled) setAuditResult(res);
      })
      .catch((err) => {
        console.error("Live pre-audit failed:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [
    enrolledSubjects,
    totalAssessment,
    assessmentDate,
    academicYear,
    semester,
    yearLevel,
    enrollmentState?.enrollment?.academic_year,
    enrollmentState?.enrollment?.semester,
    enrollmentState?.enrollment?.year_level,
    enrollmentState?.scholar?.current_year_level,
  ]);

  const updateExtractedState = (extractedData?: Record<string, unknown>) => {
    if (!extractedData) return;
    if (typeof extractedData.academic_year === "string") setAcademicYear(extractedData.academic_year);
    if (typeof extractedData.semester === "string") setSemester(extractedData.semester);
    if (typeof extractedData.year_level === "number" || typeof extractedData.year_level === "string") {
      setYearLevel(Number(extractedData.year_level) || 1);
    }
    if (Array.isArray(extractedData.subjects) && extractedData.subjects.length > 0) {
      setEnrolledSubjects(extractedData.subjects as EnrolledSubjectItem[]);
    }
    if (extractedData.total_assessment != null && Number(extractedData.total_assessment) > 0) {
      setTotalAssessment(Number(extractedData.total_assessment));
    }
    if (typeof extractedData.assessment_date === "string") {
      setAssessmentDate(extractedData.assessment_date.slice(0, 10));
    }
    if (extractedData.billing_breakdown && typeof extractedData.billing_breakdown === "object") {
      setBillingBreakdown(extractedData.billing_breakdown as BillingBreakdown);
    }
  };

  const handleCorUpload = async (file: File) => {
    try {
      setIsUploadingCor(true);
      const res = await uploadCorDocument(file);
      setCorDocId(res.document_id);
      setCorFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, url: res.file_url });
      updateExtractedState(res.extracted_data);
      if (res.audit_result) setAuditResult(res.audit_result);
      toast.success("Certificate of Registration parsed & saved to draft!");
      fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload COR.");
    } finally {
      setIsUploadingCor(false);
    }
  };

  const handleSoaUpload = async (file: File) => {
    try {
      setIsUploadingSoa(true);
      const res = await uploadSoaDocument(file);
      setSoaDocId(res.document_id);
      setSoaFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, url: res.file_url });
      updateExtractedState(res.extracted_data);
      if (res.audit_result) setAuditResult(res.audit_result);
      toast.success("Statement of Account parsed & saved to draft!");
      fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload SOA.");
    } finally {
      setIsUploadingSoa(false);
    }
  };

  const handleConsolidatedUpload = async (file: File) => {
    try {
      setIsUploadingConsolidated(true);
      const res = await uploadConsolidatedDocument(file);
      setCorDocId(res.document_id);
      setConsolidatedFile({ name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, url: res.file_url });
      updateExtractedState(res.extracted_data);
      if (res.audit_result) setAuditResult(res.audit_result);
      toast.success("Consolidated Matriculation parsed & saved to draft!");
      fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload consolidated form.");
    } finally {
      setIsUploadingConsolidated(false);
    }
  };

  const handleClearCor = async () => {
    try {
      setCorFile(null);
      setCorDocId(undefined);
      setEnrolledSubjects([]);
      setAuditResult(null);
      await clearDraftDocument("cor");
      toast.success("Proof of Enrolled Subjects removed from draft.");
      await fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear document.");
    }
  };

  const handleClearSoa = async () => {
    try {
      setSoaFile(null);
      setSoaDocId(undefined);
      setTotalAssessment(0);
      setAssessmentDate("");
      setBillingBreakdown({});
      setAuditResult(null);
      await clearDraftDocument("soa");
      toast.success("Proof of Billing Assessment removed from draft.");
      await fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear document.");
    }
  };

  const handleClearConsolidated = async () => {
    try {
      setConsolidatedFile(null);
      setCorDocId(undefined);
      setSoaDocId(undefined);
      setEnrolledSubjects([]);
      setTotalAssessment(0);
      setAssessmentDate("");
      setBillingBreakdown({});
      setAuditResult(null);
      await clearDraftDocument("consolidated");
      toast.success("Consolidated enrollment form removed from draft.");
      await fetchState();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear document.");
    }
  };

  const getPayload = () => {
    const ay = academicYear || enrollmentState?.enrollment?.academic_year || "2025-2026";
    const sem = semester || enrollmentState?.enrollment?.semester || "1st Semester";
    const yr =
      yearLevel || enrollmentState?.enrollment?.year_level || enrollmentState?.scholar?.current_year_level || 1;
    return {
      academic_year: ay,
      semester: sem,
      year_level: yr,
      is_consolidated: isConsolidated,
      cor_document_id: corDocId,
      soa_document_id: isConsolidated ? corDocId : soaDocId,
      total_units: enrolledSubjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0),
      total_assessment: totalAssessment,
      assessment_date: assessmentDate || undefined,
      enrolled_subjects: enrolledSubjects,
      billing_breakdown: billingBreakdown,
    };
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const res = await saveEnrollmentDraft(getPayload());
      toast.success(res.message);
      fetchState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save draft.";
      toast.error(msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleDiscardDraft = async () => {
    try {
      setLoading(true);
      await discardEnrollmentDraft();
      setAcademicYear("");
      setSemester("");
      setYearLevel(enrollmentState?.scholar?.current_year_level || 1);
      setEnrolledSubjects([]);
      setTotalAssessment(0);
      setAssessmentDate("");
      setBillingBreakdown({});
      setCorDocId(undefined);
      setSoaDocId(undefined);
      setCorFile(null);
      setSoaFile(null);
      setConsolidatedFile(null);
      setAuditResult(null);
      toast.success("Draft cleared. You can upload fresh documents.");
      fetchState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to clear draft.";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const hasDocuments = isConsolidated
      ? !!consolidatedFile || !!corDocId
      : (!!corFile || !!corDocId) && (!!soaFile || !!soaDocId);
    if (!hasDocuments && enrolledSubjects.length === 0) {
      toast.error("Please upload your Certificate of Registration and Statement of Account before submitting.");
      return;
    }
    if (totalAssessment < 0) {
      toast.error("Tuition assessment balance cannot be negative.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitTermEnrollment(getPayload());
      toast.success(res.message);
      fetchState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit term enrollment.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAcademicLocked = Boolean(enrollmentState?.academic_lock?.is_locked);
  const isReadOnly =
    isAcademicLocked ||
    enrollmentState?.enrollment?.status === "APPROVED" ||
    enrollmentState?.enrollment?.status === "PENDING_REVIEW";
  const status = enrollmentState?.enrollment?.status || "NOT_SUBMITTED";

  return {
    loading,
    error,
    enrollmentState,
    academicLock: enrollmentState?.academic_lock,
    isAcademicLocked,
    fetchState,
    isConsolidated,
    setIsConsolidated,
    isUploadingCor,
    setIsUploadingCor,
    isUploadingSoa,
    setIsUploadingSoa,
    isUploadingConsolidated,
    setIsUploadingConsolidated,
    isSubmitting,
    isSavingDraft,
    corFile,
    setCorFile,
    soaFile,
    setSoaFile,
    consolidatedFile,
    setConsolidatedFile,
    setCorDocId,
    setSoaDocId,
    enrolledSubjects,
    setEnrolledSubjects,
    totalAssessment,
    setTotalAssessment,
    assessmentDate,
    setAssessmentDate,
    billingBreakdown,
    setBillingBreakdown,
    auditResult,
    handleCorUpload,
    handleSoaUpload,
    handleConsolidatedUpload,
    handleClearCor,
    handleClearSoa,
    handleClearConsolidated,
    handleSaveDraft,
    handleDiscardDraft,
    handleSubmit,
    isReadOnly,
    status,
    academicYear: academicYear || enrollmentState?.enrollment?.academic_year || "",
    setAcademicYear,
    semester: semester || enrollmentState?.enrollment?.semester || "",
    setSemester,
    yearLevel:
      yearLevel ||
      enrollmentState?.enrollment?.year_level ||
      enrollmentState?.scholar?.current_year_level ||
      1,
    setYearLevel,
  };
}
