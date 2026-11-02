"use client";

import { ArrowRight, Building2, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SchoolGrading } from "@/lib/api/settings";

interface AdminGradingOverviewCardProps {
  schools: SchoolGrading[];
}

export function AdminGradingOverviewCard({ schools }: AdminGradingOverviewCardProps) {
  const displayedSchools = schools.slice(0, 5);

  return (
    <Card className="rounded-[16px]! border-line bg-white shadow-va-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-line gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex size-7 items-center justify-center rounded-lg bg-[#fceec4] text-[#8a6410] shrink-0">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-[15px] font-bold text-foreground truncate">School Grading Systems</h3>
              <p className="text-xs text-muted-foreground truncate sm:whitespace-normal">
                Configured institution grading scales and validation rules.
              </p>
            </div>
          </div>
          <Link href="/GradingSystems" className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#0a4f42] hover:bg-[#0a4f42]/10 gap-1.5 h-8 font-semibold"
            >
              <span>Manage Scales</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        <div className="mt-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-100 sm:min-w-0 divide-y divide-line">
            {displayedSchools.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No school grading scales configured yet.
              </div>
            ) : (
              displayedSchools.map((school) => (
                <div
                  key={school.school_id}
                  className="py-2.5 flex items-center justify-between gap-3 -mx-2 px-2 rounded-lg hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground truncate">{school.school_name}</p>
                      {/* Equal Size Verification Badge */}
                      {school.is_verified ? (
                        <Badge
                          variant="secondary"
                          className="w-22 text-center justify-center text-[9px] px-1 py-0 bg-[#ddeee3] text-[#0a4f42] border-[#0a4f42]/20 shrink-0 font-bold"
                        >
                          <CheckCircle2 className="size-2.5 mr-0.5" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="w-22 text-center justify-center text-[9px] px-1 py-0 bg-[#fceec4] text-[#8a6410] border-[#f1b71e]/30 shrink-0 font-bold"
                        >
                          <ShieldAlert className="size-2.5 mr-0.5" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>
                        Range: {Number(school.failing_grade || 0)} - {Number(school.highest_grade || 0)}
                      </span>
                      <span>•</span>
                      <span>Passing: {Number(school.passing_grade || 0)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {/* Equal Size Grading Scale Badge */}
                    <span className="w-24 text-center justify-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#eef1f5] text-slate-700 block truncate">
                      {school.grading_scale || "NUMERIC"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
