import {
  BookOpen,
  Calendar,
  CreditCard,
  FileCheck,
  GraduationCap,
  Home,
  Mail,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import type { NavGroup, NavItem, RoleSidebarConfig } from "./types";

export const SCHOLAR_NAV_GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      {
        key: "dashboard",
        label: "Home",
        icon: Home,
        href: "/scholardashboard",
      },
      {
        key: "message",
        label: "Messages",
        icon: Mail,
        href: "/scholarMessage",
      },
      { key: "forum", label: "Forum", icon: MessageSquare, href: "/SchoForum" },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        key: "enrollment",
        label: "Enrollment",
        icon: FileCheck,
        href: "/scholar-enrollment",
      },
      {
        key: "grade",
        label: "Grades",
        icon: GraduationCap,
        href: "/ScholarGrade",
      },
      {
        key: "prospectus",
        label: "Prospectus",
        icon: BookOpen,
        href: "/scholarProspectus",
      },
    ],
  },
  {
    label: "Scholarship",
    items: [
      {
        key: "payment",
        label: "Disbursements",
        icon: CreditCard,
        href: "/ScholarPayment",
      },
      {
        key: "meeting",
        label: "Meetings",
        icon: Calendar,
        href: "/scholarMeeting",
      },
    ],
  },
];

export const SCHOLAR_NAV_ITEMS: NavItem[] = [
  ...SCHOLAR_NAV_GROUPS.flatMap((group) => group.items),
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    href: "/scholarSettings",
  },
  { key: "profile", label: "Profile", icon: User, href: "/schoProfile" },
];

export const SCHOLAR_SIDEBAR_CONFIG: RoleSidebarConfig = {
  homeHref: "/scholardashboard",
  profileHref: "/schoProfile",
  roleLabel: "Scholar",
  items: SCHOLAR_NAV_ITEMS,
  groups: SCHOLAR_NAV_GROUPS,
};
