import type React from "react";

// One nav item in a role sidebar. `hidden` keeps the route reachable while
// hiding it from the menu — flip it back to re-enable without touching code.
export interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  hidden?: boolean;
}

// Roles served by the unified AppSidebar. Required (no default) so layouts
// must declare their role — an omitted role previously fell back to the
// wrong menu.
export type SidebarRole = "admin" | "applicant" | "coordinator" | "grantor" | "scholar";

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface RoleSidebarConfig {
  homeHref: string;
  profileHref: string;
  roleLabel: string;
  items: NavItem[];
  groups?: NavGroup[];
}
