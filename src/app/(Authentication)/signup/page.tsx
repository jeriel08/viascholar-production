"use client";

import { cn } from "cn";
import { ArrowRight, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { type ClipboardEvent, type FormEvent, type KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhilippinePhoneNumber, signUpSchema } from "@/lib/validation";
import { AuthShell } from "../components/AuthShell";
import { CheckboxField } from "../components/CheckboxField";
import { InputField } from "../components/InputField";
import { ModeTabs } from "../components/ModeTabs";
import { PasswordChecklist } from "../components/PasswordChecklist";
import { SocialBlock } from "../components/SocialBlock";
import { SuccessPanel } from "../components/SuccessPanel";

function SignUpForm() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) setError("");
  };

  const handleFirstNameChange = (val: string) => {
    // Strip numerical and special characters
    const clean = val.replace(/[^a-zA-ZÀ-ÿñÑ\s]/g, "");
    setFirstName(clean);
    clearError("firstName");
  };

  const handleLastNameChange = (val: string) => {
    // Strip numerical and special characters
    const clean = val.replace(/[^a-zA-ZÀ-ÿñÑ\s]/g, "");
    setLastName(clean);
    clearError("lastName");
  };

  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Block numbers and special characters from key press
    if (e.key.length === 1 && !/^[a-zA-ZÀ-ÿñÑ\s]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhilippinePhoneNumber(val);
    setPhone(formatted);
    clearError("phone");
  };

  const handleConfirmPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPasteBlocked(true);
    setTimeout(() => setPasteBlocked(false), 4000);
  };

  const hasConfirm = confirm.length > 0;
  const isConfirmMatch = hasConfirm && password.length > 0 && confirm === password;
  const isConfirmMismatch = hasConfirm && confirm !== password;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parseResult = signUpSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirm,
      agree,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path[0]?.toString() || "form";
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setError(parseResult.error.issues[0]?.message || "Please fix the errors below.");
      return;
    }

    setErrors({});
    setError("");
    setLoading(true);

    try {
      await register({
        email: parseResult.data.email,
        password: parseResult.data.password,
        first_name: parseResult.data.firstName,
        last_name: parseResult.data.lastName,
        phone_number: parseResult.data.phone,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
        <InputField
          id="firstName"
          label="First name"
          icon={User}
          placeholder="Juan"
          autoComplete="given-name"
          value={firstName}
          hasError={!!errors.firstName}
          errorText={errors.firstName}
          onKeyDown={handleNameKeyDown}
          onChange={handleFirstNameChange}
        />
        <InputField
          id="lastName"
          label="Last name"
          icon={User}
          placeholder="Dela Cruz"
          autoComplete="family-name"
          value={lastName}
          hasError={!!errors.lastName}
          errorText={errors.lastName}
          onKeyDown={handleNameKeyDown}
          onChange={handleLastNameChange}
        />
      </div>
      <InputField
        id="signup-email"
        label="Email address"
        icon={Mail}
        type="email"
        placeholder="you@email.com"
        autoComplete="email"
        value={email}
        hasError={!!errors.email}
        errorText={errors.email}
        onChange={(val) => {
          setEmail(val);
          clearError("email");
        }}
      />
      <InputField
        id="signup-phone"
        label="Phone number"
        icon={Phone}
        type="tel"
        placeholder="09XX XXX XXXX"
        autoComplete="tel"
        maxLength={13}
        value={phone}
        hasError={!!errors.phone}
        errorText={errors.phone}
        hint="Philippine mobile format (e.g. 0917 123 4567)"
        onChange={handlePhoneChange}
      />

      <InputField
        id="signup-password"
        label="Password"
        icon={Lock}
        type="password"
        placeholder="Create password"
        autoComplete="new-password"
        hint="8+ characters: uppercase, lowercase, number, special character."
        value={password}
        hasError={!!errors.password}
        errorText={errors.password}
        onChange={(val) => {
          setPassword(val);
          clearError("password");
        }}
        password
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((v) => !v)}
      />
      <PasswordChecklist password={password} />
      <InputField
        id="confirm-password"
        label="Confirm password"
        icon={Lock}
        type="password"
        placeholder="Re-enter password"
        autoComplete="new-password"
        value={confirm}
        hasError={!!errors.confirm || isConfirmMismatch || pasteBlocked}
        errorText={
          pasteBlocked
            ? "Pasting is disabled for security. Please type your password manually."
            : isConfirmMismatch
              ? "Passwords do not match."
              : errors.confirm
        }
        success={isConfirmMatch}
        successText="Passwords match."
        onPaste={handleConfirmPaste}
        onChange={(val) => {
          setConfirm(val);
          clearError("confirm");
          if (pasteBlocked) setPasteBlocked(false);
        }}
        password
        showPassword={showConfirm}
        onTogglePassword={() => setShowConfirm((v) => !v)}
      />

      {error && <div className="rounded-lg bg-bad-bg px-3 py-2 text-sm font-medium text-bad">{error}</div>}

      <CheckboxField
        id="agree"
        checked={agree}
        onCheckedChange={(v) => {
          setAgree(v === true);
          clearError("agree");
        }}
        label="I agree to the Terms and Privacy Policy"
        className={cn("mb-1", errors.agree && "text-bad")}
        labelClassName="text-[0.76rem] min-[360px]:text-[0.8rem] sm:text-[0.88rem] whitespace-normal min-[350px]:whitespace-nowrap"
      />

      <Button type="submit" disabled={loading} className="h-11 w-full rounded-full text-[0.96rem] font-semibold">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Creating account…
          </>
        ) : (
          <>
            Create account <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

function SignedUpPanel() {
  const { user } = useAuth();
  const continuePath = user?.role === "SCHOLAR" ? "/scholardashboard" : "/ApplicantsApplication";

  return (
    <SuccessPanel
      title="Account created"
      message={
        <>
          Welcome, <strong>{user?.first_name}</strong>
        </>
      }
      roleLabel="Student account"
      continueHref={continuePath}
    />
  );
}

export default function SignupPage() {
  const { user, loading } = useAuth();

  return (
    <AuthShell mode="signup" title="Create your account" subtitle="Start your scholarship application in minutes.">
      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      ) : !user ? (
        <div className="grid gap-6">
          <ModeTabs active="signup" />
          <SignUpForm />
          <SocialBlock />
          <p className="text-center text-[0.92rem] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-navy underline underline-offset-2 hover:text-amber">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <SignedUpPanel />
      )}
    </AuthShell>
  );
}
