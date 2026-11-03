"use client";

import { CheckCircle2, Clock, FileCheck2, RefreshCw, Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CurrentEnrollmentState } from "@/lib/api/enrollment";

interface ScholarTermContextCardProps {
  enrollmentState: CurrentEnrollmentState;
  loading: boolean;
  onRefresh: () => void;
}

export function ScholarTermContextCard({ enrollmentState, loading, onRefresh }: ScholarTermContextCardProps) {
  const status = enrollmentState?.enrollment?.status || "NOT_SUBMITTED";
  const completedPrev = enrollmentState?.completed_previous_enrollment;

  const renderStatusBadge = () => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold gap-1">
            <FileCheck2 className="size-3.5 text-emerald-600" />
            Approved & Endorsed
          </Badge>
        );
      case "PENDING_REVIEW":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-semibold gap-1">
            <Clock className="size-3.5 text-amber-600" />
            Pending Coordinator Review
          </Badge>
        );
      case "CHANGES_REQUESTED":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-900 border-rose-300 font-semibold gap-1">
            <CheckCircle2 className="size-3.5 text-rose-600" />
            Changes Requested
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300 font-semibold gap-1">
            <Sparkles className="size-3.5 text-blue-600" />
            Draft Saved
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-muted-foreground">
            {completedPrev ? "Ready for Next Term" : "Not Submitted"}
          </Badge>
        );
    }
  };

  const enrollment = enrollmentState?.enrollment;

  return (
    <Card className="shadow-xs border-border/80">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-emerald-700" />
              {enrollmentState.scholar.first_name} {enrollmentState.scholar.last_name}
            </h2>
            {renderStatusBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {enrollmentState.scholar.school_name || "Enrolled University"} •{" "}
            {enrollmentState.scholar.course_of_study || "Degree Program"}
          </p>
          {completedPrev && !enrollment && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Previous Term (AY {completedPrev.academic_year} {completedPrev.semester}) Completed
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
