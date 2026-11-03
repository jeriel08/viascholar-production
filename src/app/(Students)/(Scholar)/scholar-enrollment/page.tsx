"use client";

import { AlertCircle, AlertTriangle, BookOpen, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BillingAssessmentSummary } from "./components/BillingAssessmentSummary";
import { EndorsementFinishedCard } from "./components/EndorsementFinishedCard";
import { EnrolledSubjectsReview } from "./components/EnrolledSubjectsReview";
import { EnrollmentAcademicLockCard } from "./components/EnrollmentAcademicLockCard";
import { EnrollmentAuditSummaryCard } from "./components/EnrollmentAuditSummaryCard";
import { EnrollmentPendingReviewCard } from "./components/EnrollmentPendingReviewCard";
import { EnrollmentUploadSection } from "./components/EnrollmentUploadSection";
import { ScholarTermContextCard } from "./components/ScholarTermContextCard";
import { useScholarEnrollmentState } from "./hooks/useScholarEnrollmentState";

export default function ScholarEnrollmentPage() {
  const {
    loading,
    error,
    enrollmentState,
    academicLock,
    isAcademicLocked,
    fetchState,
    isConsolidated,
    setIsConsolidated,
    isUploadingCor,
    isUploadingSoa,
    isUploadingConsolidated,
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
    totalAssessment,
    assessmentDate,
    billingBreakdown,
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
  } = useScholarEnrollmentState();

  const isDraft = status === "DRAFT";
  const isApproved = status === "APPROVED";
  const isPending = status === "PENDING_REVIEW";
  const hasAlreadySubmitted = isApproved || isPending;
  const isUploading = isUploadingCor || isUploadingSoa || isUploadingConsolidated;
  const hasUploadedCredentials =
    enrolledSubjects.length > 0 ||
    totalAssessment > 0 ||
    !!corFile ||
    !!soaFile ||
    !!consolidatedFile ||
    hasAlreadySubmitted;
  const totalUnits = enrolledSubjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0);

  return (
    <div className="flex min-h-full flex-col bg-[#FAF9F7]">
      <PageHeader
        title="Start-of-Term Enrollment & SOA Audit"
        subtitle="Submit university Certificate of Registration (COR) and Statement of Account (SOA) for baseline compliance audit and tuition endorsement."
      />

      <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {loading && !enrollmentState ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : error || !enrollmentState ? (
          <Card className="max-w-xl mx-auto text-center p-8 border-border">
            <AlertCircle className="size-12 text-destructive mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground">Error Loading Enrollment</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{error || "Could not retrieve enrollment state."}</p>
            <Button onClick={fetchState} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              Try Again
            </Button>
          </Card>
        ) : !enrollmentState.prospectus_frozen ? (
          <Card className="max-w-2xl mx-auto text-center p-8 border-border">
            <AlertTriangle className="size-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground">Academic Baseline Not Yet Frozen</h2>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1 mb-5">
              Your coordinator must review and freeze your official academic prospectus baseline before start-of-term
              enrollment credentials can be audited.
            </p>
            <Button asChild className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
              <Link href="/scholarProspectus">
                <BookOpen className="size-4" />
                <span>Go to Scholar Prospectus</span>
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Header Scholar & Term Context Card */}
            <ScholarTermContextCard enrollmentState={enrollmentState} loading={loading} onRefresh={fetchState} />

            {/* If Scholar has active academic standing lock (appeal pending / probation review), display lock card */}
            {isAcademicLocked && academicLock ? (
              <EnrollmentAcademicLockCard lock={academicLock} />
            ) : (
              <>
                {/* If endorsement has completed, show dedicated EndorsementFinishedCard */}
                {isApproved && (
                  <EndorsementFinishedCard
                    enrollmentState={enrollmentState}
                    totalAssessment={totalAssessment}
                    subjectsCount={enrolledSubjects.length}
                    totalUnits={totalUnits}
                  />
                )}

                {/* If pending coordinator review, show dedicated pending card */}
                {isPending && (
                  <EnrollmentPendingReviewCard
                    enrollmentState={enrollmentState}
                    totalAssessment={totalAssessment}
                    subjectsCount={enrolledSubjects.length}
                    totalUnits={totalUnits}
                    coordinatorNotes={enrollmentState.enrollment?.coordinator_notes}
                  />
                )}

                {/* Upload Dropzones & Mode Toggle */}
                <EnrollmentUploadSection
                  isConsolidated={isConsolidated}
                  onToggleConsolidated={setIsConsolidated}
                  isReadOnly={isReadOnly}
                  isUploadingConsolidated={isUploadingConsolidated}
                  consolidatedFile={consolidatedFile}
                  onUploadConsolidated={handleConsolidatedUpload}
                  onClearConsolidated={handleClearConsolidated}
                  isUploadingCor={isUploadingCor}
                  corFile={corFile}
                  onUploadCor={handleCorUpload}
                  onClearCor={handleClearCor}
                  isUploadingSoa={isUploadingSoa}
                  soaFile={soaFile}
                  onUploadSoa={handleSoaUpload}
                  onClearSoa={handleClearSoa}
                />

                {/* Progressive Disclosure: OCR Loading Skeleton -> Empty State Guide -> Smooth Animated Review Cards */}
                {isUploading ? (
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-6 sm:p-7 space-y-4 animate-in fade-in duration-300 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Loader2 className="size-5 animate-spin text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy">Reading Documents & Checking Requirements...</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          We&apos;re reading your uploaded files to gather your enrolled subjects, units, and tuition
                          details automatically.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-2">
                      <Skeleton className="h-32 w-full rounded-xl" />
                      <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                  </div>
                ) : !hasUploadedCredentials ? (
                  <div className="rounded-2xl border border-dashed border-border bg-white/70 p-8 sm:p-10 text-center space-y-3 shadow-2xs animate-in fade-in duration-200">
                    <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                      <FileText className="size-6 text-emerald-700" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-navy">Upload Credentials to Start Audit</h3>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Upload your university registration (COR) and tuition statement (SOA) above. Once uploaded, the
                        system will automatically extract your enrolled courses, compute your tuition ledger, and verify
                        compliance against your academic baseline.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    {/* Enrolled Subjects Review - Read-Only for Scholars */}
                    <EnrolledSubjectsReview subjects={enrolledSubjects} isReadOnly={true} />

                    {/* Billing Assessment Summary - Read-Only for Scholars */}
                    <BillingAssessmentSummary
                      totalAssessment={totalAssessment}
                      assessmentDate={assessmentDate}
                      billingBreakdown={billingBreakdown}
                      isReadOnly={true}
                    />

                    {/* Automated Baseline Audit Pre-Check Card & Actions (Hidden if scholar has already submitted) */}
                    {!hasAlreadySubmitted && (
                      <EnrollmentAuditSummaryCard
                        auditResult={auditResult}
                        isSubmitting={isSubmitting}
                        isSavingDraft={isSavingDraft}
                        canSubmit={
                          (isConsolidated ? !!consolidatedFile : !!corFile || !!soaFile) || enrolledSubjects.length > 0
                        }
                        status={status}
                        coordinatorNotes={enrollmentState.enrollment?.coordinator_notes}
                        onSubmit={handleSubmit}
                        onSaveDraft={handleSaveDraft}
                        onDiscardDraft={handleDiscardDraft}
                        hasDraft={
                          isDraft ||
                          enrolledSubjects.length > 0 ||
                          totalAssessment > 0 ||
                          !!corFile ||
                          !!soaFile ||
                          !!consolidatedFile
                        }
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
