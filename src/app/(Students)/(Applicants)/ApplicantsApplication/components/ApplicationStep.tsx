"use client";

import { useEffect, useMemo, useState } from "react";
import { TRACKS } from "@/app/(Authentication)/components/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AcademicProgram, listAcademicPrograms, listSchoolGradings, type SchoolGrading } from "@/lib/api/settings";
import { type ApplicationFormValues, YEAR_LEVEL_OPTIONS } from "@/lib/validation";
import { parseApplicationForm } from "./wizard-helpers";

interface ApplicationStepProps {
  prefill: Record<string, string>;
  hasApplication: boolean;
  hasConfirmedDoc?: boolean;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
}

const EMPTY_VALUES: Record<string, string> = {
  scholarship_track: "",
  student_number: "",
  student_address: "",
  course_of_study: "",
  current_year_level: "",
  school_name: "",
  school_address: "",
  phone_number: "",
  relative_employee: "",
};

const FIELD_INPUT = "h-11! bg-white! text-sm! md:text-sm!";

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="mb-2 block text-sm! font-semibold text-navy">
        {label} {required && <span className="text-amber">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function ApplicationStep({
  prefill,
  hasApplication: _hasApplication,
  hasConfirmedDoc = false,
  onSubmit,
}: ApplicationStepProps) {
  const [values, setValues] = useState<Record<string, string>>({
    ...EMPTY_VALUES,
    ...prefill,
  });
  const [pristine, setPristine] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [schools, setSchools] = useState<SchoolGrading[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isCustomProgram, setIsCustomProgram] = useState(false);
  const [isCustomSchool, setIsCustomSchool] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listAcademicPrograms(true), listSchoolGradings()])
      .then(([progs, schs]) => {
        if (!active) return;
        setPrograms(progs);
        setSchools(schs);
        setLoadingOptions(false);
      })
      .catch((err) => {
        console.error("Failed to fetch programs or schools:", err);
        if (active) setLoadingOptions(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // When programs load or prefill changes, detect if current course_of_study / school_name is custom
  useEffect(() => {
    if (loadingOptions) return;
    if (values.course_of_study) {
      const match = programs.some(
        (p) =>
          p.program_name.toLowerCase() === values.course_of_study.toLowerCase() ||
          p.program_code.toLowerCase() === values.course_of_study.toLowerCase(),
      );
      if (!match) {
        setIsCustomProgram(true);
      }
    }
    if (values.school_name) {
      const match = schools.some((s) => s.school_name.toLowerCase() === values.school_name.toLowerCase());
      if (!match) {
        setIsCustomSchool(true);
      }
    }
  }, [loadingOptions, programs, schools, values.course_of_study, values.school_name]);

  const groupedPrograms = useMemo(() => {
    const groups: Record<string, AcademicProgram[]> = {};
    for (const prog of programs) {
      const cat = prog.category?.trim() || "College Programs";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(prog);
    }
    return groups;
  }, [programs]);

  const selectedProgramValue = useMemo(() => {
    if (isCustomProgram) return "OTHER";
    if (!values.course_of_study) return "";
    const found = programs.find(
      (p) =>
        p.program_name.toLowerCase() === values.course_of_study.toLowerCase() ||
        p.program_code.toLowerCase() === values.course_of_study.toLowerCase(),
    );
    return found ? found.program_name : "OTHER";
  }, [isCustomProgram, values.course_of_study, programs]);

  const selectedSchoolValue = useMemo(() => {
    if (isCustomSchool) return "OTHER";
    if (!values.school_name) return "";
    const found = schools.find((s) => s.school_name.toLowerCase() === values.school_name.toLowerCase());
    return found ? found.school_name : "OTHER";
  }, [isCustomSchool, values.school_name, schools]);

  // Pick up profile data once it arrives, without clobbering user edits.
  useEffect(() => {
    if (pristine) setValues({ ...EMPTY_VALUES, ...prefill });
  }, [prefill, pristine]);

  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setPristine(false);
    setFieldErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data, fieldErrors: errors } = parseApplicationForm(values);
    setFieldErrors(errors);
    if (!data) return;
    setSubmitting(true);
    setServerError("");
    try {
      await onSubmit(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit application.";
      if (
        msg.toLowerCase().includes("relative employee") ||
        msg.toLowerCase().includes("relative") ||
        msg.toLowerCase().includes("1 scholar per employee")
      ) {
        setFieldErrors((prev) => ({ ...prev, relative_employee: msg }));
      }
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[18px]! border-border bg-white shadow-xs">
      <CardHeader className="px-5 pt-5 pb-3 sm:px-8 sm:pt-7 sm:pb-4">
        <CardTitle className="text-lg! font-bold text-navy">Applicant Details</CardTitle>
        <CardDescription className="text-sm!">
          Provide your scholarship track, school information, and affiliation details.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
          <Field id="app-track" label="Scholarship track" required error={fieldErrors.scholarship_track}>
            <Select value={values.scholarship_track} onValueChange={(v) => set("scholarship_track", v)}>
              <SelectTrigger
                id="app-track"
                size="lg"
                className={`${FIELD_INPUT} w-full`}
                aria-label="Scholarship track"
              >
                <SelectValue placeholder="Select your track" />
              </SelectTrigger>
              <SelectContent>
                {TRACKS.map((t) => (
                  <SelectItem key={t} value={t} className="text-sm!">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <Field id="app-student-number" label="Student number" required error={fieldErrors.student_number}>
              <Input
                id="app-student-number"
                placeholder="2023-00123"
                value={values.student_number}
                onChange={(e) => set("student_number", e.target.value)}
                className={FIELD_INPUT}
              />
            </Field>
            <Field id="app-phone" label="Phone number" error={fieldErrors.phone_number}>
              <Input
                id="app-phone"
                type="tel"
                placeholder="09171234567"
                autoComplete="tel"
                value={values.phone_number}
                onChange={(e) => set("phone_number", e.target.value)}
                className={FIELD_INPUT}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <Field id="app-course" label="Program" required error={fieldErrors.course_of_study}>
              <Select
                value={selectedProgramValue}
                onValueChange={(v) => {
                  if (v === "OTHER") {
                    setIsCustomProgram(true);
                    set("course_of_study", "");
                  } else {
                    setIsCustomProgram(false);
                    set("course_of_study", v);
                  }
                }}
                disabled={loadingOptions}
              >
                <SelectTrigger id="app-course" size="lg" className={`${FIELD_INPUT} w-full`} aria-label="Program">
                  <SelectValue placeholder={loadingOptions ? "Loading programs..." : "Select your program"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(groupedPrograms).map(([category, progs]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="font-semibold text-xs text-navy/70 uppercase tracking-wider px-2 py-1">
                        {category}
                      </SelectLabel>
                      {progs.map((p) => (
                        <SelectItem key={p.program_id} value={p.program_name} className="text-sm!">
                          {p.program_name} {p.program_code ? `(${p.program_code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  <SelectSeparator className="my-1" />
                  <SelectItem value="OTHER" className="text-sm! font-medium text-amber-700">
                    Other / Not listed (specify)
                  </SelectItem>
                </SelectContent>
              </Select>
              {(isCustomProgram || selectedProgramValue === "OTHER") && (
                <div className="mt-2">
                  <Input
                    id="app-custom-course"
                    placeholder="Type your program (e.g. BS Marine Biology)"
                    value={values.course_of_study}
                    onChange={(e) => set("course_of_study", e.target.value)}
                    className={FIELD_INPUT}
                    autoFocus
                  />
                </div>
              )}
            </Field>
            <Field id="app-year-level" label="Current year level" required error={fieldErrors.current_year_level}>
              <Select value={values.current_year_level} onValueChange={(v) => set("current_year_level", v)}>
                <SelectTrigger
                  id="app-year-level"
                  size="lg"
                  className={`${FIELD_INPUT} w-full`}
                  aria-label="Current year level"
                >
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm!">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field id="app-school-name" label="School name" required error={fieldErrors.school_name}>
            <Select
              value={selectedSchoolValue}
              onValueChange={(v) => {
                if (v === "OTHER") {
                  setIsCustomSchool(true);
                  set("school_name", "");
                } else {
                  setIsCustomSchool(false);
                  set("school_name", v);
                }
              }}
              disabled={loadingOptions}
            >
              <SelectTrigger
                id="app-school-name"
                size="lg"
                className={`${FIELD_INPUT} w-full`}
                aria-label="School name"
              >
                <SelectValue placeholder={loadingOptions ? "Loading schools..." : "Select your school"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectGroup>
                  <SelectLabel className="font-semibold text-xs text-navy/70 uppercase tracking-wider px-2 py-1">
                    Accredited / Registered Schools
                  </SelectLabel>
                  {schools.map((s) => (
                    <SelectItem key={s.school_id} value={s.school_name} className="text-sm!">
                      {s.school_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator className="my-1" />
                <SelectItem value="OTHER" className="text-sm! font-medium text-amber-700">
                  Other / Not listed (specify)
                </SelectItem>
              </SelectContent>
            </Select>
            {(isCustomSchool || selectedSchoolValue === "OTHER") && (
              <div className="mt-2">
                <Input
                  id="app-custom-school"
                  placeholder="Type your school name (e.g. St. Mary's College)"
                  value={values.school_name}
                  onChange={(e) => set("school_name", e.target.value)}
                  className={FIELD_INPUT}
                  autoFocus
                />
              </div>
            )}
          </Field>
          <Field id="app-student-address" label="Home address" required error={fieldErrors.student_address}>
            <Input
              id="app-student-address"
              placeholder="Street, barangay, city"
              value={values.student_address}
              onChange={(e) => set("student_address", e.target.value)}
              className={FIELD_INPUT}
            />
          </Field>
          <Field id="app-school-address" label="School address" required error={fieldErrors.school_address}>
            <Input
              id="app-school-address"
              placeholder="Street, barangay, city"
              value={values.school_address}
              onChange={(e) => set("school_address", e.target.value)}
              className={FIELD_INPUT}
            />
          </Field>
          <Field
            id="app-relative"
            label="Relative employed by partner"
            required
            hint="Company policy allows only 1 scholar per employee."
            error={fieldErrors.relative_employee}
          >
            <Input
              id="app-relative"
              placeholder="Full name of relative employee"
              value={values.relative_employee}
              onChange={(e) => set("relative_employee", e.target.value)}
              className={FIELD_INPUT}
            />
          </Field>

          {serverError && (
            <div className="rounded-[10px] border border-destructive/30 bg-bad-bg px-3.5 py-3 text-sm leading-relaxed text-destructive">
              {serverError}
            </div>
          )}

          <div className="flex justify-end pt-4 sm:pt-5 border-t border-border/60 mt-1">
            <Button type="submit" className="h-11 px-6 text-sm! font-semibold shadow-xs" disabled={submitting}>
              {submitting
                ? hasConfirmedDoc
                  ? "Saving changes..."
                  : "Saving details..."
                : hasConfirmedDoc
                  ? "Save changes"
                  : "Next: Upload Documents"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
