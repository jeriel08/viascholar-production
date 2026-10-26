"use client";

import { Eye, FileSignature, RotateCcw, ScrollText, Users } from "lucide-react";
import type { Applicant } from "@/components/Coordinatorshared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicantsPagination } from "./ApplicantsPagination";
import { formatGwa, getStageVariant, gwaSourceTitle } from "./applicant-helpers";

interface ApplicantsTableProps {
  applicants: Applicant[];
  totalFiltered: number;
  loading: boolean;
  loadError: string;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (applicant: Applicant) => void;
}

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

export function ApplicantsTable({
  applicants,
  totalFiltered,
  loading,
  loadError,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  currentPage,
  totalPages,
  onPageChange,
  onSelect,
}: ApplicantsTableProps) {
  return (
    <Card className="mt-5 rounded-[18px]! shadow-va-sm">
      <CardHeader>
        <p className="text-sm text-muted-foreground">
          {!loading &&
            !loadError &&
            (hasActiveFilters ? `${totalFiltered} matches` : `${totalFiltered} total applicants`)}
        </p>
      </CardHeader>
      <CardContent className="px-0!">
        {loading ? (
          <div className="divide-y divide-line px-6 py-2">
            {SKELETON_ROWS.map((key) => (
              <div key={key} className="flex items-center gap-4 py-4">
                <Skeleton className="h-3.5 w-32 shrink-0" />
                <Skeleton className="h-3.5 w-24 shrink-0" />
                <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
                <Skeleton className="hidden h-3.5 flex-1 md:block" />
                <Skeleton className="ml-auto size-9 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <ScrollText className="size-10 text-muted-foreground" />
            <div>
              <p className="text-base font-semibold">Could not load applicants</p>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            </div>
            <Button type="button" className="h-11 px-5 text-sm!" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
          </div>
        ) : (
          <>
            <Table className="text-sm!">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!">
                    Applicant
                  </TableHead>
                  <TableHead className="text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!">
                    Track
                  </TableHead>
                  <TableHead className="text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!">
                    GWA
                  </TableHead>
                  <TableHead className="hidden text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]! md:table-cell">
                    Applied
                  </TableHead>
                  <TableHead className="text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!">
                    Stage
                  </TableHead>
                  <TableHead className="pr-6 text-center! text-xs font-bold! uppercase tracking-wider text-[#8a8a84]!">
                    View
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => onSelect(a)}>
                    <TableCell className="py-3 pl-6 text-center!">
                      <p className="text-sm font-semibold">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.course} · {a.year}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-center! text-sm">{a.track}</TableCell>
                    <TableCell className="py-3 text-center! text-sm tabular-nums" title={gwaSourceTitle(a.gwaSource)}>
                      {a.gwa !== null ? formatGwa(a.gwa) : "—"}
                    </TableCell>
                    <TableCell className="hidden py-3 text-center! text-sm whitespace-nowrap md:table-cell">
                      {a.applied}
                    </TableCell>
                    <TableCell className="py-3 text-center!">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Badge variant={getStageVariant(a.stage)} className="h-6 px-2.5 text-xs!">
                          {a.stage}
                        </Badge>
                        {a.stage === "Accepted" && a.hasContract && a.contractStatus === "PENDING" && (
                          <Badge
                            variant="outline"
                            className="inline-flex items-center gap-1 h-5 px-1.5 text-[0.65rem]! font-medium border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300"
                          >
                            <FileSignature className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>Signing Contract</span>
                          </Badge>
                        )}
                        {a.stage === "Accepted" && !a.hasContract && (
                          <span className="text-[0.65rem] text-muted-foreground whitespace-nowrap">
                            Contract pending
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-6 text-center!">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${a.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(a);
                        }}
                      >
                        <Eye className="size-4.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applicants.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <Users className="size-10 text-muted-foreground" />
                <div>
                  <p className="text-base font-semibold">No applicants match your filters</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search term or clear the filters.
                  </p>
                </div>
                {hasActiveFilters && (
                  <Button type="button" variant="outline" className="h-10 text-sm!" onClick={onClearFilters}>
                    <RotateCcw className="size-4" />
                    Clear filters
                  </Button>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <ApplicantsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
