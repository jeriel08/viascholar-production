"use client";

import { Building2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolGrading, SchoolInput } from "@/lib/api/settings";
import { schoolSchema } from "@/lib/validation";

interface AddSchoolSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradingSystems?: SchoolGrading[];
  onCreate: (input: SchoolInput) => Promise<void>;
}

interface SpecialCodeEntry {
  id: string;
  code: string;
  meaning: string;
}

const GRADING_SCALE_OPTIONS = [
  {
    value: "NUMERIC_5_POINT",
    label: "5.00 Point Scale (1.00 Highest, 3.00 Passing)",
    description: "Standard for State and Private Universities (UP, USEP, ADDU, etc.)",
  },
  {
    value: "PERCENTAGE_100",
    label: "100% Percentage Scale (100 Highest, 75 Passing)",
    description: "Standard for High Schools (Form 138 / SF9) and percentage colleges",
  },
  {
    value: "NUMERIC_4_POINT",
    label: "4.00 Point Scale (4.00 Highest, 2.00 Passing)",
    description: "Standard 4-point collegiate scale (e.g. University of Mindanao)",
  },
] as const;

function getDefaultSpecialCodes(scale: string): SpecialCodeEntry[] {
  if (scale === "NUMERIC_4_POINT") {
    return [
      { id: "sp-1", code: "7.1", meaning: "Unpaid Tuition" },
      { id: "sp-2", code: "7.2", meaning: "Incomplete" },
      { id: "sp-3", code: "9.0", meaning: "Dropped" },
    ];
  }
  if (scale === "PERCENTAGE_100") {
    return [
      { id: "sp-1", code: "INC", meaning: "Incomplete" },
      { id: "sp-2", code: "DRP", meaning: "Dropped" },
    ];
  }
  return [
    { id: "sp-1", code: "INC", meaning: "Incomplete" },
    { id: "sp-2", code: "DRP", meaning: "Dropped" },
    { id: "sp-3", code: "FA", meaning: "Failure due to Absences" },
  ];
}

export function AddSchoolSheet({ open, onOpenChange, onCreate }: AddSchoolSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradingScale, setGradingScale] = useState<string>("NUMERIC_5_POINT");
  const [specialCodes, setSpecialCodes] = useState<SpecialCodeEntry[]>(getDefaultSpecialCodes("NUMERIC_5_POINT"));
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setAddress("");
      setEmail("");
      setPhone("");
      setGradingScale("NUMERIC_5_POINT");
      setSpecialCodes(getDefaultSpecialCodes("NUMERIC_5_POINT"));
      setIsActive(true);
      setError("");
    }
  }, [open]);

  // When changing scale preset, update special codes with that scale's defaults if untouched
  function handleScaleChange(newScale: string) {
    setGradingScale(newScale);
    setSpecialCodes(getDefaultSpecialCodes(newScale));
  }

  function handleAddSpecialCode() {
    setSpecialCodes((prev) => [
      ...prev,
      { id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, code: "", meaning: "" },
    ]);
  }

  function handleRemoveSpecialCode(id: string) {
    setSpecialCodes((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSpecialCodeChange(id: string, field: "code" | "meaning", value: string) {
    setSpecialCodes((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Build special_codes Record
    const specialCodesRecord: Record<string, string> = {};
    for (const item of specialCodes) {
      const trimmedCode = item.code.trim();
      const trimmedMeaning = item.meaning.trim();
      if (trimmedCode && trimmedMeaning) {
        specialCodesRecord[trimmedCode] = trimmedMeaning;
      }
    }

    const result = schoolSchema.safeParse({
      school_name: name,
      school_code: code || undefined,
      address: address || undefined,
      contact_email: email || undefined,
      contact_number: phone || undefined,
      grading_scale: gradingScale,
      special_codes: Object.keys(specialCodesRecord).length > 0 ? specialCodesRecord : undefined,
      is_active: isActive,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please provide valid school details.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onCreate({
        school_name: result.data.school_name,
        school_code: result.data.school_code,
        address: result.data.address,
        contact_email: result.data.contact_email || undefined,
        contact_number: result.data.contact_number,
        grading_scale: result.data.grading_scale || "NUMERIC_5_POINT",
        special_codes: result.data.special_codes,
        is_active: result.data.is_active,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add school.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl! lg:max-w-3xl! overflow-y-auto bg-white"
        aria-describedby="add-school-desc"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-tint text-navy">
              <Building2 className="size-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-navy">Add Academic Institution</SheetTitle>
              <SheetDescription id="add-school-desc" className="text-xs text-muted-foreground">
                Register a new school or college for applicant selection with its grading scale & codes.
              </SheetDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground hover:bg-tint hover:text-navy"
            onClick={() => onOpenChange(false)}
            aria-label="Close sheet"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between p-6">
          <div className="space-y-5">
            {error && <div className="rounded-xl border border-bad/30 bg-bad-bg p-3.5 text-xs text-bad">{error}</div>}

            <div>
              <Label htmlFor="school-name" className="text-xs font-semibold text-navy">
                School Name <span className="text-amber">*</span>
              </Label>
              <Input
                id="school-name"
                placeholder="e.g. University of Mindanao (UM)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 h-10 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="school-code" className="text-xs font-semibold text-navy">
                  Acronym / Code
                </Label>
                <Input
                  id="school-code"
                  placeholder="e.g. UM"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1.5 h-10 text-sm uppercase"
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="school-status" className="text-xs font-semibold text-navy">
                  Status
                </Label>
                <Select value={isActive ? "active" : "inactive"} onValueChange={(val) => setIsActive(val === "active")}>
                  <SelectTrigger id="school-status" className="mt-1.5 h-10 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Selectable)</SelectItem>
                    <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="grading-scale" className="text-xs font-semibold text-navy">
                Grading Scale System <span className="text-amber">*</span>
              </Label>
              <Select value={gradingScale} onValueChange={handleScaleChange}>
                <SelectTrigger id="grading-scale" className="mt-1.5 h-10 text-sm w-full">
                  <SelectValue placeholder="Select grading scale" />
                </SelectTrigger>
                <SelectContent>
                  {GRADING_SCALE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Standardized passing mark and conversion scale for evaluating applicant GWA.
              </p>
            </div>

            {/* Special Grade Codes Section */}
            <div className="space-y-3 rounded-xl border border-line bg-[#fbfbfa] p-4.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold text-navy">Special Grade Status Codes</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Institution-specific marks appearing on transcripts (e.g. unpaid tuition, incomplete, dropped).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpecialCode}
                  className="h-8 gap-1.5 rounded-lg border-line bg-white px-2.5 text-xs font-medium text-navy shadow-xs hover:bg-tint shrink-0 self-start sm:self-auto"
                >
                  <Plus className="size-3.5" />
                  <span>Add Code</span>
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                {specialCodes.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="w-28 sm:w-32 shrink-0">
                      <Input
                        placeholder="Code (e.g. 7.1)"
                        value={item.code}
                        onChange={(e) => handleSpecialCodeChange(item.id, "code", e.target.value)}
                        className="h-9 bg-white font-mono text-xs uppercase"
                      />
                    </div>
                    <span className="text-muted-foreground text-xs font-bold shrink-0">=</span>
                    <div className="flex-1">
                      <Input
                        placeholder="Meaning (e.g. Unpaid Tuition)"
                        value={item.meaning}
                        onChange={(e) => handleSpecialCodeChange(item.id, "meaning", e.target.value)}
                        className="h-9 bg-white text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSpecialCode(item.id)}
                      className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-bad-bg hover:text-bad"
                      aria-label="Remove code"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}

                {specialCodes.length === 0 && (
                  <p className="text-[11px] text-muted-foreground italic py-1">
                    No special codes defined. Click &ldquo;Add Code&rdquo; to specify institution marks.
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="school-address" className="text-xs font-semibold text-navy">
                Physical Campus Address
              </Label>
              <Textarea
                id="school-address"
                placeholder="Street, barangay, city, province"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 text-sm resize-none min-h-[70px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-email" className="text-xs font-semibold text-navy">
                  Contact / Admissions Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="registrar@school.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="contact-phone" className="text-xs font-semibold text-navy">
                  Contact Number
                </Label>
                <Input
                  id="contact-phone"
                  placeholder="+63 82 227 5456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-10.5 px-5 rounded-xl text-sm font-medium border-border/80 hover:bg-muted/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-10.5 px-6 rounded-xl text-sm font-semibold shadow-xs bg-[#0a4f42] hover:bg-[#083c32] text-white"
            >
              {saving ? "Registering..." : "Register School"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
