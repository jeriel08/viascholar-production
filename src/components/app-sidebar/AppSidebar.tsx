"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { ADMIN } from "@/components/Adminshared";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_SIDEBAR_CONFIG } from "./nav-admin";
import { APPLICANT_SIDEBAR_CONFIG } from "./nav-applicant";
import { COORDINATOR_SIDEBAR_CONFIG } from "./nav-coordinator";
import { GRANTOR_SIDEBAR_CONFIG } from "./nav-grantor";
import { SCHOLAR_SIDEBAR_CONFIG } from "./nav-scholar";
import type { SidebarRole } from "./types";
import { useStaffBadges } from "./useStaffBadges";

const ROLE_CONFIG = {
  admin: ADMIN_SIDEBAR_CONFIG,
  applicant: APPLICANT_SIDEBAR_CONFIG,
  coordinator: COORDINATOR_SIDEBAR_CONFIG,
  grantor: GRANTOR_SIDEBAR_CONFIG,
  scholar: SCHOLAR_SIDEBAR_CONFIG,
} as const;

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || ADMIN.initials || "RC";
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  // Required on purpose: layouts must declare their role so the correct
  // menu renders. There is no default — a forgotten role previously fell
  // back to the wrong menu.
  role: SidebarRole;
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const config = ROLE_CONFIG[role];
  const isStaffRole = role === "admin" || role === "coordinator" || role === "grantor";
  const badges = useStaffBadges({ includeApplicants: isStaffRole, role });

  // On phones the sidebar opens as a sheet; close it after navigating.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger on purpose
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const displayName = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const displayInitials = user ? getInitials(user.first_name, user.last_name) : "G";

  const isFooterItem = (key: string) => key === "settings" || key === "profile";
  const mainItems = config.items.filter((item) => !item.hidden && !isFooterItem(item.key));
  const footerNavItems = config.items.filter((item) => !item.hidden && isFooterItem(item.key));

  const getItemBadge = (item: { key: string; badge?: string | number }) => {
    if (item.key === "applicants") return badges.applicants;
    if (item.key === "meeting") return badges.meetings;
    if (item.key === "scholars" || item.key === "monitor") return badges.scholars;
    if (item.key === "disbursements" || item.key === "payments" || item.key === "payment") return badges.disbursements;
    return item.badge;
  };

  const renderMenuItem = (item: {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
    hidden?: boolean;
  }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== config.homeHref && pathname.startsWith(item.href));
    const itemBadge = getItemBadge(item);

    return (
      <SidebarMenuItem
        key={item.key}
        className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
      >
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className={`h-9.5 rounded-lg px-2.5 text-[0.92rem] font-medium transition-all duration-150 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center ${
            isActive
              ? "bg-amber! text-navy! data-[active=true]:bg-amber! data-[active=true]:text-white! hover:bg-amber! hover:text-navy! [--sidebar-accent:var(--amber)] [--sidebar-accent-foreground:var(--navy)] font-semibold shadow-xs"
              : "text-white/80 hover:bg-white/10! hover:text-white!"
          }`}
        >
          <Link
            href={item.href}
            className="flex h-full w-full items-center justify-start gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
          >
            <Icon
              className={`size-4.5 shrink-0 transition-colors my-auto ${isActive ? "text-white!" : "text-white/80"}`}
            />
            <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
          </Link>
        </SidebarMenuButton>
        {itemBadge !== undefined && (
          <SidebarMenuBadge
            className={`top-1/2! right-2! -translate-y-1/2 font-bold text-[0.7rem] px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden transition-colors ${
              itemBadge === "!"
                ? "bg-amber-400! text-navy! font-black! animate-pulse shadow-xs"
                : isActive
                  ? "bg-navy! text-white/80!"
                  : "bg-amber text-navy"
            }`}
          >
            {itemBadge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/10 bg-navy text-white [--sidebar:var(--navy)] [--sidebar-foreground:#ffffff] [--sidebar-border:rgba(255,255,255,0.1)] **:data-[slot=sidebar-inner]:bg-navy **:data-[slot=sidebar-container]:bg-navy **:data-[mobile=true]:bg-navy"
      {...props}
    >
      {/*
        The navy look lives on this wrapper (not only on <Sidebar>) on purpose:
        on phones the sidebar renders inside a Sheet that is portaled outside
        the <Sidebar> element, so classes on <Sidebar> never reach it and it
        turned white. Children ARE rendered inside the sheet, so styling here
        keeps the same design on desktop, tablet and phone.
      */}
      <div className="flex h-full min-h-0 w-full flex-col bg-navy text-white [--sidebar:var(--navy)] [--sidebar-foreground:#ffffff] [--sidebar-border:rgba(255,255,255,0.1)]">
        {/* Sidebar Header: Logo & Branding */}
        <SidebarHeader className="border-b border-white/10 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
          <Link
            href={config.homeHref}
            className="flex items-center gap-2.5 overflow-hidden rounded-lg p-1 transition-colors hover:bg-white/10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
          >
            <span className="flex size-9 group-data-[collapsible=icon]:size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-all">
              <Image
                src="/logo_cropped_2656.png"
                alt="ViaScholar logo"
                width={32}
                height={32}
                unoptimized
                className="size-6 group-data-[collapsible=icon]:size-4.5 object-contain drop-shadow transition-all"
              />
            </span>
            <div className="flex flex-col overflow-hidden text-left group-data-[collapsible=icon]:hidden">
              <span className="text-[1.05rem] font-bold tracking-tight text-white leading-tight">ViaScholar</span>
            </div>
          </Link>
        </SidebarHeader>

        {/* Sidebar Content: Main Navigation Items */}
        <SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0">
          {config.groups ? (
            config.groups.map((group, groupIdx) => {
              const groupItems = group.items.filter((item) => !item.hidden && !isFooterItem(item.key));
              if (groupItems.length === 0) return null;

              return (
                <SidebarGroup
                  key={group.label ?? `group-${groupIdx}`}
                  className="group-data-[collapsible=icon]:px-0 pt-1 pb-3.5"
                >
                  {group.label && (
                    <SidebarGroupLabel className="text-white/40 text-[0.68rem] font-bold tracking-wider uppercase px-2.5 py-1.5 select-none group-data-[collapsible=icon]:hidden">
                      {group.label}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                      {groupItems.map(renderMenuItem)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })
          ) : (
            <SidebarGroup className="group-data-[collapsible=icon]:px-0">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                  {mainItems.map(renderMenuItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Sidebar Footer: Profile & Settings Navigation + User Card & Logout */}
        <SidebarFooter className="border-t border-white/10 p-2.5 gap-2 group-data-[collapsible=icon]:px-0">
          {footerNavItems.length > 0 && (
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
              {footerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== config.homeHref && pathname.startsWith(item.href));
                const itemBadge = getItemBadge(item);

                return (
                  <SidebarMenuItem
                    key={item.key}
                    className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={`h-9 rounded-lg px-2.5 text-[0.88rem] font-medium transition-all duration-150 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center ${
                        isActive
                          ? "bg-amber! text-navy! data-[active=true]:bg-amber! data-[active=true]:text-white! hover:bg-amber! hover:text-navy! [--sidebar-accent:var(--amber)] [--sidebar-accent-foreground:var(--navy)] font-semibold shadow-xs"
                          : "text-white/80 hover:bg-white/10! hover:text-white!"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex h-full w-full items-center justify-start gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                      >
                        <Icon
                          className={`size-4.5 shrink-0 transition-colors my-auto ${isActive ? "text-white!" : "text-white/80"}`}
                        />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {itemBadge !== undefined && (
                      <SidebarMenuBadge
                        className={`top-1/2! right-2! -translate-y-1/2 font-bold text-[0.7rem] px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden transition-colors ${
                          itemBadge === "!"
                            ? "bg-amber-400! text-navy! font-black! animate-pulse shadow-xs"
                            : isActive
                              ? "bg-navy! text-white/80!"
                              : "bg-amber text-navy"
                        }`}
                      >
                        {itemBadge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          )}

          <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 p-2 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
            <Link
              href={config.profileHref}
              className="flex min-w-0 flex-1 items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
              title="View Profile"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white shadow-inner">
                {displayInitials}
              </span>
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[0.84rem] font-semibold text-white leading-snug">{displayName}</span>
                <span className="truncate text-[0.72rem] text-white/60 leading-tight">{config.roleLabel}</span>
              </div>
            </Link>

            <Tooltip open={isMobile ? false : undefined}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={logout}
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/15 hover:text-white group-data-[collapsible=icon]:hidden"
                  aria-label="Log out"
                >
                  <LogOut className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" hidden={isMobile}>
                Log out
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarFooter>
      </div>

      {/* Expand/Collapse Rail on Desktop */}
      <SidebarRail className="hover:bg-white/10" />
    </Sidebar>
  );
}
