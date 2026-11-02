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
  User,
  Users,
} from "lucide-react";
import type { NavGroup, NavItem, RoleSidebarConfig } from "./types";

export const GRANTOR_NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      { key: "dashboard", label: "Dashboard", icon: Home, href: "/grantDashboard" },
      { key: "reports", label: "Analytics", icon: BarChart3, href: "/grantReports" },
      { key: "message", label: "Messages", icon: Mail, href: "/grantMessage" },
    ],
  },
  {
    label: "Scholarship Lifecycle",
    items: [
      { key: "applicants", label: "Applicants", icon: Users, href: "/grantApplicants" },
      { key: "scholars", label: "Scholars", icon: GraduationCap, href: "/grantMonitor" },
      { key: "payments", label: "Disbursements", icon: CreditCard, href: "/grantPayment" },
      { key: "meeting", label: "Meetings", icon: Calendar, href: "/grantMeeting" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { key: "programs", label: "Programs", icon: BookOpen, href: "/AcademicPrograms" },
      { key: "schools", label: "Schools", icon: Building2, href: "/Schools" },
    ],
  },
];

export const GRANTOR_NAV_ITEMS: NavItem[] = [
  ...GRANTOR_NAV_GROUPS.flatMap((group) => group.items),
  { key: "settings", label: "Settings", icon: Settings, href: "/grantSettings" },
  { key: "profile", label: "Profile", icon: User, href: "/grantProfile" },
];

export const GRANTOR_SIDEBAR_CONFIG: RoleSidebarConfig = {
  homeHref: "/grantDashboard",
  profileHref: "/grantProfile",
  roleLabel: "Grantor",
  items: GRANTOR_NAV_ITEMS,
  groups: GRANTOR_NAV_GROUPS,
};
