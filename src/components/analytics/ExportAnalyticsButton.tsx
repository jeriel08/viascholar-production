"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnalyticsSummaryResponse } from "@/lib/api/analytics";

interface ExportAnalyticsButtonProps {
  data: AnalyticsSummaryResponse | null;
  userRole: "GRANTOR" | "COORDINATOR";
  termLabel?: string;
}

export function ExportAnalyticsButton({ data, userRole, termLabel }: ExportAnalyticsButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = () => {
    if (!data) return;
    setExporting(true);

    try {
      const rows: string[] = [];
      const period = termLabel || "Active Semester";

      // 1. Header Information
      rows.push(`"ViaScholar Descriptive Analytics Report (${userRole} View)"`);
      rows.push(`"Academic Period:","${period}"`);
      rows.push(`"Generated On:","${new Date().toLocaleString()}"`);
      rows.push(`"Global Retention Threshold:","${data.globalThresholdPercent}%"`);
      rows.push("");

      // 2. Financial Aspect Summary
      if (data.financialAspect) {
        rows.push(`"=== FINANCIAL ASPECT: SEMESTER DISBURSEMENTS ==="`);
        rows.push(`"Metric","Value"`);
        rows.push(`"Total Active Scholars (N)","${data.financialAspect.totalScholarsCount}"`);
        rows.push(`"Scholars Given Disbursement","${data.financialAspect.disbursedCount} (${data.financialAspect.disbursedPercent}%)"`);
        rows.push(`"Scholars Not Given Disbursement","${data.financialAspect.undisbursedCount} (${data.financialAspect.undisbursedPercent}%)"`);
        rows.push(`"Total Semester Imbursement (Projected)","PHP ${data.financialAspect.totalSemesterAssessment.toLocaleString()}"`);
        rows.push(`"Total Disbursed to Date","PHP ${data.financialAspect.totalDisbursedAmount.toLocaleString()}"`);
        rows.push(`"Pending Imbursement Remaining","PHP ${data.financialAspect.totalPendingAmount.toLocaleString()}"`);
        if (data.descriptiveNarratives?.financialSummary) {
          rows.push(`"Financial Descriptive Summary","${data.descriptiveNarratives.financialSummary.replace(/"/g, '""')}"`);
        }
        rows.push("");
      }

      // 3. Academic Aspect Summary
      if (data.academicAspect) {
        rows.push(`"=== ACADEMIC ASPECT: SCHOLAR COMPLIANCE & STANDING ==="`);
        rows.push(`"Metric","Value"`);
        rows.push(`"Unsubmitted Grades","${data.academicAspect.unsubmittedGradesCount} (${data.academicAspect.unsubmittedGradesPercent}%)"`);
        rows.push(`"Submitted Grades","${data.academicAspect.submittedGradesCount} (${data.academicAspect.submittedGradesPercent}%)"`);
        rows.push(`"Not Enrolled Yet (Missing COR)","${data.academicAspect.notEnrolledCount} (${data.academicAspect.notEnrolledPercent}%)"`);
        rows.push(`"Enrolled Scholars","${data.academicAspect.enrolledCount} (${data.academicAspect.enrolledPercent}%)"`);
        rows.push(`"Graduating Scholars (4th Year+)","${data.academicAspect.graduatingCount} (${data.academicAspect.graduatingPercent}%)"`);
        rows.push(`"Undergraduate Scholars (Years 1-3)","${data.academicAspect.undergradCount} (${data.academicAspect.undergradPercent}%)"`);
        rows.push(`"Good Standing (Meeting Retention Mark)","${data.academicAspect.standingBreakdown.goodStandingCount} (${data.academicAspect.standingBreakdown.goodStandingPercent}%)"`);
        rows.push(`"On Watch / Probation","${data.academicAspect.standingBreakdown.probationCount} (${data.academicAspect.standingBreakdown.probationPercent}%)"`);
        rows.push(`"At Risk / Flagged","${data.academicAspect.standingBreakdown.flaggedCount} (${data.academicAspect.standingBreakdown.flaggedPercent}%)"`);
        if (data.descriptiveNarratives?.academicSummary) {
          rows.push(`"Academic Descriptive Summary","${data.descriptiveNarratives.academicSummary.replace(/"/g, '""')}"`);
        }
        rows.push("");

        // Year Level Breakdown
        rows.push(`"=== YEAR-LEVEL DISTRIBUTION ==="`);
        rows.push(`"Year Level","Count","Percentage"`);
        data.academicAspect.yearLevelBreakdown.forEach((y) => {
          rows.push(`"${y.label}","${y.count}","${y.pct}%"`);
        });
        rows.push("");
      }

      // 4. Individual Scholar Roster
      if (data.scholars && data.scholars.length > 0) {
        rows.push(`"=== INDIVIDUAL SCHOLAR STATUS ROSTER ==="`);
        rows.push(
          `"Scholar Name","Email","Institution","Degree Program","Track","Year Level","Graduating","Enrollment Status","Grade Report","GWA","Disbursement Status","Disbursed Amount","Assessment Due"`,
        );
        data.scholars.forEach((s) => {
          rows.push(
            `"${s.name}","${s.email}","${s.school}","${s.course}","${s.track}","Year ${s.yearLevel}","${s.isGraduating ? "YES" : "NO"}","${s.enrollmentStatus}","${s.gradeStatus}","${s.gwa > 0 ? s.gwa.toFixed(2) : "N/A"}","${s.disbursementStatus}","${s.disbursedAmount}","${s.assessmentAmount}"`,
          );
        });
      }

      // Trigger download
      const csvString = rows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `ViaScholar_Analytics_${userRole}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export analytics CSV:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={exporting || !data}
      onClick={handleExportCsv}
      className="h-9 gap-1.5 rounded-xl border-line/80 bg-white text-xs font-semibold text-[#14213a] hover:bg-[#FAF8F5] shadow-2xs"
    >
      <Download className={`size-3.5 ${exporting ? "animate-bounce" : ""}`} />
      <span className="hidden sm:inline">Export CSV</span>
    </Button>
  );
}
