"use client";

import { useEffect, useState } from "react";
import { TRACKS } from "@/app/(Authentication)/components/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type ApplicationFormValues, YEAR_LEVEL_OPTIONS } from "@/lib/validation";
import { parseApplicationForm } from "./wizard-helpers";

interface ApplicationStepProps {
  prefill: Record<string, string>;
  hasApplication: boolean;
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

export function ApplicationStep({ prefill, hasApplication, onSubmit }: ApplicationStepProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...EMPTY_VALUES, ...prefill });
  const [pristine, setPristine] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <CardTitle className="text-lg! font-bold text-navy">Scholarship application</CardTitle>
        <CardDescription className="text-sm!">
          Tell us about yourself and where you study. You can update this later.
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
            <Field id="app-course" label="Course of study" required error={fieldErrors.course_of_study}>
              <Input
                id="app-course"
                placeholder="BS Information Technology"
                value={values.course_of_study}
                onChange={(e) => set("course_of_study", e.target.value)}
                className={FIELD_INPUT}
              />
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
            <Input
              id="app-school-name"
              placeholder="University of Mindanao"
              value={values.school_name}
              onChange={(e) => set("school_name", e.target.value)}
              className={FIELD_INPUT}
            />
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
            <Button type="submit" className="h-11 px-6 text-sm! shadow-xs" disabled={submitting}>
              {submitting ? "Submitting..." : hasApplication ? "Save changes" : "Submit application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
