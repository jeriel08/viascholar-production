"use client";

import { CheckCircle2, Clock, DollarSign, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FinancialAspectData } from "@/lib/api/analytics";

interface FinancialAnalyticsCardProps {
  data: FinancialAspectData;
  narrative?: string;
  termLabel: string;
  onExplain: (chartType: string, title: string, metrics: Record<string, unknown>) => void;
}

export function FinancialAnalyticsCard({
  data,
  narrative,
  termLabel,
  onExplain,
}: FinancialAnalyticsCardProps) {
  const formatPhp = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExplain = () => {
    onExplain("FINANCIAL_DISBURSEMENT_SUMMARY", "Semester Financial & Disbursement Overview", {
      disbursedPercent: data.disbursedPercent,
      undisbursedPercent: data.undisbursedPercent,
      disbursedCount: data.disbursedCount,
      undisbursedCount: data.undisbursedCount,
      totalSemesterAssessment: data.totalSemesterAssessment,
      totalDisbursedAmount: data.totalDisbursedAmount,
      totalPendingAmount: data.totalPendingAmount,
      totalScholarsCount: data.totalScholarsCount,
      termLabel,
    });
  };

  return (
    <Card className="rounded-2xl border-line/80 bg-white shadow-2xs hover:shadow-xs transition-all overflow-hidden">
      {/* Header with Title, Term Badge & Explain Button */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-5 pb-3 border-b border-line/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8.5 items-center justify-center rounded-xl bg-[#0a4f42]/10 text-[#0a4f42]">
            <DollarSign className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-[#14213a]">Financial Aspect: Semester Disbursements</h2>
              <Badge variant="outline" className="text-[10px] bg-[#FAF8F5] text-muted-foreground border-line">
                {termLabel}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Disbursement progress & semester imbursement summary
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Explain with AI"
          onClick={handleExplain}
          className="h-8 gap-1.5 rounded-lg border-[#0a4f42]/30 bg-[#0a4f42]/5 text-xs font-semibold text-[#0a4f42] hover:bg-[#0a4f42]/10"
        >
          <Sparkles className="size-3.5" />
          <span>Explain</span>
        </Button>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Core Percentage Breakdown: Disbursed vs Undisbursed Scholars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Given Disbursement */}
          <div className="rounded-xl border border-line/70 bg-[#FAF8F5]/80 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-[#0a4f42]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#0a4f42]" />
                <span className="text-xs font-bold text-[#14213a]">Disbursed Scholars</span>
              </div>
              <Badge className="rounded-full bg-[#ddeee3] text-[#0a4f42] border-none text-[10px] font-bold">
                Completed
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0a4f42] tracking-tight">
                {data.disbursedPercent}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.disbursedCount} of {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-white border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0a4f42] transition-all"
                  style={{ width: `${Math.min(100, data.disbursedPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Scholars who have officially received their scholarship check / funds
              </p>
            </div>
          </div>

          {/* 2. Not Given Disbursement */}
          <div className="rounded-xl border border-line/70 bg-[#FAF8F5]/80 p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-amber-600" />
                <span className="text-xs font-bold text-[#14213a]">Undisbursed Scholars</span>
              </div>
              <Badge className="rounded-full bg-amber-100 text-amber-800 border-none text-[10px] font-bold">
                Pending / Late
              </Badge>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-700 tracking-tight">
                {data.undisbursedPercent}%
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {data.undisbursedCount} of {data.totalScholarsCount} Scholars
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-white border border-line/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, data.undisbursedPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Pending authorization or waiting for late Statement of Account (SOA) submissions
              </p>
            </div>
          </div>
        </div>

        {/* Semester Imbursement Summary (Total to Imburse, Disbursed, Pending) */}
        <div className="rounded-xl border border-line/80 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Semester Imbursement Summary
            </span>
            <span className="text-[11px] text-muted-foreground">CRDC Grant Allocation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Imbursement */}
            <div className="p-3 rounded-lg border border-line/60 bg-[#FAF8F5]/50 space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                Total to Imburse
              </span>
              <p className="text-lg font-black text-[#14213a] tabular-nums">
                {formatPhp(data.totalSemesterAssessment)}
              </p>
              <p className="text-[10px] text-muted-foreground">Approved tuition & school fees</p>
            </div>

            {/* Total Disbursed */}
            <div className="p-3 rounded-lg border border-line/60 bg-[#FAF8F5]/50 space-y-1">
              <span className="text-[10px] font-semibold text-[#0a4f42] uppercase">
                Disbursed to Date
              </span>
              <p className="text-lg font-black text-[#0a4f42] tabular-nums">
                {formatPhp(data.totalDisbursedAmount)}
              </p>
              <p className="text-[10px] text-muted-foreground">Released to institutions/scholars</p>
            </div>

            {/* Remaining Pending */}
            <div className="p-3 rounded-lg border border-line/60 bg-[#FAF8F5]/50 space-y-1">
              <span className="text-[10px] font-semibold text-amber-700 uppercase">
                Pending Imbursement
              </span>
              <p className="text-lg font-black text-amber-700 tabular-nums">
                {formatPhp(data.totalPendingAmount)}
              </p>
              <p className="text-[10px] text-muted-foreground">Awaiting release or late SOA review</p>
            </div>
          </div>
        </div>

        {/* Descriptive Analytics Narrative (Capstone Feature) */}
        {narrative && (
          <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 text-xs text-teal-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#0a4f42]">
              <Sparkles className="size-3.5" />
              <span>Descriptive Summary</span>
            </div>
            <p className="leading-relaxed text-slate-700">{narrative}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

