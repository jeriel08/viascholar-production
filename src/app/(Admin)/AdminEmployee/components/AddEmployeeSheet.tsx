"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";
import type { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import { PasswordChecklist } from "@/app/(Authentication)/components/PasswordChecklist";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { addEmployeeSchema } from "@/lib/validation";
import type { AddEmployeeFields } from "./employee-helpers";

interface AddEmployeeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: AddEmployeeFields;
  onFieldsChange: (fields: AddEmployeeFields) => void;
  adding: boolean;
  addError: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

function AddEmployeeFormBody({
  fields,
  set,
  showPw,
  setShowPw,
  addError,
  adding,
  onSubmit,
  onCancel,
}: {
  fields: AddEmployeeFields;
  set: (patch: Partial<AddEmployeeFields>) => void;
  showPw: boolean;
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>;
  addError: string;
  adding: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFirstNameChange = (val: string) => {
    // Strip numerical and special characters immediately
    const clean = val.replace(/[^a-zA-ZÀ-ÿñÑ\s]/g, "");
    set({ first_name: clean });
    clearFieldError("first_name");
  };

  const handleLastNameChange = (val: string) => {
    // Strip numerical and special characters immediately
    const clean = val.replace(/[^a-zA-ZÀ-ÿñÑ\s]/g, "");
    set({ last_name: clean });
    clearFieldError("last_name");
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Prevent typing numbers and special characters
    if (e.key.length === 1 && !/^[a-zA-ZÀ-ÿñÑ\s]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = addEmployeeSchema.safeParse(fields);
    if (!result.success) {
      const errorsMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0]?.toString() || "form";
        if (!errorsMap[fieldName]) {
          errorsMap[fieldName] = issue.message;
        }
      }
      setFieldErrors(errorsMap);
      return;
    }
    setFieldErrors({});
    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col gap-4">
      {/* First Name & Last Name - Stacked on mobile only */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="add-first-name" className="text-xs font-semibold">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="add-first-name"
            value={fields.first_name}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            onKeyDown={handleNameKeyDown}
            placeholder="e.g. Maria"
            required
            className={cn(
              "h-10 sm:h-9 text-xs",
              fieldErrors.first_name && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
          {fieldErrors.first_name && (
            <p className="text-[11px] font-medium text-destructive">{fieldErrors.first_name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-last-name" className="text-xs font-semibold">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="add-last-name"
            value={fields.last_name}
            onChange={(e) => handleLastNameChange(e.target.value)}
            onKeyDown={handleNameKeyDown}
            placeholder="e.g. Santos"
            required
            className={cn(
              "h-10 sm:h-9 text-xs",
              fieldErrors.last_name && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
          {fieldErrors.last_name && <p className="text-[11px] font-medium text-destructive">{fieldErrors.last_name}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="add-email" className="text-xs font-semibold">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="add-email"
          type="email"
          value={fields.email}
          onChange={(e) => {
            set({ email: e.target.value });
            clearFieldError("email");
          }}
          placeholder="employee@viascholar.edu.ph"
          required
          className={cn(
            "h-10 sm:h-9 text-xs",
            fieldErrors.email && "border-destructive focus-visible:ring-destructive/30",
          )}
        />
        {fieldErrors.email && <p className="text-[11px] font-medium text-destructive">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="add-password" className="text-xs font-semibold">
          Password <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="add-password"
            type={showPw ? "text" : "password"}
            placeholder="At least 8 characters"
            value={fields.password}
            onChange={(e) => {
              set({ password: e.target.value });
              clearFieldError("password");
            }}
            required
            className={cn(
              "h-10 sm:h-9 pr-9 text-xs",
              fieldErrors.password && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {fieldErrors.password && <p className="text-[11px] font-medium text-destructive">{fieldErrors.password}</p>}
        <p className="text-[11px] text-muted-foreground">
          8+ characters with uppercase, lowercase, number, and special character.
        </p>
        <div className="mt-1">
          <PasswordChecklist password={fields.password} />
        </div>
      </div>

      {/* Role & Department - Stacked on mobile only */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="add-role" className="text-xs font-semibold">
            Role <span className="text-destructive">*</span>
          </Label>
          <Select
            value={fields.role}
            onValueChange={(v) => {
              set({ role: v });
              clearFieldError("role");
            }}
          >
            <SelectTrigger
              id="add-role"
              className={cn(
                "h-10 sm:h-9 text-xs",
                fieldErrors.role && "border-destructive focus-visible:ring-destructive/30",
              )}
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COORDINATOR" className="text-xs">
                Coordinator
              </SelectItem>
              <SelectItem value="GRANTOR" className="text-xs">
                Grantor
              </SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.role && <p className="text-[11px] font-medium text-destructive">{fieldErrors.role}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="add-department" className="text-xs font-semibold">
            Department
          </Label>
          <Input
            id="add-department"
            value={fields.department}
            onChange={(e) => {
              set({ department: e.target.value });
              clearFieldError("department");
            }}
            placeholder="e.g. Scholarship Office"
            className={cn(
              "h-10 sm:h-9 text-xs",
              fieldErrors.department && "border-destructive focus-visible:ring-destructive/30",
            )}
          />
          {fieldErrors.department && (
            <p className="text-[11px] font-medium text-destructive">{fieldErrors.department}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="add-title" className="text-xs font-semibold">
          Job Title
        </Label>
        <Input
          id="add-title"
          placeholder="e.g. Scholarship Coordinator"
          value={fields.title}
          onChange={(e) => {
            set({ title: e.target.value });
            clearFieldError("title");
          }}
          className={cn(
            "h-10 sm:h-9 text-xs",
            fieldErrors.title && "border-destructive focus-visible:ring-destructive/30",
          )}
        />
        {fieldErrors.title && <p className="text-[11px] font-medium text-destructive">{fieldErrors.title}</p>}
      </div>

      {addError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {addError}
        </div>
      )}

      {/* Action Buttons - Stacked on mobile with equal full width */}
      <div className="flex flex-col gap-2.5 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="order-2 h-11 w-full text-xs sm:order-1 sm:h-9 sm:w-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="order-1 h-11 w-full text-xs font-semibold sm:order-2 sm:h-9 sm:w-auto"
          disabled={adding}
        >
          {adding ? "Adding..." : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}

export function AddEmployeeSheet({
  open,
  onOpenChange,
  fields,
  onFieldsChange,
  adding,
  addError,
  onSubmit,
}: AddEmployeeSheetProps) {
  const isMobile = useIsMobile();
  const set = (patch: Partial<AddEmployeeFields>) => onFieldsChange({ ...fields, ...patch });
  const [showPw, setShowPw] = useState(false);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex h-[88vh] max-h-[92vh] min-h-[80vh] flex-col p-0">
          <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-2 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">Add Employee</p>
                  <p className="text-xs text-muted-foreground">Create a coordinator or grantor account.</p>
                </div>
              </div>
            </div>

            <AddEmployeeFormBody
              fields={fields}
              set={set}
              showPw={showPw}
              setShowPw={setShowPw}
              addError={addError}
              adding={adding}
              onSubmit={onSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-6 sm:max-w-md">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </span>
            <div>
              <SheetTitle className="text-lg font-semibold">Add Employee</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Create a coordinator or grantor account.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <AddEmployeeFormBody
          fields={fields}
          set={set}
          showPw={showPw}
          setShowPw={setShowPw}
          addError={addError}
          adding={adding}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
