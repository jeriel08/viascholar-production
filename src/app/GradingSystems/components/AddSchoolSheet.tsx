"use client";

import { Building2, X } from "lucide-react";
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
  gradingSystems: SchoolGrading[];
  onCreate: (input: SchoolInput) => Promise<void>;
}

export function AddSchoolSheet({ open, onOpenChange, gradingSystems, onCreate }: AddSchoolSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradingSystemId, setGradingSystemId] = useState<string>("NONE");
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
      setGradingSystemId("NONE");
      setIsActive(true);
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const gId = gradingSystemId !== "NONE" ? Number(gradingSystemId) : null;

    const result = schoolSchema.safeParse({
      school_name: name,
      school_code: code || undefined,
      address: address || undefined,
      contact_email: email || undefined,
      contact_number: phone || undefined,
      grading_system_id: gId,
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
        grading_system_id: result.data.grading_system_id || undefined,
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
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg md:max-w-xl overflow-y-auto bg-white"
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
                Register a new school or college for applicant selection.
              </SheetDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between p-6">
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="grading-system-id" className="text-xs font-semibold text-navy">
                Connected Grading System Scale
              </Label>
              <Select value={gradingSystemId} onValueChange={setGradingSystemId}>
                <SelectTrigger id="grading-system-id" className="mt-1.5 h-10 text-sm w-full">
                  <SelectValue placeholder="Select grading scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Unassigned / None</SelectItem>
                  {gradingSystems.map((gs) => (
                    <SelectItem key={gs.school_id} value={String(gs.school_id)}>
                      {gs.school_name} ({gs.grading_scale.replace(/_/g, " ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Associates this institution with its standardized passing and conversion scale.
              </p>
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

            <div className="grid grid-cols-2 gap-4">
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

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Registering..." : "Register School"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
