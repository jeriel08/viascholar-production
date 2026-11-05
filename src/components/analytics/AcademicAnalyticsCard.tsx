"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  UserCheck,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AcademicAspectData } from "@/lib/api/analytics";

interface AcademicAnalyticsCardProps {
  data: AcademicAspectData;
  narrative?: string;
  termLabel: string;
  globalThreshold: number;
  onExplain: (chartType: string, title: string, metrics: Record<string, unknown>) => void;
}

export function AcademicAnalyticsCard({
  data,
  narrative,
  termLabel,
  globalThreshold,
  onExplain,
}: AcademicAnalyticsCardProps) {
  const handleExplain = () => {
    onExplain("ACADEMIC_COMPLIANCE_SUMMARY", "Academic & Retention Compliance Overview", {
      unsubmittedGradesPercent: data.unsubmittedGradesPercent,
      unsubmittedGradesCount: data.unsubmittedGradesCount,
      submittedGradesPercent: data.submittedGradesPercent,
      submittedGradesCount: data.submittedGradesCount,
      notEnrolledPercent: data.notEnrolledPercent,
      notEnrolledCount: data.notEnrolledCount,
      enrolledPercent: data.enrolledPercent,
      enrolledCount: data.enrolledCount,
      graduatingPercent: data.graduatingPercent,
      graduatingCount: data.graduatingCount,
      totalScholarsCount: data.totalScholarsCount,
      standing: data.standingBreakdown,
      yearLevels: data.yearLevelBreakdown,
      termLabel,
    });
  };

  return (
    <Card className="rounded-2xl border-line/80 bg-white shadow-2xs hover:shadow-xs transition-all overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-3 border-b border-line/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8.5 items-center justify-center rounded-xl bg-[#14213a]/10 text-[#14213a]">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#14213a]">Academic Aspect: Scholar Compliance & Standing</h2>
              <Badge variant="outline" className="text-[10px] bg-[#FAF8F5] text-muted-foreground border-line">
                {termLabel}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Grade submissions, active term enrollment & graduating cohort metrics
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Explain with AI"
          onClick={handleExplain}
          className="h-8 gap-1.5 rounded-lg border-[#14213a]/30 bg-[#14213a]/5 text-xs font-semibold text-[#14213a] hover:bg-[#14213a]/10"
        >
          <Sparkles className="size-3.5" />
          <span>Explain</span>
        </Button>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* The 3 Core Academic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Unsubmitted Grades */}
          <div className="rounded-xl border border-line/70 bg-[#FAF8F5]/80 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-rose-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-rose-600" />
                <span className="text-xs font-bold text-[#14213a]">Unsubmitted Grades</span>
              </div>
              <Badge className="rounded-full bg-rose-100 text-rose-800 border-none text-[10px] font-bold">
                {data.unsubmittedGradesCount} Pending
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-700 tracking-tight">
                {data.unsubmittedGradesPercent}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.unsubmittedGradesCount} of {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-white border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all"
                  style={{ width: `${Math.min(100, data.unsubmittedGradesPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{data.submittedGradesPercent}% Submitted ({data.submittedGradesCount})</span>
              </div>
            </div>
          </div>

          {/* 2. Not Enrolled Yet */}
          <div className="rounded-xl border border-line/70 bg-[#FAF8F5]/80 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="size-4 text-amber-600" />
                <span className="text-xs font-bold text-[#14213a]">Not Enrolled Yet</span>
              </div>
              <Badge className="rounded-full bg-amber-100 text-amber-800 border-none text-[10px] font-bold">
                {data.notEnrolledCount} Missing COR
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-700 tracking-tight">
                {data.notEnrolledPercent}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.notEnrolledCount} of {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-white border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, data.notEnrolledPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{data.enrolledPercent}% Enrolled ({data.enrolledCount})</span>
              </div>
            </div>
          </div>

          {/* 3. Graduating Scholars */}
          <div className="rounded-xl border border-line/70 bg-[#FAF8F5]/80 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-[#0a4f42]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-[#0a4f42]" />
                <span className="text-xs font-bold text-[#14213a]">Graduating Scholars</span>
              </div>
              <Badge className="rounded-full bg-[#ddeee3] text-[#0a4f42] border-none text-[10px] font-bold">
                Senior Cohort
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0a4f42] tracking-tight">
                {data.graduatingPercent}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.graduatingCount} of {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-white border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0a4f42] transition-all"
                  style={{ width: `${Math.min(100, data.graduatingPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{data.undergradPercent}% Undergraduates ({data.undergradCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Suggested Metrics: Academic Standing & Year-Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Suggested Metric 1: Academic Retention & Standing */}
          <div className="rounded-xl border border-line/70 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-[#0a4f42]" />
                <span className="text-xs font-bold text-[#14213a]">Academic Standing & Retention</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Retention mark: {globalThreshold}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              {/* Good Standing */}
              <div className="p-2.5 rounded-lg border border-line/60 bg-[#FAF8F5]/60 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0a4f42]">
                  <CheckCircle2 className="size-3.5" />
                  <span>Good Standing</span>
                </div>
                <p className="text-lg font-black text-[#0a4f42]">
                  {data.standingBreakdown.goodStandingCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {data.standingBreakdown.goodStandingPercent}% meeting criteria
                </p>
              </div>

              {/* On Probation */}
              <div className="p-2.5 rounded-lg border border-line/60 bg-[#FAF8F5]/60 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-700">
                  <AlertTriangle className="size-3.5" />
                  <span>On Watch</span>
                </div>
                <p className="text-lg font-black text-amber-700">
                  {data.standingBreakdown.probationCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {data.standingBreakdown.probationPercent}% on probation
                </p>
              </div>

              {/* At Risk */}
              <div className="p-2.5 rounded-lg border border-line/60 bg-[#FAF8F5]/60 space-y-1">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-700">
                  <AlertTriangle className="size-3.5" />
                  <span>At Risk</span>
                </div>
                <p className="text-lg font-black text-rose-700">
                  {data.standingBreakdown.flaggedCount}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {data.standingBreakdown.flaggedPercent}% needing intervention
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Metric 2: Academic Year-Level Distribution */}
          <div className="rounded-xl border border-line/70 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-[#14213a]" />
                <span className="text-xs font-bold text-[#14213a]">Year-Level Distribution</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Total: {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {data.yearLevelBreakdown.map((item) => (
                <div
                  key={item.yearLevel}
                  className={`p-2 rounded-lg border space-y-0.5 ${
                    item.yearLevel === 4
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-line/60 bg-[#FAF8F5]/60"
                  }`}
                >
                  <p className="text-[10px] font-bold text-[#14213a] truncate">{item.label}</p>
                  <p
                    className={`text-base font-black ${
                      item.yearLevel === 4 ? "text-[#0a4f42]" : "text-[#14213a]"
                    }`}
                  >
                    {item.count}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{item.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descriptive Analytics Narrative (Capstone Feature) */}
        {narrative && (
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#14213a]">
              <Sparkles className="size-3.5 text-blue-700" />
              <span>Descriptive Summary</span>
            </div>
            <p className="leading-relaxed text-slate-700">{narrative}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

