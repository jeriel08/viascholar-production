"use client";

import { useEffect, useMemo, useState } from "react";
import { TRACKS } from "@/app/(Authentication)/components/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type AcademicProgram, listAcademicPrograms, listSchools, type School } from "@/lib/api/settings";
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
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isCustomProgram, setIsCustomProgram] = useState(false);
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [programQuery, setProgramQuery] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([listAcademicPrograms(true), listSchools(true)])
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
  const courseOfStudy = values.course_of_study;
  const schoolName = values.school_name;
  const schoolAddress = values.school_address;

  useEffect(() => {
    if (loadingOptions) return;
    if (courseOfStudy) {
      const match = programs.some(
        (p) =>
          p.program_name.toLowerCase() === courseOfStudy.toLowerCase() ||
          p.program_code.toLowerCase() === courseOfStudy.toLowerCase(),
      );
      if (!match) {
        setIsCustomProgram(true);
      }
    }
    if (schoolName) {
      const match = schools.find((s) => s.school_name.toLowerCase() === schoolName.toLowerCase());
      if (!match) {
        setIsCustomSchool(true);
      } else if (match.address && !schoolAddress?.trim()) {
        setValues((prev) => ({ ...prev, school_address: match.address ?? "" }));
      }
    }
  }, [loadingOptions, programs, schools, courseOfStudy, schoolName, schoolAddress]);

  // Higher-education schools only (excluding DepEd high-school options)
  const collegeSchools = useMemo(() => {
    return schools.filter(
      (s) =>
        s.is_active && !/deped|high\s*school|senior\s*high/i.test(s.school_name) && !/deped/i.test(s.school_code || ""),
    );
  }, [schools]);

  interface ComboboxOption {
    label: string;
    value: string;
    code?: string;
    category?: string;
    address?: string;
  }

  const schoolOptions = useMemo<ComboboxOption[]>(() => {
    const list: ComboboxOption[] = collegeSchools.map((s) => ({
      label: s.school_code ? `${s.school_name} (${s.school_code})` : s.school_name,
      value: s.school_name,
      code: s.school_code ?? undefined,
      address: s.address ?? undefined,
    }));
    list.push({
      label: "Other / Not listed (specify)",
      value: "OTHER",
    });
    return list;
  }, [collegeSchools]);

  const programOptions = useMemo<ComboboxOption[]>(() => {
    const list: ComboboxOption[] = programs
      .filter((p) => p.is_active)
      .map((p) => ({
        label: p.program_code ? `${p.program_name} (${p.program_code})` : p.program_name,
        value: p.program_name,
        code: p.program_code ?? undefined,
        category: p.category || "College Programs",
      }));
    list.push({
      label: "Other / Not listed (specify)",
      value: "OTHER",
    });
    return list;
  }, [programs]);

  const selectedProgramOption = useMemo<ComboboxOption | null>(() => {
    if (isCustomProgram) {
      return {
        label: values.course_of_study.trim()
          ? `Other: ${values.course_of_study.trim()}`
          : "Other / Not listed (specify)",
        value: "OTHER",
      };
    }
    if (!values.course_of_study) return null;
    const found = programOptions.find(
      (p) =>
        p.value.toLowerCase() === values.course_of_study.toLowerCase() ||
        (p.code && p.code.toLowerCase() === values.course_of_study.toLowerCase()),
    );
    if (found) return found;
    return { label: values.course_of_study, value: values.course_of_study };
  }, [isCustomProgram, values.course_of_study, programOptions]);

  const selectedSchoolOption = useMemo<ComboboxOption | null>(() => {
    if (isCustomSchool) {
      return {
        label: values.school_name.trim() ? `Other: ${values.school_name.trim()}` : "Other / Not listed (specify)",
        value: "OTHER",
      };
    }
    if (!values.school_name) return null;
    const found = schoolOptions.find(
      (s) =>
        s.value.toLowerCase() === values.school_name.toLowerCase() ||
        (s.code && s.code.toLowerCase() === values.school_name.toLowerCase()),
    );
    if (found) return found;
    return { label: values.school_name, value: values.school_name };
  }, [isCustomSchool, values.school_name, schoolOptions]);

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

  const handleStudentNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    set("student_number", digits);
  };

  const handleStudentNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleRelativeEmployeeChange = (val: string) => {
    // Strip numbers and disallowed special characters; permit letters, spaces, dots, hyphens, and apostrophes
    const clean = val.replace(/[^a-zA-ZÀ-ÿñÑ\s.\-']/g, "");
    set("relative_employee", clean);
  };

  const handleRelativeEmployeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow modifier keys, control shortcuts, and multi-char navigation keys
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    // Block numbers and disallowed special characters; allow letters, spaces, dots, hyphens, and apostrophes
    if (!/^[a-zA-ZÀ-ÿñÑ\s.\-']$/.test(e.key)) {
      e.preventDefault();
    }
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
            <Field
              id="app-student-number"
              label="Student number"
              required
              hint="5–12 numerical digits only (exclude dashes or special characters)."
              error={fieldErrors.student_number}
            >
              <Input
                id="app-student-number"
                type="text"
                inputMode="numeric"
                maxLength={12}
                placeholder="e.g. 202300123"
                value={values.student_number}
                onChange={(e) => handleStudentNumberChange(e.target.value)}
                onKeyDown={handleStudentNumberKeyDown}
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 items-start">
            <Field id="app-course" label="Program" required error={fieldErrors.course_of_study}>
              <Combobox<ComboboxOption>
                items={programOptions}
                value={selectedProgramOption}
                onValueChange={(selected) => {
                  if (!selected) {
                    setIsCustomProgram(false);
                    set("course_of_study", "");
                    setProgramQuery("");
                    return;
                  }
                  if (selected.value === "OTHER") {
                    setIsCustomProgram(true);
                    const customVal = programQuery.trim();
                    set("course_of_study", customVal);
                  } else {
                    setIsCustomProgram(false);
                    set("course_of_study", selected.value);
                  }
                }}
                onInputValueChange={(q) => setProgramQuery(q)}
                filter={(item, query) => {
                  if (item.value === "OTHER") return true;
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  const text = `${item.label} ${item.code ?? ""} ${item.value}`.toLowerCase();
                  return text.includes(q);
                }}
                itemToStringValue={(item) => item?.label ?? ""}
                isItemEqualToValue={(a, b) => a?.value === b?.value}
                disabled={loadingOptions}
              >
                <ComboboxInput
                  id="app-course"
                  placeholder={loadingOptions ? "Loading programs..." : "Type or search your program..."}
                  className={`w-full ${FIELD_INPUT} rounded-md border border-input`}
                  showClear
                />
                <ComboboxContent className="bg-white border border-border shadow-lg z-50">
                  <ComboboxEmpty className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-2">No matching accredited programs found.</p>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsCustomProgram(true);
                        set("course_of_study", programQuery.trim());
                      }}
                      className="w-full py-1.5 px-3 rounded-md bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-semibold text-center transition-colors cursor-pointer"
                    >
                      + Other / Not Listed (Specify)
                    </button>
                  </ComboboxEmpty>
                  <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    {(item: ComboboxOption) => (
                      <ComboboxItem
                        key={item.value}
                        value={item}
                        className="py-2 px-2.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col text-left min-w-0 pr-4">
                          <span
                            className={`text-sm ${
                              item.value === "OTHER" ? "font-semibold text-amber-700" : "font-medium text-foreground"
                            }`}
                          >
                            {item.value === "OTHER" && programQuery.trim()
                              ? `Use "${programQuery.trim()}" (Other / Not listed)`
                              : item.label}
                          </span>
                          {item.value === "OTHER" && (
                            <span className="text-[11px] text-amber-600/80">
                              Click to specify a custom academic program
                            </span>
                          )}
                          {item.category && item.value !== "OTHER" && (
                            <span className="text-[11px] text-muted-foreground">{item.category}</span>
                          )}
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {isCustomProgram && (
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

            <Field id="app-school-name" label="School name" required error={fieldErrors.school_name}>
              <Combobox<ComboboxOption>
                items={schoolOptions}
                value={selectedSchoolOption}
                onValueChange={(selected) => {
                  if (!selected) {
                    setIsCustomSchool(false);
                    set("school_name", "");
                    set("school_address", "");
                    setSchoolQuery("");
                    return;
                  }
                  if (selected.value === "OTHER") {
                    setIsCustomSchool(true);
                    const customVal = schoolQuery.trim();
                    set("school_name", customVal);
                    set("school_address", "");
                  } else {
                    setIsCustomSchool(false);
                    set("school_name", selected.value);
                    const chosenSchool = schools.find((s) => s.school_name === selected.value);
                    if (chosenSchool?.address) {
                      set("school_address", chosenSchool.address);
                    }
                  }
                }}
                onInputValueChange={(q) => setSchoolQuery(q)}
                filter={(item, query) => {
                  if (item.value === "OTHER") return true;
                  const q = query.trim().toLowerCase();
                  if (!q) return true;
                  const text = `${item.label} ${item.code ?? ""} ${item.value}`.toLowerCase();
                  return text.includes(q);
                }}
                itemToStringValue={(item) => item?.label ?? ""}
                isItemEqualToValue={(a, b) => a?.value === b?.value}
                disabled={loadingOptions}
              >
                <ComboboxInput
                  id="app-school-name"
                  placeholder={
                    loadingOptions
                      ? "Loading schools..."
                      : "Type or search school name or acronym (e.g. USEP, UM, ADDU)..."
                  }
                  className={`w-full ${FIELD_INPUT} rounded-md border border-input`}
                  showClear
                />
                <ComboboxContent className="bg-white border border-border shadow-lg z-50">
                  <ComboboxEmpty className="p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-2">No matching accredited schools found.</p>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsCustomSchool(true);
                        set("school_name", schoolQuery.trim());
                        set("school_address", "");
                      }}
                      className="w-full py-1.5 px-3 rounded-md bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-semibold text-center transition-colors cursor-pointer"
                    >
                      + Other / Not Listed (Specify)
                    </button>
                  </ComboboxEmpty>
                  <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    {(item: ComboboxOption) => (
                      <ComboboxItem
                        key={item.value}
                        value={item}
                        className="py-2 px-2.5 cursor-pointer rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col text-left min-w-0 pr-4">
                          <span
                            className={`text-sm ${
                              item.value === "OTHER" ? "font-semibold text-amber-700" : "font-medium text-foreground"
                            }`}
                          >
                            {item.value === "OTHER" && schoolQuery.trim()
                              ? `Use "${schoolQuery.trim()}" (Other / Not listed)`
                              : item.label}
                          </span>
                          {item.value === "OTHER" && (
                            <span className="text-[11px] text-amber-600/80">
                              Click to specify a custom college or university
                            </span>
                          )}
                          {item.address && item.value !== "OTHER" && (
                            <span className="text-[11px] text-muted-foreground truncate">{item.address}</span>
                          )}
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {isCustomSchool && (
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
              {!isCustomSchool && values.school_address && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-navy/70">Campus:</span> {values.school_address}
                </p>
              )}
            </Field>
          </div>

          {isCustomSchool && (
            <Field
              id="app-school-address"
              label="School address"
              required
              hint="Provide the campus or branch location for this unlisted school."
              error={fieldErrors.school_address}
            >
              <Input
                id="app-school-address"
                placeholder="Street, barangay, city"
                value={values.school_address}
                onChange={(e) => set("school_address", e.target.value)}
                className={FIELD_INPUT}
              />
            </Field>
          )}

          <Field id="app-student-address" label="Home address" required error={fieldErrors.student_address}>
            <Input
              id="app-student-address"
              placeholder="Street, barangay, city"
              value={values.student_address}
              onChange={(e) => set("student_address", e.target.value)}
              className={FIELD_INPUT}
            />
          </Field>
          <Field
            id="app-relative"
            label="Relative employed by partner"
            required
            hint="Company policy allows only 1 scholar per employee. Letters, spaces, and periods only (e.g. for middle initials)."
            error={fieldErrors.relative_employee}
          >
            <Input
              id="app-relative"
              placeholder="e.g. Juan P. Dela Cruz"
              value={values.relative_employee}
              onChange={(e) => handleRelativeEmployeeChange(e.target.value)}
              onKeyDown={handleRelativeEmployeeKeyDown}
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
