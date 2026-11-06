"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ScholarOperationalItem } from "@/lib/api/analytics";

interface ScholarStatusRosterTableProps {
  scholars: ScholarOperationalItem[];
  termLabel: string;
}

type FilterTab = "ALL" | "UNDISBURSED" | "UNSUBMITTED_GRADES" | "NOT_ENROLLED" | "GRADUATING";

export function ScholarStatusRosterTable({
  scholars,
  termLabel,
}: ScholarStatusRosterTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    return {
      all: scholars.length,
      undisbursed: scholars.filter((s) => s.disbursementStatus !== "DISBURSED").length,
      unsubmittedGrades: scholars.filter((s) => s.gradeStatus === "UNSUBMITTED").length,
      notEnrolled: scholars.filter((s) => s.enrollmentStatus === "NOT_ENROLLED").length,
      graduating: scholars.filter((s) => s.isGraduating).length,
    };
  }, [scholars]);

  const filteredScholars = useMemo(() => {
    let result = scholars;

    if (activeTab === "UNDISBURSED") {
      result = result.filter((s) => s.disbursementStatus !== "DISBURSED");
    } else if (activeTab === "UNSUBMITTED_GRADES") {
      result = result.filter((s) => s.gradeStatus === "UNSUBMITTED");
    } else if (activeTab === "NOT_ENROLLED") {
      result = result.filter((s) => s.enrollmentStatus === "NOT_ENROLLED");
    } else if (activeTab === "GRADUATING") {
      result = result.filter((s) => s.isGraduating);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.school.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q) ||
          s.track.toLowerCase().includes(q),
      );
    }

    return result;
  }, [scholars, activeTab, searchQuery]);

  const formatPhp = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Card className="rounded-2xl border-line/80 bg-white shadow-2xs hover:shadow-xs transition-all overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-line/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8.5 items-center justify-center rounded-xl bg-[#0a4f42]/10 text-[#0a4f42]">
              <Users className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-[#14213a]">Scholar Operational Roster</h2>
                <Badge variant="outline" className="text-[10px] bg-[#FAF8F5] text-muted-foreground border-line">
                  {termLabel}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Individual scholar statuses for disbursements, grades, and term enrollment
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search scholar, school, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 w-full rounded-xl border border-line bg-[#FAF8F5]/80 pl-8 pr-7 text-xs text-[#14213a] outline-none focus:border-[#0a4f42] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-[#14213a]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("ALL")}
            className={`h-7.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "ALL"
                ? "bg-[#14213a] text-white hover:bg-[#14213a]"
                : "text-muted-foreground hover:bg-[#FAF8F5] hover:text-[#14213a]"
            }`}
          >
            All Scholars ({counts.all})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("UNDISBURSED")}
            className={`h-7.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "UNDISBURSED"
                ? "bg-amber-600 text-white hover:bg-amber-600"
                : "text-muted-foreground hover:bg-[#FAF8F5] hover:text-[#14213a]"
            }`}
          >
            Undisbursed ({counts.undisbursed})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("UNSUBMITTED_GRADES")}
            className={`h-7.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "UNSUBMITTED_GRADES"
                ? "bg-rose-600 text-white hover:bg-rose-600"
                : "text-muted-foreground hover:bg-[#FAF8F5] hover:text-[#14213a]"
            }`}
          >
            Unsubmitted Grades ({counts.unsubmittedGrades})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("NOT_ENROLLED")}
            className={`h-7.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "NOT_ENROLLED"
                ? "bg-amber-700 text-white hover:bg-amber-700"
                : "text-muted-foreground hover:bg-[#FAF8F5] hover:text-[#14213a]"
            }`}
          >
            Not Enrolled ({counts.notEnrolled})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("GRADUATING")}
            className={`h-7.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              activeTab === "GRADUATING"
                ? "bg-[#0a4f42] text-white hover:bg-[#0a4f42]"
                : "text-muted-foreground hover:bg-[#FAF8F5] hover:text-[#14213a]"
            }`}
          >
            Graduating ({counts.graduating})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FAF8F5]/60 text-muted-foreground">
              <TableRow className="border-b border-line/60">
                <TableHead className="text-xs font-bold text-[#14213a] pl-5 py-3">Scholar</TableHead>
                <TableHead className="text-xs font-bold text-[#14213a] py-3">Institution & Course</TableHead>
                <TableHead className="text-xs font-bold text-[#14213a] py-3 text-center">Year Level</TableHead>
                <TableHead className="text-xs font-bold text-[#14213a] py-3 text-center">Enrollment</TableHead>
                <TableHead className="text-xs font-bold text-[#14213a] py-3 text-center">Grade Report</TableHead>
                <TableHead className="text-xs font-bold text-[#14213a] pr-5 py-3 text-right">Disbursement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-line/40">
              {filteredScholars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                    No scholars match the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredScholars.map((s) => (
                  <TableRow key={s.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    {/* Scholar info */}
                    <TableCell className="pl-5 py-3">
                      <div>
                        <p className="font-bold text-xs text-[#14213a]">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                        <span className="text-[10px] text-muted-foreground font-medium">{s.track}</span>
                      </div>
                    </TableCell>

                    {/* School & Course */}
                    <TableCell className="py-3">
                      <div>
                        <p className="text-xs font-medium text-[#14213a] line-clamp-1">{s.school}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{s.course}</p>
                      </div>
                    </TableCell>

                    {/* Year level */}
                    <TableCell className="py-3 text-center">
                      {s.isGraduating ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] gap-1">
                          <GraduationCap className="size-3" />
                          <span>4th Yr (Graduating)</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold border-line text-muted-foreground">
                          Year {s.yearLevel}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Enrollment Status */}
                    <TableCell className="py-3 text-center">
                      {s.enrollmentStatus === "ENROLLED" ? (
                        <Badge className="bg-[#ddeee3] text-[#0a4f42] border-none font-bold text-[10px] gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>Enrolled</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px] gap-1">
                          <Clock className="size-3" />
                          <span>Not Enrolled</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Grade Report Status */}
                    <TableCell className="py-3 text-center">
                      {s.gradeStatus === "SUBMITTED" ? (
                        <div className="inline-flex flex-col items-center">
                          <Badge className="bg-[#ddeee3] text-[#0a4f42] border-none font-bold text-[10px] gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Submitted</span>
                          </Badge>
                          {s.gwa > 0 && (
                            <span className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                              GWA: {s.gwa.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-800 border-none font-bold text-[10px] gap-1">
                          <AlertCircle className="size-3" />
                          <span>Unsubmitted</span>
                        </Badge>
                      )}
                    </TableCell>

                    {/* Disbursement Status */}
                    <TableCell className="pr-5 py-3 text-right">
                      {s.disbursementStatus === "DISBURSED" ? (
                        <div>
                          <Badge className="bg-[#ddeee3] text-[#0a4f42] border-none font-bold text-[10px] gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Disbursed</span>
                          </Badge>
                          <p className="text-[11px] font-bold text-[#0a4f42] mt-0.5">
                            {formatPhp(s.disbursedAmount)}
                          </p>
                        </div>
                      ) : s.disbursementStatus === "PENDING" ? (
                        <div>
                          <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[10px] gap-1">
                            <Clock className="size-3" />
                            <span>Pending</span>
                          </Badge>
                          <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                            {formatPhp(s.assessmentAmount)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Badge variant="outline" className="border-line text-muted-foreground text-[10px]">
                            Not Applied
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

