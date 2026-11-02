import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CreditCard,
  GraduationCap,
  Home,
  Mail,
  Settings,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react";
import type { NavItem, RoleSidebarConfig } from "./types";

export const GRANTOR_NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: Home, href: "/grantDashboard" },
  { key: "applicants", label: "Applicants", icon: Users, href: "/grantApplicants" },
  { key: "schools", label: "Schools", icon: Building2, href: "/Schools" },
  { key: "programs", label: "Programs", icon: BookOpen, href: "/AcademicPrograms" },
  { key: "grading-systems", label: "Grading Systems", icon: SlidersHorizontal, href: "/GradingSystems" },
  { key: "meeting", label: "Meeting", icon: Calendar, href: "/grantMeeting" },
  { key: "scholars", label: "Scholars", icon: GraduationCap, href: "/grantMonitor" },
  { key: "reports", label: "Analytics", icon: BarChart3, href: "/grantReports" },
  { key: "message", label: "Message", icon: Mail, href: "/grantMessage" },
  { key: "payments", label: "Disbursements", icon: CreditCard, href: "/grantPayment" },
  { key: "settings", label: "Settings", icon: Settings, href: "/grantSettings" },
  { key: "profile", label: "Profile", icon: User, href: "/grantProfile" },
];

export const GRANTOR_SIDEBAR_CONFIG: RoleSidebarConfig = {
  homeHref: "/grantDashboard",
  profileHref: "/grantProfile",
  roleLabel: "Grantor",
  items: GRANTOR_NAV_ITEMS,
};
