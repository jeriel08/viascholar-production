"use client";

import { BookOpen, ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
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
  pageSize?: number;
  searchQuery?: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];
const HEAD = "text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!";

type PageItem = number | "ellipsis-start" | "ellipsis-end";

function getPageNumbers(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", total];
  }
  if (current >= total - 3) {
    return [1, "ellipsis-start", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", total];
}

export function ProgramTable({
  programs,
  totalCount,
  loading,
  loadError,
  onRetry,
  onSelect,
  pageSize = DEFAULT_PAGE_SIZE,
  searchQuery,
  currentPage: currentPageProp,
  onPageChange: onPageChangeProp,
}: ProgramTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled = currentPageProp !== undefined;

  const totalPages = Math.max(1, Math.ceil(programs.length / pageSize));
  const activePage = isControlled ? currentPageProp : internalPage;
  const safeCurrentPage = Math.min(Math.max(1, activePage), totalPages);

  // Reset to first page when search filter changes
  useEffect(() => {
    if (!isControlled && searchQuery !== undefined) {
      setInternalPage(1);
    }
  }, [searchQuery, isControlled]);

  // Keep page within bounds if items are removed
  useEffect(() => {
    if (!isControlled && internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [internalPage, totalPages, isControlled]);

  const handlePageChange = (newPage: number) => {
    if (onPageChangeProp) {
      onPageChangeProp(newPage);
    }
    if (!isControlled) {
      setInternalPage(newPage);
    }
  };

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedPrograms = programs.slice(startIndex, startIndex + pageSize);

  return (
    <Card className="mt-5 rounded-[18px]! shadow-va-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <p className="text-sm text-muted-foreground">
          {!loading &&
            !loadError &&
            (programs.length !== totalCount
              ? `${programs.length} of ${totalCount} programs`
              : `${totalCount} ${totalCount === 1 ? "program" : "programs"}`)}
        </p>
        {!loading && !loadError && totalPages > 1 && (
          <span className="text-xs text-muted-foreground font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
        )}
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
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onRetry}>
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
                {paginatedPrograms.map((prog) => (
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
                          <p className="text-xs text-muted-foreground line-clamp-1">{prog.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="h-6 px-2.5 text-xs!" style={{ background: TINT, color: "#55554f" }}>
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

            {programs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-line px-6 py-3.5 gap-3 text-xs text-muted-foreground">
                <span>
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, programs.length)} of {programs.length}{" "}
                  {programs.length === 1 ? "program" : "programs"}
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="size-8 rounded-lg"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    {getPageNumbers(safeCurrentPage, totalPages).map((p) =>
                      typeof p === "string" ? (
                        <span key={p} className="px-1 text-xs text-muted-foreground">
                          …
                        </span>
                      ) : (
                        <Button
                          key={`page-${p}`}
                          type="button"
                          variant={p === safeCurrentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(p)}
                          className={`size-8 p-0 text-xs font-semibold ${
                            p === safeCurrentPage ? "bg-[#0a4f42] text-white hover:bg-[#083c32]" : "text-foreground"
                          }`}
                          aria-label={`Go to page ${p}`}
                          aria-current={p === safeCurrentPage ? "page" : undefined}
                        >
                          {p}
                        </Button>
                      ),
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      className="size-8 rounded-lg"
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
