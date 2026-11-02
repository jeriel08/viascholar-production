"use client";

import { BookOpen, Building2, KeyRound, ScrollText, SlidersHorizontal, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminQuickActionsProps {
  onOpenAddEmployee: () => void;
}

export function AdminQuickActions({ onOpenAddEmployee }: AdminQuickActionsProps) {
  return (
    <Card className="rounded-[16px]! border-line bg-white shadow-va-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-line">
          <div>
            <h3 className="text-sm sm:text-[15px] font-bold text-foreground">Administrative Operations Hub</h3>
            <p className="text-xs text-muted-foreground">
              Quick shortcuts for account provisioning, security management, and platform configuration.
            </p>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Quick Action 1: Create Employee */}
          <Button
            type="button"
            onClick={onOpenAddEmployee}
            className="h-auto py-2.5 px-3.5 bg-[#0a4f42] hover:bg-[#083c32] text-white rounded-xl flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
              <UserPlus className="size-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold block truncate">Create Employee</span>
              <span className="text-[10px] text-white/80 block font-normal truncate">Staff account</span>
            </div>
          </Button>

          {/* Quick Action 2: Manage Schools */}
          <Link href="/Schools" className="block focus-visible:outline-none">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 rounded-xl border-line bg-white hover:bg-slate-50 flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42]">
                <Building2 className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">Schools</span>
                <span className="text-[10px] text-muted-foreground block font-normal truncate">
                  Institutions & campuses
                </span>
              </div>
            </Button>
          </Link>

          {/* Quick Action 3: Academic Programs */}
          <Link href="/AcademicPrograms" className="block focus-visible:outline-none">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 rounded-xl border-line bg-white hover:bg-slate-50 flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42]">
                <BookOpen className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">Programs</span>
                <span className="text-[10px] text-muted-foreground block font-normal truncate">Degree courses</span>
              </div>
            </Button>
          </Link>

          {/* Quick Action 4: Configure Grading Systems */}
          <Link href="/GradingSystems" className="block focus-visible:outline-none">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 rounded-xl border-line bg-white hover:bg-slate-50 flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42]">
                <SlidersHorizontal className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">Grading Systems</span>
                <span className="text-[10px] text-muted-foreground block font-normal truncate">Scales & rules</span>
              </div>
            </Button>
          </Link>

          {/* Quick Action 5: Reset User Passwords */}
          <Link href="/AdminEmployee" className="block focus-visible:outline-none">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 rounded-xl border-amber-200 bg-[#fceec4]/50 hover:bg-[#fceec4] flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f1b71e]/30 text-[#8a6410]">
                <KeyRound className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#8a6410] block truncate">Password Reset</span>
                <span className="text-[10px] text-[#8a6410]/80 block font-normal truncate">User security</span>
              </div>
            </Button>
          </Link>

          {/* Quick Action 6: System Audit Logs */}
          <Link href="/AuditLogs" className="block focus-visible:outline-none">
            <Button
              type="button"
              variant="outline"
              className="w-full h-auto py-2.5 px-3.5 rounded-xl border-line bg-white hover:bg-slate-50 flex items-center justify-start gap-2.5 shadow-xs cursor-pointer transition-all text-left"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42]">
                <ScrollText className="size-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground block truncate">Audit Logs</span>
                <span className="text-[10px] text-muted-foreground block font-normal truncate">Activity trail</span>
              </div>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
