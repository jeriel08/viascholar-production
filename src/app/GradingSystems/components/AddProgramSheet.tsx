"use client";

import { BookOpen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { AcademicProgramInput } from "@/lib/api/settings";
import { academicProgramSchema } from "@/lib/validation";

interface AddProgramSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: AcademicProgramInput) => Promise<void>;
}

export function AddProgramSheet({ open, onOpenChange, onCreate }: AddProgramSheetProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("College");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCode("");
      setName("");
      setCategory("College");
      setDescription("");
      setIsActive(true);
      setError("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = academicProgramSchema.safeParse({
      program_code: code,
      program_name: name,
      category,
      description,
      is_active: isActive,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please provide valid program details.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onCreate({
        program_code: result.data.program_code,
        program_name: result.data.program_name,
        category: result.data.category,
        description: result.data.description,
        is_active: result.data.is_active,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add academic program.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden border-l border-border bg-background"
      >
        <div className="flex items-center justify-between border-b border-border p-6 bg-card">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <BookOpen className="size-5" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold text-foreground">
                Add Academic Program
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Configure degree program or Senior High School strand
              </SheetDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="size-8 rounded-full"
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-bad-bg p-3 text-xs font-semibold text-bad">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="program_code" className="text-xs font-bold text-navy uppercase">
              Program Code *
            </Label>
            <Input
              id="program_code"
              placeholder="e.g. BSIT, BSCS, STEM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Abbreviated program or strand code (e.g. BSIT, BSA, STEM, ABM).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="program_name" className="text-xs font-bold text-navy uppercase">
              Program Name *
            </Label>
            <Input
              id="program_name"
              placeholder="e.g. BS Information Technology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-xs font-bold text-navy uppercase">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="College">College Degree Program</SelectItem>
                <SelectItem value="Senior High School">Senior High School Strand</SelectItem>
                <SelectItem value="Vocational">Vocational / Technical</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-navy uppercase">
              Description / Notes (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief details about the program..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-line accent-navy"
            />
            <Label htmlFor="is_active" className="text-xs font-medium cursor-pointer">
              Active (selectable by applicants during application)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t border-line">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Program"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

