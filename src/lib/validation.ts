import { z } from "zod";

// Standard password policy: at least 8 characters with 1 uppercase,
// 1 lowercase, 1 number, and 1 special character. Used everywhere a
// password is set (admin add-employee, signup, …) so the rule stays in
// one place. Stricter than the backend minimum (8 chars), so anything
// passing here is always accepted server-side.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least 1 number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character.");

export type PasswordInput = z.infer<typeof passwordSchema>;

// Returns the first unmet requirement, or null when the value is valid.
export function getPasswordError(value: string): string | null {
  const result = passwordSchema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Password does not meet the requirements.";
}

// Add employee schema (provisioning Coordinator / Grantor / Admin accounts)
export const addEmployeeSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name is too long.")
    .regex(/^[^0-9]+$/, "First name cannot contain numerical characters."),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name is too long.")
    .regex(/^[^0-9]+$/, "Last name cannot contain numerical characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),
  password: passwordSchema,
  role: z.enum(["COORDINATOR", "GRANTOR", "ADMIN"], {
    error: "Please select a valid role.",
  }),
  title: z.string().trim().max(100, "Job title is too long.").optional(),
  department: z.string().trim().max(100, "Department name is too long.").optional(),
});

export type AddEmployeeFormValues = z.infer<typeof addEmployeeSchema>;

// Global grade retention threshold: percentage between 0 and 100.
export const thresholdSchema = z
  .number({ error: "Threshold must be a number." })
  .min(0, "Threshold must be at least 0%.")
  .max(100, "Threshold must be at most 100%.");

// School grading system form (mirrors CreateSchoolGradingDto on the backend).
export const schoolGradingSchema = z.object({
  school_name: z.string().trim().min(1, "School name is required.").max(150, "School name is too long."),
  grading_scale: z.string().trim().min(1, "Grading scale is required.").max(50, "Grading scale is too long."),
  passing_grade: z.number({ error: "Passing grade must be a number." }).finite("Passing grade must be a number."),
  highest_grade: z.number({ error: "Highest grade must be a number." }).finite("Highest grade must be a number."),
  failing_grade: z.number({ error: "Failing grade must be a number." }).finite("Failing grade must be a number."),
  notes: z.string().max(2000, "Notes are too long.").optional(),
  special_codes: z.record(z.string(), z.string()).optional(),
});

// Academic program schema (mirrors CreateAcademicProgramDto on backend)
export const academicProgramSchema = z.object({
  program_code: z
    .string()
    .trim()
    .min(1, "Program code is required.")
    .max(50, "Program code is too long.")
    .transform((v) => v.toUpperCase()),
  program_name: z.string().trim().min(1, "Program name is required.").max(150, "Program name is too long."),
  category: z.string().trim().max(50, "Category is too long.").optional(),
  description: z.string().trim().max(1000, "Description is too long.").optional(),
  is_active: z.boolean().optional(),
});

export type AcademicProgramFormValues = z.infer<typeof academicProgramSchema>;

// School institution schema (mirrors CreateSchoolDto on backend)
export const schoolSchema = z.object({
  school_name: z.string().trim().min(1, "School name is required.").max(150, "School name is too long."),
  school_code: z
    .string()
    .trim()
    .max(50, "School code is too long.")
    .optional()
    .transform((v) => (v ? v.toUpperCase() : undefined)),
  address: z.string().trim().max(500, "Address is too long.").optional(),
  contact_email: z.string().trim().email("Invalid email address.").optional().or(z.literal("")),
  contact_number: z.string().trim().max(50, "Contact number is too long.").optional(),
  grading_system_id: z.number().int().positive().optional().nullable(),
  is_active: z.boolean().optional(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

// Academic year level options (1 to 5: College, 6: Masteral, 7: Doctoral)
export const YEAR_LEVEL_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
  { value: "6", label: "Masteral" },
  { value: "7", label: "Doctoral" },
] as const;

// Scholarship application form (mirrors CreateApplicationDto on the backend).
export const applicationSchema = z.object({
  scholarship_track: z.string().trim().min(1, "Please choose a scholarship track."),
  student_number: z
    .string()
    .trim()
    .min(1, "Student number is required.")
    .regex(
      /^\d{5,12}$/,
      "Student number must be between 5 and 12 numerical digits (exclude dashes or special characters).",
    ),
  student_address: z.string().trim().min(1, "Home address is required.").max(500, "Home address is too long."),
  course_of_study: z.string().trim().min(1, "Program is required.").max(150, "Program name is too long."),
  current_year_level: z.string().trim().min(1, "Please select your current year level."),
  school_name: z.string().trim().min(1, "School name is required.").max(150, "School name is too long."),
  school_address: z.string().trim().min(1, "School address is required.").max(500, "School address is too long."),
  phone_number: z.string().trim().max(30, "Phone number is too long.").optional(),
  relative_employee: z
    .string()
    .trim()
    .min(1, "Relative employed by partner is required.")
    .max(150, "Name is too long.")
    .regex(
      /^[a-zA-ZÀ-ÿñÑ\s.\-']+$/,
      "Relative employee name can only contain letters, spaces, and periods (e.g. for middle initials).",
    ),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

// Helper to format Philippine mobile numbers as 09XX XXX XXXX
export function formatPhilippinePhoneNumber(val: string): string {
  // Strip all non-digit characters
  let digits = val.replace(/\D/g, "");

  // Auto-convert international +63 / 63 prefix to 09
  if (digits.startsWith("63") && digits.length >= 3) {
    digits = `0${digits.slice(2)}`;
  }

  // Cap at 11 digits
  digits = digits.slice(0, 11);

  // Format as 09XX XXX XXXX
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
}

// Signup form validation schema
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(100, "First name is too long.")
      .regex(/^[^0-9]+$/, "First name cannot contain numerical characters."),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(100, "Last name is too long.")
      .regex(/^[^0-9]+$/, "Last name cannot contain numerical characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Please enter a valid email address.")
      .max(255, "Email is too long."),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .transform((val) => val.replace(/\s+/g, ""))
      .pipe(
        z
          .string()
          .regex(
            /^09\d{9}$/,
            "Phone number must be an 11-digit Philippine mobile number starting with 09 (e.g., 0917 123 4567).",
          ),
      ),
    password: passwordSchema,
    confirm: z.string().min(1, "Please confirm your password."),
    agree: z.boolean().refine((val) => val === true, {
      message: "Please agree to the Terms and Privacy Policy to continue.",
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
