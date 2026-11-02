"use client";

import { Building2, ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { School } from "@/lib/api/settings";

interface SchoolTableProps {
  schools: School[];
  totalCount: number;
  loading: boolean;
  loadError: string;
  onRetry: () => void;
  onSelect: (school: School) => void;
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

export function SchoolTable({
  schools,
  totalCount,
  loading,
  loadError,
  onRetry,
  onSelect,
  pageSize = DEFAULT_PAGE_SIZE,
  searchQuery,
  currentPage: controlledPage,
  onPageChange: controlledOnPageChange,
}: SchoolTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const isControlled = controlledPage !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;

  // Reset to first page whenever search query changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: searchQuery is the trigger on purpose
  useEffect(() => {
    if (isControlled) {
      controlledOnPageChange?.(1);
    } else {
      setInternalPage(1);
    }
  }, [searchQuery, isControlled, controlledOnPageChange]);

  const totalPages = Math.max(1, Math.ceil(schools.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // If filtered list shrinks below current page, adjust page
  useEffect(() => {
    if (currentPage > totalPages) {
      if (isControlled) {
        controlledOnPageChange?.(totalPages);
      } else {
        setInternalPage(totalPages);
      }
    }
  }, [currentPage, totalPages, isControlled, controlledOnPageChange]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedSchools = useMemo(() => {
    return schools.slice(startIndex, startIndex + pageSize);
  }, [schools, startIndex, pageSize]);

  const handlePageChange = (p: number) => {
    if (isControlled) {
      controlledOnPageChange?.(p);
    } else {
      setInternalPage(p);
    }
  };

  return (
    <Card className="mt-5 rounded-[18px]! shadow-va-sm">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          {!loading && !loadError && `${totalCount} ${totalCount === 1 ? "school" : "schools"}`}
        </p>
      </CardHeader>

      <CardContent className="px-0!">
        {loading ? (
          <div className="divide-y divide-line px-6 py-2">
            {SKELETON_ROWS.map((key) => (
              <div key={key} className="flex items-center gap-4 py-4">
                <div className="w-20 shrink-0">
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-28 shrink-0 rounded-full" />
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
        ) : schools.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Building2 className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-navy">No schools found</p>
            <p className="text-xs text-muted-foreground">
              Add accredited schools so applicants can select them during scholarship application.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-line hover:bg-transparent">
                  <TableHead className={`${HEAD} pl-6! text-left! w-24`}>Code</TableHead>
                  <TableHead className={`${HEAD} text-left!`}>School Name & Address</TableHead>
                  <TableHead className={`${HEAD} text-left! w-56`}>Grading Scale</TableHead>
                  <TableHead className={`${HEAD} w-28`}>Status</TableHead>
                  <TableHead className={`${HEAD} pr-6! w-20`}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSchools.map((s) => (
                  <TableRow
                    key={s.school_id}
                    className="cursor-pointer border-line transition-colors hover:bg-tint/60"
                    onClick={() => onSelect(s)}
                  >
                    <TableCell className="pl-6! font-bold text-navy">
                      <span className="inline-block rounded-md bg-[#eef2f6] px-2 py-0.5 text-xs text-navy font-semibold">
                        {s.school_code || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-left!">
                      <div className="flex flex-col">
                        <span className="font-semibold text-navy text-sm">{s.school_name}</span>
                        {s.address && <span className="text-xs text-muted-foreground line-clamp-1">{s.address}</span>}
                        {(s.contact_email || s.contact_number) && (
                          <span className="text-[11px] text-muted-foreground/80 mt-0.5">
                            {[s.contact_email, s.contact_number].filter(Boolean).join(" • ")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left!">
                      {s.grading_system ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-navy">
                            {s.grading_system.grading_scale.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Pass: {s.grading_system.passing_grade} • High: {s.grading_system.highest_grade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not connected</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center!">
                      <Badge
                        variant="outline"
                        className={
                          s.is_active
                            ? "border-good/30 bg-good-bg text-good text-xs font-semibold"
                            : "border-muted-foreground/30 bg-muted/20 text-muted-foreground text-xs"
                        }
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6! text-center!">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:text-navy hover:bg-white"
                        aria-label={`View ${s.school_name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(s);
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {schools.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-line px-6 py-3.5 gap-3 text-xs text-muted-foreground">
                <span>
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, schools.length)} of {schools.length}{" "}
                  {schools.length === 1 ? "school" : "schools"}
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
