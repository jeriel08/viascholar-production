"use client";

import { BookOpen, Eye, RotateCcw } from "lucide-react";
import { TINT } from "@/components/Adminshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AcademicProgram } from "@/lib/api/settings";

interface ProgramTableProps {
  programs: AcademicProgram[];
  totalCount: number;
  loading: boolean;
  loadError: string;
  onRetry: () => void;
  onSelect: (program: AcademicProgram) => void;
}

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];
const HEAD = "text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!";

export function ProgramTable({
  programs,
  totalCount,
  loading,
  loadError,
  onRetry,
  onSelect,
}: ProgramTableProps) {
  return (
    <Card className="mt-5 rounded-[18px]! shadow-va-sm">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          {!loading && !loadError && `${totalCount} ${totalCount === 1 ? "program" : "programs"}`}
        </p>
      </CardHeader>

      <CardContent className="px-0!">
        {loading ? (
          <div className="divide-y divide-line px-6 py-2">
            {SKELETON_ROWS.map((key) => (
              <div key={key} className="flex items-center gap-4 py-4">
                <div className="w-24 shrink-0">
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
                <Skeleton className="size-8 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm text-bad">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRetry}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : programs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <BookOpen className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-navy">No academic programs found</p>
            <p className="text-xs text-muted-foreground">
              Add programs so applicants can select them during scholarship application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-line hover:bg-transparent">
                  <TableHead className={`${HEAD} pl-6! text-left! w-28`}>Code</TableHead>
                  <TableHead className={`${HEAD} text-left!`}>Program Name</TableHead>
                  <TableHead className={`${HEAD} w-36`}>Category</TableHead>
                  <TableHead className={`${HEAD} w-28`}>Status</TableHead>
                  <TableHead className={`${HEAD} pr-6! w-20`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((prog) => (
                  <TableRow
                    key={prog.program_id}
                    className="cursor-pointer border-line transition-colors hover:bg-tint/60"
                    onClick={() => onSelect(prog)}
                  >
                    <TableCell className="pl-6! font-bold text-navy">
                      <span className="inline-block rounded-md bg-[#eef2f6] px-2 py-0.5 text-xs text-navy">
                        {prog.program_code}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      <div>
                        <p className="text-[0.92rem] font-semibold">{prog.program_name}</p>
                        {prog.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {prog.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className="h-6 px-2.5 text-xs!"
                        style={{ background: TINT, color: "#55554f" }}
                      >
                        {prog.category || "College"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`h-6 px-2 text-xs! font-medium ${
                          prog.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {prog.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6! text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:bg-tint hover:text-navy"
                        aria-label={`View details for ${prog.program_name}`}
                        onClick={() => onSelect(prog)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

