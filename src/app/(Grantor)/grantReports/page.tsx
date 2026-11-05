"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AcademicAnalyticsCard } from "@/components/analytics/AcademicAnalyticsCard";
import { AiChartExplanationModal } from "@/components/analytics/AiChartExplanationModal";
import { ExportAnalyticsButton } from "@/components/analytics/ExportAnalyticsButton";
import { FinancialAnalyticsCard } from "@/components/analytics/FinancialAnalyticsCard";
import { ScholarStatusRosterTable } from "@/components/analytics/ScholarStatusRosterTable";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocketEvent } from "@/contexts/SocketContext";
import {
  type AiExplanationResponse,
  type AnalyticsSummaryResponse,
  explainAnalyticsChart,
  getAnalyticsSummary,
} from "@/lib/api/analytics";

export default function GrantAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Term & School Year Filter State (Sourced dynamically from the database)
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");

  // AI Explanation Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiCategory, setAiCategory] = useState<string | undefined>(undefined);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AiExplanationResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (sem?: string, ay?: string) => {
    try {
      setError(null);
      const res = await getAnalyticsSummary({
        semester: sem || undefined,
        academicYear: ay || undefined,
      });
      setData(res);

      if (res.filterOptions) {
        if (!sem || !res.filterOptions.availableSemesters.includes(sem)) {
          setSelectedSemester(res.filterOptions.selectedSemester);
        }
        if (!ay || !res.filterOptions.availableAcademicYears.includes(ay)) {
          setSelectedAcademicYear(res.filterOptions.selectedAcademicYear);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to load analytics data.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-Time Socket Event Handlers (Automatic sync when records update)
  useSocketEvent("disbursement:created", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("disbursement:updated", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("disbursement:authorized", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("disbursement:or_submitted", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("enrollment:approved", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("enrollment:submitted_for_review", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("enrollment:changes_requested", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("enrollment:rejected", () => fetchAnalytics(selectedSemester, selectedAcademicYear));
  useSocketEvent("document:verified", () => fetchAnalytics(selectedSemester, selectedAcademicYear));

  // Dynamic filter lists strictly from the database
  const availableYears = useMemo(() => {
    return data?.filterOptions?.availableAcademicYears || [];
  }, [data?.filterOptions?.availableAcademicYears]);

  // Semesters/Trimesters that actually exist in the database for the selected Academic Year
  const availableSemesters = useMemo(() => {
    if (selectedAcademicYear && data?.filterOptions?.termsByYear?.[selectedAcademicYear]) {
      const termsForYear = data.filterOptions.termsByYear[selectedAcademicYear];
      if (termsForYear.length > 0) return termsForYear;
    }
    return data?.filterOptions?.availableSemesters || [];
  }, [selectedAcademicYear, data?.filterOptions?.termsByYear, data?.filterOptions?.availableSemesters]);

  const handleYearChange = (newYear: string) => {
    setSelectedAcademicYear(newYear);
    const validSemesters =
      newYear !== "ALL" && data?.filterOptions?.termsByYear?.[newYear]
        ? data.filterOptions.termsByYear[newYear]
        : data?.filterOptions?.availableSemesters || [];

    let nextSem = selectedSemester;
    if (!validSemesters.includes(selectedSemester) && validSemesters.length > 0) {
      nextSem = validSemesters[0];
      setSelectedSemester(nextSem);
    }
    fetchAnalytics(nextSem, newYear);
  };

  const handleSemesterChange = (newSemester: string) => {
    setSelectedSemester(newSemester);
    fetchAnalytics(newSemester, selectedAcademicYear);
  };

  const handleExplain = async (
    chartType: string,
    title: string,
    metrics: Record<string, unknown>,
    category?: string,
  ) => {
    setAiTitle(title);
    setAiCategory(category);
    setAiExplanation(null);
    setAiError(null);
    setAiLoading(true);
    setAiModalOpen(true);

    try {
      const res = await explainAnalyticsChart({
        chartType,
        title,
        category,
        metrics,
      });
      setAiExplanation(res);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Could not generate AI explanation.";
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const termLabel = useMemo(() => {
    if (!selectedSemester && !selectedAcademicYear) return "Active Term";
    if (selectedAcademicYear === "ALL") {
      return selectedSemester || "All Years";
    }
    return `${selectedSemester}, SY ${selectedAcademicYear}`;
  }, [selectedSemester, selectedAcademicYear]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAF8F5]">
      {/* Top Header: Semester [Dropdown] SY [Dropdown] [Export button] [notification button] */}
      <PageHeader
        title="Analytics"
        subtitle="Semester imbursement summary & scholar academic progress"
        notificationPlacement="end"
        actions={
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Semester / Trimester Filter (Strictly Database-Sourced) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                Semester
              </span>
              <Select
                value={selectedSemester}
                onValueChange={handleSemesterChange}
                disabled={availableSemesters.length === 0}
              >
                <SelectTrigger className="h-8.5 min-w-32 max-w-44 rounded-xl border-line/80 bg-white text-xs font-semibold text-[#14213a] shadow-2xs">
                  <SelectValue placeholder={availableSemesters[0] || "Semester"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-line bg-white shadow-xl">
                  {availableSemesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Year (SY) Filter (Strictly Database-Sourced) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                SY
              </span>
              <Select
                value={selectedAcademicYear}
                onValueChange={handleYearChange}
                disabled={availableYears.length === 0}
              >
                <SelectTrigger className="h-8.5 w-28 sm:w-32 rounded-xl border-line/80 bg-white text-xs font-semibold text-[#14213a] shadow-2xs">
                  <SelectValue placeholder={availableYears[0] || "School Year"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-line bg-white shadow-xl">
                  {availableYears.map((ay) => (
                    <SelectItem key={ay} value={ay}>
                      {ay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export CSV Button */}
            <ExportAnalyticsButton data={data} userRole="GRANTOR" termLabel={termLabel} />
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {loading && !data ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
            <div className="size-9 animate-spin rounded-full border-3 border-[#0a4f42] border-t-transparent" />
            <p className="text-xs font-bold text-[#14213a]">Loading analytics...</p>
            <p className="text-[11px] text-muted-foreground">
              Calculating scholarship funding, disbursed proportions, and academic progress.
            </p>
          </div>
        ) : error && !data ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
            <p className="font-bold">Failed to load analytics</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(selectedSemester, selectedAcademicYear)}
              className="mt-4 rounded-xl text-xs"
            >
              Retry
            </Button>
          </div>
        ) : data ? (
          <>
            {/* 1. Financial Aspect */}
            {data.financialAspect && (
              <FinancialAnalyticsCard
                data={data.financialAspect}
                narrative={data.descriptiveNarratives?.financialSummary}
                termLabel={termLabel}
                onExplain={handleExplain}
              />
            )}

            {/* 2. Academic Aspect */}
            {data.academicAspect && (
              <AcademicAnalyticsCard
                data={data.academicAspect}
                narrative={data.descriptiveNarratives?.academicSummary}
                termLabel={termLabel}
                globalThreshold={data.globalThresholdPercent}
                onExplain={handleExplain}
              />
            )}

            {/* 3. Operational Scholar Status Table */}
            <ScholarStatusRosterTable
              scholars={data.scholars || []}
              termLabel={termLabel}
            />
          </>
        ) : null}
      </main>

      {/* AI Explanation Modal */}
      <AiChartExplanationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={aiTitle}
        category={aiCategory}
        loading={aiLoading}
        explanation={aiExplanation}
        error={aiError}
      />
    </div>
  );
}
