"use client";

import { Building2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { School, SchoolGrading, SchoolInput } from "@/lib/api/settings";
import { schoolSchema } from "@/lib/validation";

interface SchoolSheetProps {
  school: School | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradingSystems: SchoolGrading[];
  onUpdate: (id: number, input: Partial<SchoolInput>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function SchoolSheet({ school, open, onOpenChange, gradingSystems, onUpdate, onDelete }: SchoolSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradingSystemId, setGradingSystemId] = useState<string>("NONE");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (school && open) {
      setName(school.school_name);
      setCode(school.school_code || "");
      setAddress(school.address || "");
      setEmail(school.contact_email || "");
      setPhone(school.contact_number || "");
      setGradingSystemId(school.grading_system_id ? String(school.grading_system_id) : "NONE");
      setIsActive(school.is_active);
      setError("");
    }
  }, [school, open]);

  if (!school) return null;

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!school) return;

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
      await onUpdate(school.school_id, {
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
      setError(err instanceof Error ? err.message : "Failed to update school.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!school) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete(school.school_id);
      setConfirmDelete(false);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete school.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg md:max-w-xl overflow-y-auto bg-white"
          aria-describedby="edit-school-desc"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-tint text-navy">
                <Building2 className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-navy">Edit Academic Institution</SheetTitle>
                <SheetDescription id="edit-school-desc" className="text-xs text-muted-foreground">
                  Update institution details and associated grading scale.
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

          <form onSubmit={handleSave} className="flex flex-1 flex-col justify-between p-6">
            <div className="space-y-4">
              {error && <div className="rounded-xl border border-bad/30 bg-bad-bg p-3.5 text-xs text-bad">{error}</div>}

              <div>
                <Label htmlFor="edit-school-name" className="text-xs font-semibold text-navy">
                  School Name <span className="text-amber">*</span>
                </Label>
                <Input
                  id="edit-school-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-10 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-school-code" className="text-xs font-semibold text-navy">
                    Acronym / Code
                  </Label>
                  <Input
                    id="edit-school-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1.5 h-10 text-sm uppercase"
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-school-status" className="text-xs font-semibold text-navy">
                    Status
                  </Label>
                  <Select
                    value={isActive ? "active" : "inactive"}
                    onValueChange={(val) => setIsActive(val === "active")}
                  >
                    <SelectTrigger id="edit-school-status" className="mt-1.5 h-10 text-sm w-full">
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
                <Label htmlFor="edit-grading-system-id" className="text-xs font-semibold text-navy">
                  Connected Grading System Scale
                </Label>
                <Select value={gradingSystemId} onValueChange={setGradingSystemId}>
                  <SelectTrigger id="edit-grading-system-id" className="mt-1.5 h-10 text-sm w-full">
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
                <Label htmlFor="edit-school-address" className="text-xs font-semibold text-navy">
                  Physical Campus Address
                </Label>
                <Textarea
                  id="edit-school-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 text-sm resize-none min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-contact-email" className="text-xs font-semibold text-navy">
                    Contact / Admissions Email
                  </Label>
                  <Input
                    id="edit-contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-10 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-contact-phone" className="text-xs font-semibold text-navy">
                    Contact Number
                  </Label>
                  <Input
                    id="edit-contact-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-bad border-bad/30 hover:bg-bad-bg"
                onClick={() => setConfirmDelete(true)}
                disabled={saving || deleting}
              >
                <Trash2 className="size-4 mr-1.5" />
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving || deleting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || deleting}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {school.school_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this academic institution? If scholars are already linked to this school,
              it will be safely deactivated instead of deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-bad text-white hover:bg-bad/90">
              {deleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
