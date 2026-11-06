"use client";

import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  FileCheck2,
  FileText,
  Filter,
  Menu,
  MessageCircle,
  MessageSquare,
  RotateCcw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { useSidebar } from "@/components/SidebarContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type NotificationCategory, useNotifications } from "@/contexts/NotificationContext";

export interface HeaderFilterOption {
  value: string;
  label: string;
}

export interface HeaderFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: HeaderFilterOption[];
  label?: string;
  hasActive?: boolean;
  onClear?: () => void;
}

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filter?: HeaderFilterProps;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  notificationPlacement?: "start" | "end";
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return "";
  }
}

function getCategoryIcon(cat: NotificationCategory) {
  switch (cat) {
    case "application":
      return <Users className="size-4 text-blue-600" />;
    case "document":
      return <FileCheck2 className="size-4 text-amber-600" />;
    case "interview":
      return <Calendar className="size-4 text-purple-600" />;
    case "contract":
      return <FileText className="size-4 text-emerald-600" />;
    case "chat":
      return <MessageSquare className="size-4 text-indigo-600" />;
    case "forum":
      return <MessageCircle className="size-4 text-pink-600" />;
    default:
      return <Bell className="size-4 text-navy" />;
  }
}

function HeaderFilterButton({ value, onChange, options, label = "Filter", hasActive, onClear }: HeaderFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-9 shrink-0 rounded-full border-line/80 bg-white text-navy hover:bg-tint hover:text-navy"
          aria-label={label}
        >
          <Filter className="size-4" />
          {hasActive && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-amber ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-2xl border border-line bg-white p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line/60 px-4 py-2.5 bg-[#FAF9F7]/60">
          <span className="text-xs font-bold text-navy">{label}</span>
          {hasActive && onClear && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="flex items-center gap-1 text-[0.68rem] font-semibold text-muted-foreground hover:text-navy transition-colors"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          )}
        </div>

        <div className="p-1.5">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-tint/60 ${
                  isSelected ? "font-semibold text-navy" : "text-foreground"
                }`}
              >
                {opt.label}
                {isSelected && <Check className="size-3.5 shrink-0 text-amber" />}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PageHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filter,
  actions,
  children,
  className = "",
  notificationPlacement = "start",
}: PageHeaderProps) {
  const { toggleMobile } = useSidebar();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const notificationBellNode = (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative size-9 rounded-full border-line/80 bg-white text-navy hover:bg-tint hover:text-navy"
          aria-label="Notifications"
        >
          <Bell className="size-4 text-navy" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-600 text-[0.62rem] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl border border-line bg-white p-0 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line/60 px-4 py-3 bg-[#FAF9F7]/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-navy">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="h-5 rounded-full bg-amber-100 text-amber-900 border-amber-300 px-2 text-[0.62rem] font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[0.68rem] font-semibold text-muted-foreground hover:text-navy transition-colors"
              >
                <CheckCheck className="size-3" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => clearAll()}
                className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                title="Clear all"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-line/40">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-tint">
                <Bell className="size-4.5 opacity-40 text-navy" />
              </div>
              <p className="text-xs font-semibold text-navy">No notifications yet</p>
              <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                You're all caught up on applications and real-time updates!
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const inner = (
                <>
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-tint ring-1 ring-border/40">
                    {getCategoryIcon(n.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs truncate ${!n.read ? "font-bold text-navy" : "font-medium text-foreground"}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[0.62rem] text-muted-foreground shrink-0">
                        {formatRelativeTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                  </div>
                  {!n.read && <span className="size-2 rounded-full bg-amber shrink-0 mt-1.5 ring-2 ring-white" />}
                </>
              );

              const itemClass = `flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-tint/40 ${
                !n.read ? "bg-amber-50/40" : ""
              }`;

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => {
                    markAsRead(n.id);
                    setDropdownOpen(false);
                  }}
                  className={itemClass}
                >
                  {inner}
                </Link>
              ) : (
                <button key={n.id} type="button" onClick={() => markAsRead(n.id)} className={itemClass}>
                  {inner}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={`sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 sm:gap-4 border-b border-line bg-white/95 px-4 py-3 sm:p-4 backdrop-blur-md ${className}`}
    >
      {/* LEFT: Mobile Sidebar Trigger + Page Title/Subtitle */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleMobile}
          className="size-9 shrink-0 rounded-lg border-line/80 bg-white text-navy hover:bg-tint md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="size-4.5" />
        </Button>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h1 className="wrap-break-word text-lg font-bold leading-tight tracking-tight text-navy sm:text-xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* RIGHT: Search Bar + Filter + Notifications + Actions / Custom Children */}
      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
        {/* Optional Search Bar */}
        {onSearchChange && (
          <div className="relative hidden h-9 w-48 sm:w-56 md:w-64 items-center rounded-full border border-line bg-tint/50 px-3 md:flex focus-within:border-navy/40 focus-within:bg-white transition-all">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
              aria-label={searchPlaceholder}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-muted-foreground hover:text-navy"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Optional icon-only filter dropdown */}
        {filter && <HeaderFilterButton {...filter} />}

        {/* If notificationPlacement is 'start' (default), show bell first */}
        {notificationPlacement === "start" && notificationBellNode}

        {/* Custom Actions / Children */}
        {actions}
        {children}

        {/* If notificationPlacement is 'end', show bell last */}
        {notificationPlacement === "end" && notificationBellNode}
      </div>
    </header>
  );
}
