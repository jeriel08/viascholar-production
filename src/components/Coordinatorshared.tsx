import type { CSSProperties, ReactNode } from "react";

// ============================================================
// GLOBAL STYLES
// ============================================================
//
// NOTE ON THE LAYOUT FIX
// -----------------------
// The old .vc-main / .vc-snap-section rules used `height: 100vh` +
// `scroll-snap-type: y mandatory` + `min-height: 100vh` with
// `justify-content: center`. That combination is what was cutting
// cards, panels, and tables off at the bottom: every "page" was
// forced into exactly one viewport tall, snapped, and vertically
// centered, so anything taller than the window got clipped instead
// of scrolled to.
//
// The fix below removes the forced viewport-height sections and the
// scroll-snapping entirely. The page now scrolls the normal way
// (natural document flow via SidebarInset), the shadcn sidebar stays
// pinned by the SidebarProvider, and every content area gets generous
// bottom padding so the last card or table always ends with visible
// rounded corners instead of running into the edge of the window.
//
// Sidebar migration note: the legacy .vc-sidebar fixed-position rules
// were removed — the shadcn Sidebar handles desktop collapse (icon
// mode) and mobile (Sheet) itself, so those overrides only fought it.

export function GlobalStyles() {
  return (
    <style>{`
      .vc {
        background: #FFFFFF;
        color: #2B2B28;
        font-family: 'Inter', -apple-system, sans-serif;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        line-height: 1.45;
      }
      .vc h1, .vc h2, .vc h3 { font-family: 'Inter', -apple-system, sans-serif; font-weight: 700; color: #14213A; }
      .vc a { color: inherit; text-decoration: none; }
      /* NOTE: the reset below deliberately skips ShadCN controls (they all
         carry a data-slot attribute). This style block is unlayered, so it
         would otherwise override every Tailwind utility (which lives in a
         cascade layer) — e.g. background none was wiping out bg-navy and
         bg-primary on ShadCN Buttons and leaving them transparent. */
      .vc button { cursor: pointer; }
      .vc button:not([data-slot]) { font-family: 'Inter', sans-serif; font-weight: 500; border: none; background: none; }
      .vc table { border-collapse: collapse; width: 100%; }
      .vc ::-webkit-scrollbar { width: 8px; height: 8px; }
      .vc ::-webkit-scrollbar-thumb { background: #DFE4EA; border-radius: 8px; }

      /* Scoped the same way as the button reset above: ShadCN controls keep
         their own focus rings instead of getting the legacy amber outline
         and radius override. */
      .vc button:not([data-slot]):focus-visible,
      .vc a:focus-visible,
      .vc input:not([data-slot]):focus-visible,
      .vc select:not([data-slot]):focus-visible,
      .vc textarea:not([data-slot]):focus-visible {
        outline: 2px solid #F1B71E;
        outline-offset: 2px;
        border-radius: 6px;
      }

      /* ---- Layout: natural scrolling, no viewport clipping ---- */
      .vc-app-shell { display: flex; min-height: 100vh; align-items: flex-start; }
      .vc-main { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; }
      .vc-snap-section,
      .vc-snap-section-table { padding: 0; }

      /* ---- Subtle, consistent interaction states ---- */
      .vc table tbody tr { transition: background-color 0.12s ease; }
      .vc table tbody tr:hover { background-color: #F7F9FB; }

      .vc-card-interactive { transition: box-shadow 0.15s ease, transform 0.15s ease; cursor: pointer; }
      .vc-card-interactive:hover { box-shadow: 0 10px 28px rgba(20, 33, 58, 0.10); transform: translateY(-2px); }

      .vc-nav-item { transition: background-color 0.12s ease, color 0.12s ease; }
      .vc-nav-item:hover { background-color: #EEF1F5; }

      @media (max-width: 980px) {
        .vc-content-grid { grid-template-columns: 1fr !important; }
        .vc-stat-row { grid-template-columns: 1fr 1fr !important; }
        .vc-table-scroll { overflow-x: auto; }
      }
      @media (max-width: 860px) {
        .vc-main { margin-left: 0 !important; }
        .vc-mobile-toggle { display: flex !important; }
      }
      @media (max-width: 700px) {
        .vc-messages-shell { grid-template-columns: 1fr !important; height: auto !important; }
      }
      @media (max-width: 640px) {
        .vc-stat-row { grid-template-columns: 1fr !important; }
        .vc-topbar-search { display: none !important; }
        .vc-field-row-2 { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ============================================================
// DESIGN TOKENS
// ============================================================
// Matched to Adminshared's palette: deep navy + warm gold accent,
// with green standing in as the "good/positive" tone.

export const NAVY = "#0a4f42";
export const CREAM = "#FFFFFF";
export const AMBER = "#F1B71E";
export const AMBER_BG = "#FCEEC4";
export const WHITE = "#FFFFFF";
export const GRAY = "#6B6B66";
export const LINE = "#DFE4EA";
export const TINT = "#EEF1F5";
export const GREEN = "#0a4f42";
export const GREEN_BG = "#DDEEE3";
export const GOOD = "#0a4f42";
export const GOOD_BG = "#DDEEE3";
export const WARN = "#8A6410";
export const WARN_BG = "#FCEEC4";
export const BAD = "#8a3a2e";
export const BAD_BG = "#F6E4DF";

export const SHADOW_SM = "0 4px 18px rgba(30, 58, 95, 0.09)";
export const SHADOW_MD = "0 10px 28px rgba(30, 58, 95, 0.13)";
export const BORDER_SUBTLE = "1px solid rgba(30, 58, 95, 0.10)";

// ============================================================
// ICONS
// ============================================================

export function HomeIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
export function PeopleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.2 2.7-5.6 6-5.6s6 2.4 6 5.6" />
      <circle cx="17" cy="8.5" r="2.6" />
      <path d="M21 19c0-2.6-1.7-4.7-4-5.3" />
    </svg>
  );
}
export function InterviewIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  );
}
export function CalendarIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}
export function MonitorIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}
export function ReportsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 16v-4M12 16V8M16 16v-7" />
    </svg>
  );
}
export function ArchiveIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  );
}
export function MailIcon({ small }: { small?: boolean }) {
  const sz = small ? 16 : 19;
  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
export function SettingsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.51.99.9 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
export function ProfileIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}
export function CheckCircleIcon({ small }: { small?: boolean }) {
  const sz = small ? 16 : 19;
  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.2 2.2 5-5.4" />
    </svg>
  );
}
export function XCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}
export function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke={NAVY}
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
export function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7a7a74"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
export function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={NAVY}
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
export function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
export function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function GradCapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3z" fill="white" />
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="white" />
    </svg>
  );
}
export function SendIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
export function CameraIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
export function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />
    </svg>
  );
}
export function TrendUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </svg>
  );
}
export function TrendDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 7l6 6 4-4 8 8" />
      <path d="M17 17h4v-4" />
    </svg>
  );
}
export function PaymentsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="6" width="20" height="13" rx="2.2" />
      <path d="M2 10.5h20" />
      <circle cx="7" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function ChevronDownIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
export function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
export function ToggleIcon({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: on ? AMBER : LINE,
        display: "inline-flex",
        alignItems: "center",
        padding: 3,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.15s",
        }}
      />
    </span>
  );
}

// ============================================================
// DATA TYPES
// ============================================================

export type Stage = "Submitted" | "Under review" | "Interview" | "Endorsed" | "Accepted" | "Rejected";

export interface Applicant {
  id: number;
  name: string;
  initials: string;
  course: string;
  year: string;
  track: string;
  // Null when the applicant has neither confirmed document data nor a grade
  // report yet. GET /applications resolves this from confirmed_data first.
  gwa: number | null;
  // Where the GWA came from: the student's confirmed document data or a
  // verified grade report. Used as a tooltip on the GWA column.
  gwaSource?: "confirmed" | "verified" | null;
  // Whether a real interview exists (application.interview_at is set).
  // Distinct from stage === "Interview", which is only a pipeline label and
  // can be set without anything scheduled — the schedule/reschedule choice
  // must key off this, never off the label.
  hasInterview?: boolean;
  // Raw interview timestamp for "before the meeting" confirmations.
  interviewAt?: string | null;
  // Scholar profile id — needed to provide a contract after approval.
  profileId?: number | null;
  applied: string;
  stage: Stage;
  studentNumber?: string | null;
  studentAddress?: string | null;
  phoneNumber?: string | null;
  schoolName?: string | null;
  schoolAddress?: string | null;
  relativeEmployee?: string | null;
  documentsCount?: number;
  hasContract?: boolean;
  contractStatus?: string | null;
  contractNumber?: string | null;
  contractId?: number | null;
  contractDocumentUrl?: string | null;
}

export interface ScheduledInterview {
  id: number;
  name: string;
  initials: string;
  date: string;
  time: string;
}

export interface GradeRecord {
  term: string;
  gwa: number;
  status: "Passed" | "Failed" | "Incomplete";
}

export interface HistoryPaymentRecord {
  term: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "On hold" | "Settled";
}

export interface ActiveScholar {
  id: number;
  name: string;
  initials: string;
  course: string;
  gwa: number;
  trend: "up" | "down";
  docs: string;
  disbursement: string;
  health: "good" | "warn" | "bad";
  currentPayment: {
    term: string;
    amount: number;
    status: "Paid" | "Pending" | "On hold" | "Settled";
  };
  gradeHistory: GradeRecord[];
  paymentHistory: HistoryPaymentRecord[];
}

export interface PaymentRecord {
  id: number;
  name: string;
  initials: string;
  course: string;
  amount: number;
  term: string;
  scheduledDate: string;
  status: "Paid" | "Scheduled" | "On hold";
  // Older payments (before the current term). Shown in the Payment page
  // drawer's "View full history" view.
  paymentHistory: HistoryPaymentRecord[];
}

export interface ArchivedScholar {
  id: number;
  name: string;
  initials: string;
  course: string;
  track: string;
  joined: string;
  exited: string;
  status: "Graduated" | "Terminated" | "Withdrawn";
  note: string;
  gradeHistory: GradeRecord[];
  paymentHistory: HistoryPaymentRecord[];
}

export interface Message {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

// ============================================================
// MOCK DATA
// ============================================================

export const COORDINATOR = {
  name: "Engr. Paolo Reyes",
  initials: "PR",
  title: "HR Coordinator, Partner Company",
  email: "paolo.reyes@viascholar.org",
  bio: "Coordinating ViaScholar's Academic and Financial Need tracks for Davao City partner companies since 2022. Focused on keeping the review pipeline fast and fair.",
  bannerGradient: "linear-gradient(120deg, #14283F 0%, #1E3A5F 100%)",
  avatarColor: AMBER_BG,
};

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon />, href: "/CoordinatorDashboard" },
  { key: "applicants", label: "Applicants", icon: <PeopleIcon />, href: "/CoordinatorApplicants", badge: 12 },
  { key: "meeting", label: "Meeting", icon: <InterviewIcon />, href: "/CoordinatorMeeting", badge: 4 },
  { key: "monitor", label: "Monitor", icon: <MonitorIcon />, href: "/CoordinatorMonitor" },
  { key: "payment", label: "Disbursements", icon: <PaymentsIcon />, href: "/CoordinatorPayment", badge: 2 },
  { key: "archive", label: "Archive", icon: <ArchiveIcon />, href: "/CoordinatorArchive" },
  { key: "reports", label: "Analytics", icon: <ReportsIcon />, href: "/CoordinatorReports" },
  { key: "message", label: "Message", icon: <MailIcon />, href: "/CoordinatorMessage", badge: 3 },
  { key: "settings", label: "Settings", icon: <SettingsIcon />, href: "/CoordinatorSettings" },
  { key: "profile", label: "Profile", icon: <ProfileIcon />, href: "/CoordinatorProfile" },
];

export const APPLICANTS: Applicant[] = [
  {
    id: 1,
    name: "Donna Mae Fayloga",
    initials: "DF",
    course: "BS Information Technology",
    year: "3rd year",
    track: "Academic",
    gwa: 92.6,
    applied: "Jun 12, 2026",
    stage: "Interview",
  },
  {
    id: 2,
    name: "Jonas L.",
    initials: "JL",
    course: "BS Computer Science",
    year: "2nd year",
    track: "Academic",
    gwa: 90.1,
    applied: "Jun 14, 2026",
    stage: "Under review",
  },
  {
    id: 3,
    name: "Mariella S.",
    initials: "MS",
    course: "BS Accountancy",
    year: "4th year",
    track: "Returning Scholar",
    gwa: 94.2,
    applied: "Jun 9, 2026",
    stage: "Accepted",
  },
  {
    id: 4,
    name: "Reign P.",
    initials: "RP",
    course: "BS Nursing",
    year: "1st year",
    track: "Financial Need",
    gwa: 88.5,
    applied: "Jun 20, 2026",
    stage: "Submitted",
  },
  {
    id: 5,
    name: "Carlo Bautista",
    initials: "CB",
    course: "BS Civil Engineering",
    year: "3rd year",
    track: "Academic",
    gwa: 91.0,
    applied: "Jun 11, 2026",
    stage: "Interview",
  },
  {
    id: 6,
    name: "Anna Dimaculangan",
    initials: "AD",
    course: "BS Education",
    year: "2nd year",
    track: "Financial Need",
    gwa: 89.3,
    applied: "Jun 19, 2026",
    stage: "Under review",
  },
  {
    id: 7,
    name: "Kevin Tan",
    initials: "KT",
    course: "BS Information Technology",
    year: "1st year",
    track: "Academic",
    gwa: 87.8,
    applied: "Jun 21, 2026",
    stage: "Submitted",
  },
  {
    id: 8,
    name: "Patricia Lim",
    initials: "PL",
    course: "BS Accountancy",
    year: "3rd year",
    track: "Returning Scholar",
    gwa: 93.4,
    applied: "Jun 8, 2026",
    stage: "Accepted",
  },
  {
    id: 9,
    name: "Miguel Santos",
    initials: "MS",
    course: "BS Civil Engineering",
    year: "4th year",
    track: "Academic",
    gwa: 86.2,
    applied: "Jun 22, 2026",
    stage: "Rejected",
  },
  {
    id: 10,
    name: "Bea Hernandez",
    initials: "BH",
    course: "BS Nursing",
    year: "2nd year",
    track: "Financial Need",
    gwa: 90.7,
    applied: "Jun 17, 2026",
    stage: "Interview",
  },
  {
    id: 11,
    name: "Ryan Cruz",
    initials: "RC",
    course: "BS Computer Science",
    year: "3rd year",
    track: "Academic",
    gwa: 91.9,
    applied: "Jun 13, 2026",
    stage: "Under review",
  },
  {
    id: 12,
    name: "Sofia Ramirez",
    initials: "SR",
    course: "BS Education",
    year: "1st year",
    track: "Financial Need",
    gwa: 88.0,
    applied: "Jun 23, 2026",
    stage: "Submitted",
  },
];

export const STAGE_COLORS: Record<Stage, { bg: string; text: string }> = {
  Submitted: { bg: TINT, text: "#6b6b66" },
  "Under review": { bg: WARN_BG, text: WARN },
  Interview: { bg: AMBER_BG, text: "#7A5C0A" },
  Endorsed: { bg: AMBER_BG, text: "#7A5C0A" },
  Accepted: { bg: GOOD_BG, text: GOOD },
  Rejected: { bg: BAD_BG, text: BAD },
};

export const UPCOMING_INTERVIEWS: ScheduledInterview[] = [
  { id: 1, name: "Donna Mae Fayloga", initials: "DF", date: "Jun 26, 2026", time: "10:30 AM" },
  { id: 5, name: "Carlo Bautista", initials: "CB", date: "Jun 27, 2026", time: "1:00 PM" },
];

export interface PipelineCount {
  label: string;
  value: number;
  tone: "neutral" | "warn" | "amber" | "good";
  kpi: string;
  kpiDirection: "up" | "down";
}

export const PIPELINE_COUNTS: PipelineCount[] = [
  {
    label: "Submitted",
    value: APPLICANTS.filter((a) => a.stage === "Submitted").length,
    tone: "neutral",
    kpi: "+12%",
    kpiDirection: "up",
  },
  {
    label: "Under review",
    value: APPLICANTS.filter((a) => a.stage === "Under review").length,
    tone: "warn",
    kpi: "+5%",
    kpiDirection: "up",
  },
  {
    label: "Interview",
    value: APPLICANTS.filter((a) => a.stage === "Interview").length,
    tone: "amber",
    kpi: "-8%",
    kpiDirection: "down",
  },
  {
    label: "Accepted",
    value: APPLICANTS.filter((a) => a.stage === "Accepted").length,
    tone: "good",
    kpi: "+20%",
    kpiDirection: "up",
  },
];

export const ACTIVITY_FEED = [
  {
    icon: <CheckCircleIcon small />,
    text: "Mariella S. was moved to Accepted after document verification.",
    time: "20 minutes ago",
  },
  { icon: <PeopleIcon />, text: "3 new applications submitted for the Financial Need track.", time: "1 hour ago" },
  {
    icon: <InterviewIcon />,
    text: "Interview confirmed with Donna Mae Fayloga for Jun 26, 10:30 AM.",
    time: "3 hours ago",
  },
  { icon: <MailIcon small />, text: "Jonas L. replied to your message about his report card.", time: "5 hours ago" },
  { icon: <MonitorIcon />, text: "Patricia Lim's GWA dropped to 93.4% — still above threshold.", time: "Yesterday" },
];

export const ACTIVE_SCHOLARS: ActiveScholar[] = [
  {
    id: 1,
    name: "Mariella S.",
    initials: "MS",
    course: "BS Accountancy, 4th year",
    gwa: 94.2,
    trend: "up",
    docs: "3/3",
    disbursement: "On schedule",
    health: "good",
    currentPayment: { term: "Q3 2026", amount: 8000, status: "Paid" },
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 93.8, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 93.1, status: "Passed" },
      { term: "S.Y. 2024-2025, 1st Sem", gwa: 92.9, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 2,
    name: "Patricia Lim",
    initials: "PL",
    course: "BS Accountancy, 3rd year",
    gwa: 93.4,
    trend: "down",
    docs: "3/3",
    disbursement: "On schedule",
    health: "good",
    currentPayment: { term: "Q3 2026", amount: 8000, status: "Paid" },
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 94.0, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 93.7, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
    ],
  },
  {
    id: 3,
    name: "Jonas L.",
    initials: "JL",
    course: "BS Computer Science, 2nd year",
    gwa: 90.1,
    trend: "down",
    docs: "2/3",
    disbursement: "Pending document",
    health: "warn",
    currentPayment: { term: "Q3 2026", amount: 8000, status: "Pending" },
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 90.9, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 91.5, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
    ],
  },
  {
    id: 4,
    name: "Donna Mae Fayloga",
    initials: "DF",
    course: "BS Information Technology, 3rd year",
    gwa: 92.6,
    trend: "up",
    docs: "3/3",
    disbursement: "On schedule",
    health: "good",
    currentPayment: { term: "Q3 2026", amount: 8000, status: "Paid" },
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 91.4, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 90.8, status: "Passed" },
      { term: "S.Y. 2024-2025, 1st Sem", gwa: 90.2, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 5,
    name: "Carlo Bautista",
    initials: "CB",
    course: "BS Civil Engineering, 3rd year",
    gwa: 88.9,
    trend: "down",
    docs: "1/3",
    disbursement: "On hold",
    health: "bad",
    currentPayment: { term: "Q3 2026", amount: 8000, status: "On hold" },
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 89.6, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 87.3, status: "Incomplete" },
      { term: "S.Y. 2024-2025, 1st Sem", gwa: 90.0, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
];

export const GRADE_STATUS_COLORS: Record<GradeRecord["status"], { bg: string; text: string }> = {
  Passed: { bg: GOOD_BG, text: GOOD },
  Incomplete: { bg: WARN_BG, text: WARN },
  Failed: { bg: BAD_BG, text: BAD },
};

export const PAYMENT_STATUS_COLORS: Record<
  PaymentRecord["status"] | HistoryPaymentRecord["status"],
  { bg: string; text: string }
> = {
  Paid: { bg: GOOD_BG, text: GOOD },
  Settled: { bg: GOOD_BG, text: GOOD },
  Scheduled: { bg: AMBER_BG, text: "#7A5C0A" },
  Pending: { bg: WARN_BG, text: WARN },
  "On hold": { bg: BAD_BG, text: BAD },
};

export const PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 1,
    name: "Mariella S.",
    initials: "MS",
    course: "BS Accountancy, 4th year",
    amount: 8000,
    term: "Q3 2026",
    scheduledDate: "Jul 15, 2026",
    status: "Scheduled",
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 2,
    name: "Patricia Lim",
    initials: "PL",
    course: "BS Accountancy, 3rd year",
    amount: 8000,
    term: "Q3 2026",
    scheduledDate: "Jul 15, 2026",
    status: "Scheduled",
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
    ],
  },
  {
    id: 3,
    name: "Jonas L.",
    initials: "JL",
    course: "BS Computer Science, 2nd year",
    amount: 8000,
    term: "Q3 2026",
    scheduledDate: "Jul 15, 2026",
    status: "On hold",
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
    ],
  },
  {
    id: 4,
    name: "Donna Mae Fayloga",
    initials: "DF",
    course: "BS Information Technology, 3rd year",
    amount: 8000,
    term: "Q3 2026",
    scheduledDate: "Jul 15, 2026",
    status: "Paid",
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 5,
    name: "Carlo Bautista",
    initials: "CB",
    course: "BS Civil Engineering, 3rd year",
    amount: 8000,
    term: "Q3 2026",
    scheduledDate: "Jul 15, 2026",
    status: "On hold",
    paymentHistory: [
      { term: "Q2 2026", amount: 8000, date: "Apr 15, 2026", status: "Paid" },
      { term: "Q1 2026", amount: 8000, date: "Jan 15, 2026", status: "Paid" },
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
    ],
  },
];

export const ARCHIVED_SCHOLARS: ArchivedScholar[] = [
  {
    id: 1,
    name: "Therese Aguilar",
    initials: "TA",
    course: "BS Accountancy",
    track: "Academic",
    joined: "Jun 2022",
    exited: "May 2026",
    status: "Graduated",
    note: "Completed degree with honors. Eligible for alumni mentorship program.",
    gradeHistory: [
      { term: "S.Y. 2025-2026, 2nd Sem", gwa: 95.1, status: "Passed" },
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 94.6, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 94.0, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
      { term: "Q3 2025", amount: 8000, date: "Jul 15, 2025", status: "Paid" },
      { term: "Q2 2025", amount: 8000, date: "Apr 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 2,
    name: "Marco Villanueva",
    initials: "MV",
    course: "BS Civil Engineering",
    track: "Academic",
    joined: "Aug 2023",
    exited: "Feb 2026",
    status: "Terminated",
    note: "Failed to maintain minimum GWA for two consecutive semesters.",
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 82.4, status: "Failed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 83.9, status: "Failed" },
      { term: "S.Y. 2024-2025, 1st Sem", gwa: 87.0, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
      { term: "Q3 2025", amount: 8000, date: "Jul 15, 2025", status: "On hold" },
    ],
  },
  {
    id: 3,
    name: "Kristine Ong",
    initials: "KO",
    course: "BS Nursing",
    track: "Financial Need",
    joined: "Jul 2021",
    exited: "Apr 2026",
    status: "Graduated",
    note: "Completed degree. Now employed at Davao Medical Center.",
    gradeHistory: [
      { term: "S.Y. 2025-2026, 2nd Sem", gwa: 91.7, status: "Passed" },
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 90.9, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 89.8, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "Paid" },
      { term: "Q3 2025", amount: 8000, date: "Jul 15, 2025", status: "Paid" },
      { term: "Q2 2025", amount: 8000, date: "Apr 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 4,
    name: "Allan Mercado",
    initials: "AM",
    course: "BS Information Technology",
    track: "Returning Scholar",
    joined: "Jan 2024",
    exited: "Mar 2026",
    status: "Withdrawn",
    note: "Voluntarily withdrew due to transfer to another university.",
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 88.3, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 87.9, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q3 2025", amount: 8000, date: "Jul 15, 2025", status: "Paid" },
      { term: "Q2 2025", amount: 8000, date: "Apr 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 5,
    name: "Grace Tolentino",
    initials: "GT",
    course: "BS Education",
    track: "Academic",
    joined: "Jun 2022",
    exited: "Jan 2026",
    status: "Terminated",
    note: "Found to have submitted falsified income documents.",
    gradeHistory: [
      { term: "S.Y. 2025-2026, 1st Sem", gwa: 90.2, status: "Passed" },
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 89.5, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q4 2025", amount: 8000, date: "Oct 15, 2025", status: "On hold" },
      { term: "Q3 2025", amount: 8000, date: "Jul 15, 2025", status: "Paid" },
    ],
  },
  {
    id: 6,
    name: "Paolo Diaz",
    initials: "PD",
    course: "BS Computer Science",
    track: "Academic",
    joined: "Jul 2020",
    exited: "Jun 2025",
    status: "Graduated",
    note: "Completed degree, cum laude. Sponsored thesis on scholarship matching algorithms.",
    gradeHistory: [
      { term: "S.Y. 2024-2025, 2nd Sem", gwa: 96.4, status: "Passed" },
      { term: "S.Y. 2024-2025, 1st Sem", gwa: 96.0, status: "Passed" },
      { term: "S.Y. 2023-2024, 2nd Sem", gwa: 95.2, status: "Passed" },
    ],
    paymentHistory: [
      { term: "Q1 2025", amount: 8000, date: "Jan 15, 2025", status: "Paid" },
      { term: "Q4 2024", amount: 8000, date: "Oct 15, 2024", status: "Paid" },
      { term: "Q3 2024", amount: 8000, date: "Jul 15, 2024", status: "Paid" },
    ],
  },
];

export const ARCHIVE_STATUS_STYLE: Record<ArchivedScholar["status"], { bg: string; text: string }> = {
  Graduated: { bg: GOOD_BG, text: GOOD },
  Terminated: { bg: BAD_BG, text: BAD },
  Withdrawn: { bg: WARN_BG, text: WARN },
};

export const REPORT_KPIS = [
  { label: "Total applicants", value: APPLICANTS.length, kpi: "+15%", kpiDirection: "up" as const },
  { label: "Acceptance rate", value: "33%", kpi: "+4%", kpiDirection: "up" as const },
  { label: "Avg. review time", value: "6.2 days", kpi: "-1.1 days", kpiDirection: "up" as const },
  { label: "Active scholars", value: ACTIVE_SCHOLARS.length, kpi: "+2", kpiDirection: "up" as const },
];

export const TRACK_BREAKDOWN = [
  { track: "Academic", count: APPLICANTS.filter((a) => a.track === "Academic").length, color: NAVY },
  { track: "Financial Need", count: APPLICANTS.filter((a) => a.track === "Financial Need").length, color: AMBER },
  {
    track: "Returning Scholar",
    count: APPLICANTS.filter((a) => a.track === "Returning Scholar").length,
    color: "#4F9873",
  },
];

export const MONTHLY_APPLICATIONS = [
  { month: "Feb", count: 18 },
  { month: "Mar", count: 24 },
  { month: "Apr", count: 21 },
  { month: "May", count: 29 },
  { month: "Jun", count: 35 },
];

export const STAGE_FUNNEL = [
  { stage: "Submitted", count: APPLICANTS.length },
  { stage: "Under review", count: APPLICANTS.filter((a) => a.stage !== "Submitted").length },
  {
    stage: "Interview",
    count: APPLICANTS.filter((a) => ["Interview", "Accepted", "Rejected"].includes(a.stage)).length,
  },
  { stage: "Accepted", count: APPLICANTS.filter((a) => a.stage === "Accepted").length },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "donna",
    name: "Donna Mae Fayloga",
    role: "Applicant · Academic Track",
    initials: "DF",
    lastMessage: "Noted po, thank you! One more thing — can I still update my address on file?",
    time: "12m ago",
    unread: 2,
    messages: [
      { from: "me", text: "Hi Donna! Just confirming — your Q3 allowance is set for Jul 15.", time: "10:02 AM" },
      {
        from: "them",
        text: "Hi sir Paolo, thank you for confirming! Is that the same amount as last quarter?",
        time: "10:05 AM",
      },
      {
        from: "me",
        text: "Yes, same amount, ₱8,000. It should reflect in your registered bank account.",
        time: "10:07 AM",
      },
      {
        from: "them",
        text: "Noted po, thank you! One more thing — can I still update my address on file?",
        time: "10:09 AM",
      },
    ],
  },
  {
    id: "jonas",
    name: "Jonas L.",
    role: "Active scholar · Computer Science",
    initials: "JL",
    lastMessage: "I'll upload the missing requirement by tomorrow, sir.",
    time: "1h ago",
    unread: 1,
    messages: [
      { from: "me", text: "Hi Jonas, your employment proof document is still missing on file.", time: "9:10 AM" },
      { from: "them", text: "Sorry po, I'll upload the missing requirement by tomorrow, sir.", time: "9:42 AM" },
    ],
  },
  {
    id: "carlo",
    name: "Carlo Bautista",
    role: "Applicant · Academic Track",
    initials: "CB",
    lastMessage: "Thank you, see you on the call!",
    time: "Yesterday",
    unread: 0,
    messages: [
      {
        from: "me",
        text: "Hi Carlo, your interview is confirmed for Jun 27, 1:00 PM via video call.",
        time: "Yesterday, 2:00 PM",
      },
      { from: "them", text: "Thank you, see you on the call!", time: "Yesterday, 2:11 PM" },
    ],
  },
];

export const TONE_MAP: Record<PipelineCount["tone"], { bg: string; text: string }> = {
  neutral: { bg: TINT, text: "#6b6b66" },
  warn: { bg: WARN_BG, text: WARN },
  amber: { bg: AMBER_BG, text: "#7A5C0A" },
  good: { bg: GOOD_BG, text: GOOD },
};

export const HEALTH_TAG: Record<ActiveScholar["health"], { bg: string; text: string; label: string }> = {
  good: { bg: GOOD_BG, text: GOOD, label: "On track" },
  warn: { bg: WARN_BG, text: WARN, label: "Needs attention" },
  bad: { bg: BAD_BG, text: BAD, label: "Action required" },
};

export const TITLES: Record<string, [string, string]> = {
  "/coorDashboard": ["Good morning, Paolo.", "Here's what's happening across your pipeline today."],
  "/coorApplicants": ["Applicants", "Everyone who has applied to ViaScholar."],
  "/coorMeeting": ["Meeting", "Schedule interviews for applicants who passed review."],
  "/coorMonitor": ["Monitor", "Active scholars and their current standing."],
  "/coorPayment": ["Payment", "Track and manage scholar disbursements."],
  "/coorArchive": ["Archive", "Scholars who are no longer active in the program."],
  "/coorReports": ["Reports", "Pipeline performance and applicant analytics."],
  "/coorMessage": ["Messages", "Conversations with applicants and scholars."],
  "/coorSettings": ["Settings", "Manage your notifications and security."],
  "/coorProfile": ["Profile", "Your coordinator profile and activity."],
};

// ============================================================
// SHARED SMALL COMPONENTS
// ============================================================

export interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, required, children }: FieldProps) {
  return (
    <div style={s.fieldWrap}>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: generic Field wrapper — the control is the children passed at each call site */}
      <label style={s.fieldLabel}>
        {label} {required && <span style={{ color: AMBER }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...s.tabButton, color: active ? NAVY : "#8a8a84", borderBottomColor: active ? AMBER : "transparent" }}
    >
      {children}
    </button>
  );
}

export interface DrawerInfoRowProps {
  label: string;
  value: string;
}

export function DrawerInfoRow({ label, value }: DrawerInfoRowProps) {
  return (
    <div>
      <p style={s.drawerInfoLabel}>{label}</p>
      <p style={s.drawerInfoValue}>{value}</p>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

export const s: Record<string, CSSProperties> = {
  // SIDEBAR
  sidebar: {
    width: 252,
    flexShrink: 0,
    background: WHITE,
    borderRight: `1px solid ${LINE}`,
    display: "flex",
    flexDirection: "column",
    padding: "26px 18px",
    height: "100vh",
    position: "sticky",
    top: 0,
    overflowY: "auto",
  },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 },
  sidebarLogoMark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sidebarLogoText: { fontFamily: "'Inter', sans-serif", fontSize: "1.15rem", fontWeight: 700, color: NAVY },
  sidebarNav: { display: "flex", flexDirection: "column", gap: 4, flexGrow: 1 },
  sidebarNavItem: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "12px 14px",
    borderRadius: 11,
    fontSize: "0.95rem",
    fontWeight: 600,
    width: "100%",
    textAlign: "left",
  },
  sidebarNavIcon: { display: "flex", flexShrink: 0 },
  sidebarNavLabel: { flexGrow: 1 },
  sidebarBadge: {
    background: AMBER,
    color: WHITE,
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
  },
  sidebarUserCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: `1px solid ${LINE}`,
    paddingTop: 18,
    marginTop: 12,
  },
  sidebarAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: AMBER_BG,
    color: "#7A5C0A",
    fontWeight: 700,
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sidebarUserInfo: { flexGrow: 1, minWidth: 0 },
  sidebarUserName: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: NAVY,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sidebarUserRole: { fontSize: "0.76rem", color: "#8a8a84" },
  sidebarLogoutBtn: { color: "#9a9a94", display: "flex", flexShrink: 0, padding: 6 },

  main: { flexGrow: 1, minWidth: 0, minHeight: "100vh", display: "flex", flexDirection: "column" as const },
  mainContent: { padding: "0 40px 48px", flexGrow: 1 },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    background: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: "14px 32px",
    borderBottom: `1px solid ${LINE}`,
  },
  mobileToggle: { display: "none", marginRight: 8 },
  topbarGreeting: { fontSize: "1.22rem", fontWeight: 700, color: NAVY, marginBottom: 2, lineHeight: 1.2 },
  topbarSub: { fontSize: "0.82rem", color: "#7a7a74" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: TINT,
    border: `1px solid ${LINE}`,
    borderRadius: 999,
    padding: "7px 14px",
    width: 198,
  },
  searchInput: { background: "none", fontSize: "0.82rem", color: "#2B2B28", width: "100%", outline: "none" },
  bellBtn: {
    position: "relative",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: TINT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: AMBER,
    border: `2px solid ${TINT}`,
  },

  pageWrap: { maxWidth: 900, marginTop: 28 },
  pageContentTop: { marginTop: 28 },
  pageHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  pageHeading: { fontSize: "1.8rem", fontWeight: 700, color: NAVY, marginBottom: 6 },
  pageSub: { fontSize: "0.96rem", color: "#7a7a74", marginBottom: 24 },

  statRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, margin: "28px 0" },

  // ---- Summary cards (icon box + label + value), used on the Payment page ----
  summaryCard: {
    background: WHITE,
    border: BORDER_SUBTLE,
    borderRadius: 18,
    padding: "22px 24px",
    boxShadow: SHADOW_SM,
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },
  summaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryLabel: { fontSize: "0.8rem", color: "#7a7a74", fontWeight: 500, marginBottom: 4 },
  summaryValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: NAVY,
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  },

  pipelineCard: { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: "20px 22px" },
  pipelineTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  pipelineLabel: { fontSize: "0.84rem", color: "#7a7a74", marginBottom: 8 },
  pipelineValue: { fontFamily: "'Inter', sans-serif", fontSize: "2.1rem", fontWeight: 700, color: NAVY, lineHeight: 1 },
  pipelineTag: { fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999 },
  pipelineKpiRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderTop: `1px solid ${LINE}`,
    paddingTop: 12,
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  pipelineKpiLabel: { color: "#9a9a94", fontWeight: 500 },

  contentGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22 },
  feedCard: { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: "26px 28px" },
  cardHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  cardHeading: { fontSize: "1.25rem", fontWeight: 700, color: NAVY },
  viewAllBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.86rem", fontWeight: 600, color: AMBER },
  feedList: { display: "flex", flexDirection: "column" },
  feedRow: { display: "flex", gap: 14, padding: "16px 0" },
  feedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: TINT,
    color: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  feedTextCol: { flexGrow: 1 },
  feedText: { fontSize: "0.92rem", color: "#2B2B28", lineHeight: 1.5, marginBottom: 4 },
  feedTime: { fontSize: "0.78rem", color: "#9a9a94" },

  upcomingCard: { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: "26px 28px" },
  upcomingList: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 26 },
  upcomingRow: { display: "flex", gap: 12, alignItems: "center" },
  upcomingLabel: { fontSize: "0.9rem", fontWeight: 600, color: NAVY, marginBottom: 2 },
  upcomingDetail: { fontSize: "0.8rem", color: "#8a8a84" },
  quickLinksWrap: { borderTop: `1px solid ${LINE}`, paddingTop: 20, display: "flex", flexDirection: "column", gap: 6 },
  quickLinksHeading: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#9a9a94",
    marginBottom: 8,
  },
  quickLinkBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 10,
    fontSize: "0.88rem",
    color: "#3a3a36",
    width: "100%",
  },
  quickLinkIcon: { color: "#8a8a84", display: "flex" },

  filterRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 },
  filterChip: { border: "1px solid", borderRadius: 999, padding: "8px 16px", fontSize: "0.86rem", fontWeight: 600 },
  filterChipCount: { opacity: 0.65, fontWeight: 500 },

  tableWrap: { background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: "8px 8px", marginBottom: 8 },

  // ---- Table header row: "X total ___" count + filter dropdown ----
  tableHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "6px 14px 18px",
  },
  tableHeaderCount: { fontSize: "0.94rem", color: "#55554f" },
  tableFilterSelect: {
    appearance: "none",
    WebkitAppearance: "none",
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 999,
    padding: "9px 34px 9px 16px",
    fontSize: "0.86rem",
    fontWeight: 600,
    color: "#2B2B28",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
  },
  tableFilterWrap: { position: "relative", display: "inline-flex", alignItems: "center" },
  tableFilterChevron: {
    position: "absolute",
    right: 14,
    pointerEvents: "none",
    color: "#8a8a84",
    display: "flex",
  },

  // ---- Flat status pill: solid for the positive state, outline for the rest ----
  statusPillSolid: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "7px 16px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    background: NAVY,
    color: WHITE,
    display: "inline-block",
  },
  statusPillOutline: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "6.5px 15px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    background: WHITE,
    border: `1.3px solid ${LINE}`,
    color: "#55554f",
    display: "inline-block",
  },
  statusPillOutlineWarn: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "6.5px 15px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    background: WARN_BG,
    border: `1.3px solid ${WARN}`,
    color: WARN,
    display: "inline-block",
  },
  statusPillOutlineBad: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "6.5px 15px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    background: BAD_BG,
    border: `1.3px solid ${BAD}`,
    color: BAD,
    display: "inline-block",
  },

  // ---- Borderless eye/view icon button (no circle background) ----
  viewIconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#55554f",
    padding: 6,
    background: "none",
    border: "none",
  },
  th: {
    textAlign: "left",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#9a9a94",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "14px 18px",
    borderBottom: `1px solid ${LINE}`,
  },
  tr: { borderBottom: `1px solid ${LINE}` },
  td: { padding: "16px 18px", fontSize: "0.9rem", color: "#2B2B28" },
  tdNameRow: { display: "flex", alignItems: "center", gap: 12 },
  tdName: { fontSize: "0.92rem", fontWeight: 700, color: NAVY },
  tdSub: { fontSize: "0.78rem", color: "#9a9a94" },
  // Small initials avatar shown next to the scholar name in table rows.
  tdAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: AMBER_BG,
    color: "#7A5C0A",
    fontWeight: 700,
    fontSize: "0.78rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stageTag: { fontSize: "0.76rem", fontWeight: 700, padding: "6px 13px", borderRadius: 999, whiteSpace: "nowrap" },
  tableActionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: TINT,
    color: NAVY,
    fontWeight: 600,
    fontSize: "0.82rem",
    padding: "7px 14px",
    borderRadius: 999,
    width: "100%",
  },
  gwaTrendCell: { display: "inline-flex", alignItems: "center", gap: 6 },

  // ---- Drawer overlay/panel: blurred backdrop, right-slide panel ----
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,20,35,0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 200,
  },
  drawerPanel: {
    width: 460,
    maxWidth: "92vw",
    background: WHITE,
    height: "100%",
    overflowY: "auto",
    boxShadow: "-24px 0 60px -12px rgba(10,20,35,0.35)",
  },

  // ---- Drawer hero header (gradient banner + avatar + status pill) ----
  drawerHero: {
    background: "linear-gradient(135deg, #0a4f42 0%, #14283F 100%)",
    padding: "30px 28px 32px",
    position: "relative",
    color: WHITE,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  drawerHeroTopRow: { display: "flex", justifyContent: "flex-end", marginBottom: 16 },
  drawerHeroCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.16)",
    color: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  drawerHeroAvatar: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.16)",
    border: "3px solid rgba(255,255,255,0.35)",
    color: WHITE,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "1.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  drawerHeroName: { fontSize: "1.32rem", fontWeight: 700, color: WHITE, marginBottom: 4 },
  drawerHeroMeta: { fontSize: "0.85rem", color: "rgba(255,255,255,0.72)", marginBottom: 14 },
  drawerHeroStatusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: "0.78rem",
    fontWeight: 700,
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    color: WHITE,
  },

  drawerBody: { padding: "24px 28px 30px" },

  // ---- Stat card grid (GWA, docs, disbursement, trend) ----
  drawerStatGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  drawerStatCard: {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    padding: "15px 16px",
    boxShadow: SHADOW_SM,
  },
  drawerStatIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: TINT,
    color: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  drawerStatLabel: { fontSize: "0.72rem", color: "#9a9a94", marginBottom: 3 },
  drawerStatValue: {
    fontSize: "1.02rem",
    fontWeight: 700,
    color: NAVY,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  drawerInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
    background: TINT,
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 26,
  },
  drawerInfoLabel: { fontSize: "0.74rem", color: "#9a9a94", marginBottom: 3 },
  drawerInfoValue: { fontSize: "0.94rem", fontWeight: 700, color: NAVY },
  drawerSectionLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#9a9a94",
    marginBottom: 12,
  },
  drawerDocList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 },
  drawerDocRow: { display: "flex", alignItems: "center", gap: 10, color: GOOD },
  drawerDocText: { flexGrow: 1, fontSize: "0.88rem", color: "#2B2B28" },
  drawerStageActions: { display: "flex", flexDirection: "column", gap: 10 },
  rejectBtn: {
    background: BAD_BG,
    color: BAD,
    fontWeight: 600,
    fontSize: "0.88rem",
    padding: "12px 20px",
    borderRadius: 999,
    textAlign: "center",
  },

  modalCard: {
    background: WHITE,
    borderRadius: 18,
    padding: "30px 32px",
    width: 460,
    maxWidth: "90vw",
    alignSelf: "center",
    margin: "auto",
  },
  modalActionsRow: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: { display: "block", fontSize: "0.9rem", fontWeight: 600, color: NAVY, marginBottom: 8 },
  fieldRow2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 },
  input: {
    width: "100%",
    background: "#FAF7EF",
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    padding: "12px 15px",
    fontSize: "0.94rem",
    color: "#2B2B28",
    fontFamily: "'Inter', sans-serif",
  },
  select: {
    width: "100%",
    background: "#FAF7EF",
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    padding: "12px 15px",
    fontSize: "0.94rem",
    color: "#2B2B28",
    fontFamily: "'Inter', sans-serif",
  },
  continueBtn: {
    background: NAVY,
    color: WHITE,
    borderRadius: 999,
    padding: "14px 26px",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  continueBtnSmall: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: NAVY,
    color: WHITE,
    borderRadius: 999,
    padding: "10px 18px",
    fontWeight: 600,
    fontSize: "0.88rem",
    flexShrink: 0,
  },
  backBtn: {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 999,
    padding: "12px 22px",
    fontWeight: 600,
    fontSize: "0.9rem",
    color: NAVY,
  },
  reviewEditLink: { background: "none", color: AMBER, fontWeight: 700, fontSize: "0.86rem" },
  tabRow: { display: "flex", gap: 24, borderBottom: `1px solid ${LINE}`, marginBottom: 24 },
  tabButton: {
    padding: "10px 2px 14px",
    fontWeight: 600,
    fontSize: "0.94rem",
    borderBottom: "2.5px solid transparent",
  },

  meetingList: { display: "flex", flexDirection: "column", gap: 12 },
  meetingCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "16px 20px",
  },
  meetingDateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: TINT,
    borderRadius: 12,
    padding: "10px 14px",
    minWidth: 64,
    flexShrink: 0,
  },
  meetingDateMonth: { fontSize: "0.72rem", fontWeight: 700, color: AMBER, textTransform: "uppercase" },
  meetingDateDay: { fontSize: "1.2rem", fontWeight: 700, color: NAVY },
  meetingInfoCol: { flexGrow: 1, minWidth: 0 },
  meetingTitle: { fontSize: "0.98rem", fontWeight: 700, color: NAVY, marginBottom: 3 },
  meetingMeta: { fontSize: "0.84rem", color: "#7a7a74" },
  meetingStatusTag: {
    fontSize: "0.76rem",
    fontWeight: 700,
    padding: "6px 13px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  joinMeetingBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: AMBER,
    color: WHITE,
    borderRadius: 999,
    padding: "9px 16px",
    fontWeight: 600,
    fontSize: "0.86rem",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  messagesShell: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 0,
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 18,
    overflow: "hidden",
    height: 600,
  },
  convoListCol: { borderRight: `1px solid ${LINE}`, overflowY: "auto" },
  convoListItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    width: "100%",
    padding: "16px 18px",
    textAlign: "left",
    position: "relative",
  },
  convoAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: AMBER_BG,
    color: "#7A5C0A",
    fontWeight: 700,
    fontSize: "0.84rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  convoListTextCol: { flexGrow: 1, minWidth: 0 },
  convoListTopRow: { display: "flex", justifyContent: "space-between", marginBottom: 3 },
  convoListName: { fontSize: "0.9rem", fontWeight: 700, color: NAVY },
  convoListTime: { fontSize: "0.74rem", color: "#9a9a94" },
  convoListPreview: {
    fontSize: "0.82rem",
    color: "#7a7a74",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  convoUnreadDot: {
    position: "absolute",
    top: 16,
    right: 14,
    background: AMBER,
    color: WHITE,
    fontSize: "0.7rem",
    fontWeight: 700,
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  convoThreadCol: { display: "flex", flexDirection: "column" },
  convoThreadHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: "16px 22px",
    borderBottom: `1px solid ${LINE}`,
  },
  convoThreadName: { fontSize: "0.96rem", fontWeight: 700, color: NAVY },
  convoThreadRole: { fontSize: "0.78rem", color: "#9a9a94" },
  convoThreadBody: { flexGrow: 1, padding: "20px 22px", overflowY: "auto" },
  bubbleMine: {
    background: NAVY,
    color: WHITE,
    borderRadius: "14px 14px 4px 14px",
    padding: "11px 16px",
    fontSize: "0.9rem",
    maxWidth: 360,
    lineHeight: 1.5,
  },
  bubbleTheirs: {
    background: TINT,
    color: "#2B2B28",
    borderRadius: "14px 14px 14px 4px",
    padding: "11px 16px",
    fontSize: "0.9rem",
    maxWidth: 360,
    lineHeight: 1.5,
  },
  bubbleTime: { fontSize: "0.7rem", color: "#9a9a94", marginTop: 4 },
  convoComposer: { display: "flex", gap: 10, padding: "16px 22px", borderTop: `1px solid ${LINE}` },
  convoInput: {
    flexGrow: 1,
    background: "#FAF7EF",
    border: `1px solid ${LINE}`,
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: "0.9rem",
  },
  convoSendBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: NAVY,
    color: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  settingsSection: {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "24px 26px",
    marginBottom: 18,
  },
  settingsSectionTitle: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 },
  settingsRowList: { display: "flex", flexDirection: "column", gap: 18 },
  settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 },
  settingsRowLabel: { fontSize: "0.94rem", fontWeight: 600, color: NAVY, marginBottom: 2 },
  settingsRowDesc: { fontSize: "0.82rem", color: "#8a8a84" },
  settingsActionBtn: {
    background: TINT,
    color: NAVY,
    fontWeight: 600,
    fontSize: "0.86rem",
    padding: "9px 16px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  settingsDangerBtn: {
    background: BAD_BG,
    color: BAD,
    fontWeight: 600,
    fontSize: "0.86rem",
    padding: "9px 16px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },

  profileBanner: { height: 160, borderRadius: 18, position: "relative" },
  profileBannerEditBtn: {
    position: "absolute",
    bottom: 14,
    right: 16,
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(0,0,0,0.35)",
    color: WHITE,
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 999,
    backdropFilter: "blur(4px)",
  },
  profileHeaderRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 18,
    padding: "0 8px",
    marginTop: -36,
    marginBottom: 20,
  },
  profileAvatarWrap: { position: "relative", flexShrink: 0 },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    border: `4px solid ${WHITE}`,
    color: "#7A5C0A",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "1.8rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: AMBER_BG,
  },
  profileAvatarEditBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `2px solid ${WHITE}`,
  },
  profileHeaderInfo: { flexGrow: 1, paddingBottom: 6 },
  profileName: { fontSize: "1.5rem", fontWeight: 700, color: NAVY, marginBottom: 2 },
  profileMeta: { fontSize: "0.9rem", color: "#7a7a74" },
  profileBioCard: {
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "20px 22px",
    marginBottom: 24,
  },
  profileBioHeader: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  profileBioLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#9a9a94",
  },
  profileBioText: { fontSize: "0.94rem", color: "#2B2B28", lineHeight: 1.6 },
  profileDocDownload: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: TINT,
    color: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  appNoteCard: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    background: "#FCEEC4",
    border: "1px solid #F1B71E",
    borderRadius: 14,
    padding: "18px 20px",
    marginBottom: 20,
  },
  appNoteIcon: { color: AMBER, display: "flex", flexShrink: 0, marginTop: 2 },
  appNoteText: { fontSize: "0.92rem", color: "#3a3a36", lineHeight: 1.6 },

  // ---- Payment card (redesigned, gradient) ----
  drawerPayCardNew: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    padding: "20px 22px",
    marginBottom: 22,
    background: "linear-gradient(135deg,#0a4f42 0%,#0d6f5c 100%)",
    color: WHITE,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },
  drawerPayCardTerm: {
    fontSize: "0.72rem",
    color: "rgba(255,255,255,0.72)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },
  drawerPayCardAmount: { fontSize: "1.55rem", fontWeight: 700, color: WHITE, fontFamily: "'Inter', sans-serif" },

  // ---- Legacy flat payment card (kept for compatibility) ----
  drawerCurrentPayCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 26,
  },
  drawerCurrentPayLeft: { display: "flex", flexDirection: "column", gap: 3 },
  drawerCurrentPayTerm: { fontSize: "0.78rem", color: "#9a9a94" },
  drawerCurrentPayAmount: { fontSize: "1.15rem", fontWeight: 700, color: NAVY, fontFamily: "'Inter', sans-serif" },
  drawerHistoryBtnRow: { display: "flex", marginBottom: 22 },
  drawerHistoryBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: TINT,
    color: NAVY,
    fontWeight: 600,
    fontSize: "0.86rem",
    padding: "10px 16px",
    borderRadius: 999,
  },
  historySection: { marginBottom: 24 },
  historyList: { display: "flex", flexDirection: "column", gap: 10 },
  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyRowLeft: { display: "flex", flexDirection: "column", gap: 3 },
  historyRowTerm: { fontSize: "0.88rem", fontWeight: 700, color: NAVY },
  historyRowSub: { fontSize: "0.76rem", color: "#9a9a94" },
  historyRowRight: { display: "flex", alignItems: "center", gap: 10 },
  historyRowValue: { fontSize: "0.9rem", fontWeight: 700, color: NAVY },
  backToOverviewBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: AMBER,
    fontWeight: 600,
    fontSize: "0.86rem",
    marginBottom: 20,
  },

  // ---- Timeline-style history rows (dot + connecting line + card) ----
  historyRowNew: { display: "flex", gap: 12 },
  historyDotCol: { display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 },
  historyDot: { width: 10, height: 10, borderRadius: "50%", background: NAVY, marginTop: 8, flexShrink: 0 },
  historyLine: { width: 2, flexGrow: 1, background: LINE, marginTop: 2, minHeight: 16 },
  historyContentCard: {
    flexGrow: 1,
    background: WHITE,
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    padding: "13px 16px",
    marginBottom: 14,
  },

  barChartRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 14,
    height: 160,
    padding: "10px 4px 0",
  },
  barChartCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexGrow: 1, height: "100%" },
  barChartValue: { fontSize: "0.78rem", fontWeight: 700, color: NAVY },
  barChartTrack: { width: "100%", maxWidth: 36, flexGrow: 1, display: "flex", alignItems: "flex-end" },
  barChartFill: { width: "100%", background: AMBER, borderRadius: "6px 6px 0 0", minHeight: 4 },
  barChartLabel: { fontSize: "0.78rem", color: "#9a9a94" },

  funnelList: { display: "flex", flexDirection: "column", gap: 14 },
  funnelRow: { display: "flex", alignItems: "center", gap: 14 },
  funnelLabel: { fontSize: "0.84rem", color: "#55554f", width: 100, flexShrink: 0 },
  funnelTrack: { flexGrow: 1, height: 10, background: TINT, borderRadius: 999, overflow: "hidden" },
  funnelFill: { height: "100%", background: NAVY, borderRadius: 999 },
  funnelValue: { fontSize: "0.84rem", fontWeight: 700, color: NAVY, width: 28, textAlign: "right", flexShrink: 0 },

  trackList: { display: "flex", flexDirection: "column", gap: 18, marginBottom: 26 },
  trackRow: { display: "flex", flexDirection: "column", gap: 8 },
  trackTopRow: { display: "flex", justifyContent: "space-between" },
  trackLabel: { fontSize: "0.88rem", fontWeight: 600, color: NAVY },
  trackCount: { fontSize: "0.88rem", fontWeight: 700, color: NAVY },
  trackTrack: { height: 8, background: TINT, borderRadius: 999, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 999 },
};
