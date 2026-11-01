"use client";

import { cn } from "cn";
import { Check, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { type ClipboardEvent, type KeyboardEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  password?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  className?: string;
  hasError?: boolean;
  errorText?: string;
  success?: boolean;
  successText?: string;
  onPaste?: (e: ClipboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  maxLength?: number;
}

export function InputField({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  hint,
  autoComplete,
  value,
  onChange,
  password = false,
  showPassword,
  onTogglePassword,
  className,
  hasError = false,
  errorText,
  success = false,
  successText,
  onPaste,
  onKeyDown,
  maxLength,
}: InputFieldProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isPassword = password && type === "password";
  const visible = showPassword ?? internalVisible;
  const toggle = () => {
    if (onTogglePassword) onTogglePassword();
    else setInternalVisible((v) => !v);
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn("text-[0.94rem] font-medium transition-colors", hasError ? "text-bad" : "text-navy")}
      >
        {label}
      </Label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 transition-colors",
            hasError ? "text-bad" : success ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
          )}
        />
        <Input
          id={id}
          type={isPassword ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          maxLength={maxLength}
          aria-invalid={hasError}
          onPaste={onPaste}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 pl-9 transition-colors",
            isPassword && "pr-9",
            hasError && "border-bad/80 focus-visible:border-bad focus-visible:ring-bad/30 dark:border-bad",
            success &&
              !hasError &&
              "border-emerald-500/80 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30",
          )}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={toggle}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-navy"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hasError && errorText ? (
        <p className="text-[0.8rem] font-medium text-bad">{errorText}</p>
      ) : success && successText ? (
        <p className="flex items-center gap-1 text-[0.8rem] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5" />
          {successText}
        </p>
      ) : hint ? (
        <p className="text-[0.8rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
