import {
  Archive,
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

export const COORDINATOR_NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      { key: "home", label: "Dashboard", icon: Home, href: "/CoordinatorDashboard" },
      { key: "reports", label: "Analytics", icon: BarChart3, href: "/CoordinatorReports" },
      { key: "message", label: "Messages", icon: Mail, href: "/CoordinatorMessage" },
    ],
  },
  {
    label: "Scholarship Lifecycle",
    items: [
      { key: "applicants", label: "Applicants", icon: Users, href: "/CoordinatorApplicants" },
      { key: "scholars", label: "Scholars", icon: GraduationCap, href: "/CoordinatorMonitor" },
      { key: "payment", label: "Disbursements", icon: CreditCard, href: "/CoordinatorPayment" },
      { key: "meeting", label: "Meetings", icon: Calendar, href: "/CoordinatorMeeting" },
      { key: "archive", label: "Archive", icon: Archive, href: "/CoordinatorArchive" },
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

export const COORDINATOR_NAV_ITEMS: NavItem[] = [
  ...COORDINATOR_NAV_GROUPS.flatMap((group) => group.items),
  { key: "settings", label: "Settings", icon: Settings, href: "/CoordinatorSettings" },
  { key: "profile", label: "Profile", icon: User, href: "/CoordinatorProfile" },
];

export const COORDINATOR_SIDEBAR_CONFIG: RoleSidebarConfig = {
  homeHref: "/CoordinatorDashboard",
  profileHref: "/CoordinatorProfile",
  roleLabel: "Coordinator",
  items: COORDINATOR_NAV_ITEMS,
  groups: COORDINATOR_NAV_GROUPS,
};
