"use client";

import { Building2, GraduationCap, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminDashboardMetrics } from "../hooks/useAdminDashboardData";

interface AdminKpiCardsProps {
  metrics: AdminDashboardMetrics;
}

export function AdminKpiCards({ metrics }: AdminKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Staff Accounts */}
      <Link href="/AdminEmployee" className="group block focus-visible:outline-none">
        <Card className="rounded-[16px]! border-line bg-white shadow-va-sm transition-all duration-200 hover:shadow-md hover:border-[#0a4f42]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Staff Accounts
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42] group-hover:scale-105 transition-transform">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">
                {metrics.totalStaff}
              </span>
              <span className="text-xs font-semibold text-[#0a4f42]">{metrics.activeStaff} active</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-[#eef1f5] text-slate-700 font-semibold">
                {metrics.coordinatorCount} Coor.
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-[#eef1f5] text-slate-700 font-semibold">
                {metrics.grantorCount} Grantors
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 2. Registered Students */}
      <Link href="/AdminStudents" className="group block focus-visible:outline-none">
        <Card className="rounded-[16px]! border-line bg-white shadow-va-sm transition-all duration-200 hover:shadow-md hover:border-[#0a4f42]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Student Accounts
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42] group-hover:scale-105 transition-transform">
                <GraduationCap className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">
                {metrics.totalStudents}
              </span>
              <span className="text-xs font-medium text-muted-foreground">Total on file</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-[#ddeee3] text-[#0a4f42] font-semibold">
                {metrics.activeScholarsCount} Active Scholars
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-[#eef1f5] text-slate-700 font-semibold">
                {metrics.applicantCount} Applicants
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 3. School Grading Systems */}
      <Link href="/GradingSystems" className="group block focus-visible:outline-none">
        <Card className="rounded-[16px]! border-line bg-white shadow-va-sm transition-all duration-200 hover:shadow-md hover:border-[#0a4f42]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Grading Systems
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#fceec4] text-[#8a6410] group-hover:scale-105 transition-transform">
                <Building2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">
                {metrics.totalSchools}
              </span>
              <span className="text-xs font-medium text-muted-foreground">Institutions</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0 bg-[#fceec4] text-[#8a6410] font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="size-3" />
                {metrics.verifiedSchools} Verified
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 4. Global Grade Threshold */}
      <Link href="/GlobalSettings" className="group block focus-visible:outline-none">
        <Card className="rounded-[16px]! border-line bg-white shadow-va-sm transition-all duration-200 hover:shadow-md hover:border-[#0a4f42]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Retention Threshold
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#fceec4] text-[#8a6410] group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">
                {metrics.gradeThreshold}%
              </span>
              <span className="text-xs font-semibold text-[#0a4f42]">Min. GWA</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-[#ddeee3] text-[#0a4f42] font-semibold">
                System Policy Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
