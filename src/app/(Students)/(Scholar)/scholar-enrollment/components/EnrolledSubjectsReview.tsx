"use client";

import { AlertTriangle, BookOpen, CheckCircle2, HelpCircle, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EnrolledSubjectItem } from "@/lib/api/enrollment";

interface EnrolledSubjectsReviewProps {
  subjects: EnrolledSubjectItem[];
  onChangeSubjects?: (subjects: EnrolledSubjectItem[]) => void;
  isReadOnly?: boolean;
  academicYear?: string;
  semester?: string;
  yearLevel?: number | string;
}

export function EnrolledSubjectsReview({
  subjects,
  onChangeSubjects,
  isReadOnly,
  academicYear,
  semester,
  yearLevel,
}: EnrolledSubjectsReviewProps) {
  const totalUnits = subjects.reduce((sum, s) => sum + (Number(s.units) || 0), 0);

  const formattedYearLevel = yearLevel
    ? String(yearLevel).toLowerCase().includes("year")
      ? String(yearLevel)
      : `Year ${yearLevel}`
    : null;

  const hasTermInfo = Boolean(academicYear || formattedYearLevel || semester);

  const handleUpdate = (index: number, field: keyof EnrolledSubjectItem, value: unknown) => {
    if (!onChangeSubjects || isReadOnly) return;
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    onChangeSubjects(updated);
  };

  const handleRemove = (index: number) => {
    if (!onChangeSubjects || isReadOnly) return;
    onChangeSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleAddSubject = () => {
    if (!onChangeSubjects || isReadOnly) return;
    onChangeSubjects([
      ...subjects,
      {
        subject_code: "",
        descriptive_title: "",
        units: 3.0,
        section: "",
        schedule: "",
        room: "",
        status: "ON_TRACK",
      },
    ]);
  };

  const renderStatusBadge = (sub: EnrolledSubjectItem) => {
    if (sub.status === "MISSING_PREREQUISITE") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-[11px] font-medium gap-1">
          <AlertTriangle className="size-3 text-amber-600" />
          Prereq Unmet
        </Badge>
      );
    }
    if (sub.status === "OFF_TRACK") {
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-900 border-rose-200 text-[11px] font-medium gap-1">
          <HelpCircle className="size-3 text-rose-600" />
          Off-Track Elective
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-900 border-emerald-300 text-[11px] font-medium gap-1"
      >
        <CheckCircle2 className="size-3 text-emerald-600" />
        Curriculum Matched
      </Badge>
    );
  };

  return (
    <Card className="shadow-xs border-border/80 gap-1.5 py-4">
      <CardHeader className="p-4 sm:p-5 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <BookOpen className="size-4 text-emerald-700" />
              Enrolled Subjects Review ({subjects.length})
            </CardTitle>
            {hasTermInfo && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-1">
                {academicYear && (
                  <span>
                    Academic Year: <span className="font-semibold text-foreground">{academicYear}</span>
                  </span>
                )}
                {academicYear && formattedYearLevel && <span className="text-muted-foreground/50">•</span>}
                {formattedYearLevel && (
                  <span>
                    Year Level: <span className="font-semibold text-foreground">{formattedYearLevel}</span>
                  </span>
                )}
                {(academicYear || formattedYearLevel) && semester && (
                  <span className="text-muted-foreground/50">•</span>
                )}
                {semester && (
                  <span>
                    Semester: <span className="font-semibold text-foreground">{semester}</span>
                  </span>
                )}
              </div>
            )}
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Verified course schedule and credit units against frozen curriculum baseline
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">
              Total Units: <span className="text-emerald-700 font-bold ml-1">{totalUnits.toFixed(1)}</span>
            </Badge>
            {!isReadOnly && onChangeSubjects && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSubject}
                className="h-8 gap-1 text-xs font-semibold text-emerald-800 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70"
              >
                <Plus className="size-3.5" />
                Add Course
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        {subjects.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground">
              No subjects extracted yet. Upload your Certificate of Registration (COR) or Matriculation above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-28 font-bold">Subject Code</TableHead>
                  <TableHead className="font-bold min-w-48">Descriptive Title</TableHead>
                  <TableHead className="font-bold">Sec / Sched / Room</TableHead>
                  <TableHead className="font-bold text-center w-20">Units</TableHead>
                  <TableHead className="font-bold">Audit Check</TableHead>
                  {!isReadOnly && <TableHead className="text-center w-12">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub, idx) => {
                  const rowKey = sub.curriculum_subject_id
                    ? `curric-${sub.curriculum_subject_id}`
                    : sub.subject_code
                      ? `code-${sub.subject_code}-${sub.section || ""}`
                      : `row-item-${idx}`;

                  return (
                    <TableRow key={rowKey} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-foreground whitespace-nowrap py-2.5">
                        {isReadOnly ? (
                          sub.subject_code
                        ) : (
                          <Input
                            type="text"
                            value={sub.subject_code}
                            onChange={(e) => handleUpdate(idx, "subject_code", e.target.value.toUpperCase())}
                            className="h-8 w-24 font-bold text-xs"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-foreground font-medium py-2.5">
                        {isReadOnly ? (
                          sub.descriptive_title
                        ) : (
                          <Input
                            type="text"
                            value={sub.descriptive_title}
                            onChange={(e) => handleUpdate(idx, "descriptive_title", e.target.value)}
                            className="h-8 w-full text-xs font-medium"
                          />
                        )}
                        {sub.remarks && <p className="text-[10px] text-amber-700 font-medium mt-0.5">{sub.remarks}</p>}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-[11px] py-2.5">
                        {[sub.section, sub.schedule, sub.room].filter(Boolean).join(" • ") || "—"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground whitespace-nowrap py-2.5">
                        {isReadOnly ? (
                          Number(sub.units).toFixed(1)
                        ) : (
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max="12"
                            value={sub.units}
                            onChange={(e) => handleUpdate(idx, "units", Number(e.target.value))}
                            className="h-8 w-16 text-center font-bold text-xs mx-auto"
                          />
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5">{renderStatusBadge(sub)}</TableCell>
                      {!isReadOnly && (
                        <TableCell className="text-center py-2.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(idx)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete course"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
