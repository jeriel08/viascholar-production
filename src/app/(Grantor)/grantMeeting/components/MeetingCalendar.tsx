"use client";

import { CalendarPlus, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { dateKey, getInitials, getMonthMatrix } from "./date-utils";
import { MONTH_ABBR, MONTH_NAMES, type UIMeeting, WEEKDAY_LABELS } from "./meeting-types";

interface MeetingCalendarProps {
  calendarMonth: Date;
  onMonthChange: (d: Date) => void;
  viewMode: "month" | "year";
  onViewModeChange: (m: "month" | "year") => void;
  meetingDateKeys: Set<string>;
  selectedDateKey: string;
  onSelectDate: (key: string) => void;
  onJumpToday: () => void;
  upcoming: UIMeeting[];
  isSelectedToday: boolean;
  onViewAll: () => void;
  onNewMeeting?: () => void;
  searchQuery: string;
}

export function MeetingCalendar({
  calendarMonth,
  onMonthChange,
  viewMode,
  onViewModeChange,
  meetingDateKeys,
  selectedDateKey,
  onSelectDate,
  onJumpToday,
  upcoming,
  isSelectedToday,
  onViewAll,
  onNewMeeting,
  searchQuery,
}: MeetingCalendarProps) {
  const todayKey = dateKey(new Date());
  const matrix = getMonthMatrix(calendarMonth);

  return (
    <Card className="min-h-0 rounded-[20px]! shadow-va-sm">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="inline-flex w-fit gap-1 rounded-full bg-tint p-1">
          {(["month", "year"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              className="h-8 rounded-full px-5 text-xs font-bold uppercase!"
              onClick={() => onViewModeChange(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>

        {viewMode === "month" ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold text-navy!">
                {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                <span className="font-medium text-muted-foreground">{calendarMonth.getFullYear()}</span>
              </p>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous month"
                  onClick={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next month"
                  onClick={() => onMonthChange(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="mb-1.5 grid grid-cols-7">
              {WEEKDAY_LABELS.map((w) => (
                <span key={w.key} className="text-center text-[0.68rem] font-bold tracking-wide text-muted-foreground">
                  {w.label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {matrix.map(({ date, inMonth }) => {
                const key = dateKey(date);
                const isSelected = key === selectedDateKey;
                const isToday = key === todayKey;
                const hasMeeting = meetingDateKeys.has(key);
                return (
                  <div key={key} className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={() => onSelectDate(key)}
                      aria-label={`Select ${key}`}
                      aria-pressed={isSelected}
                      className={`flex size-8 items-center justify-center rounded-[10px] text-[0.8rem] font-semibold transition-colors ${
                        isSelected
                          ? "bg-navy font-bold text-white"
                          : inMonth
                            ? "text-foreground hover:bg-tint"
                            : "text-muted-foreground/50 hover:bg-tint"
                      } ${isToday && !isSelected ? "ring-2 ring-amber" : ""}`}
                    >
                      {date.getDate()}
                    </button>
                    {hasMeeting && (
                      <span
                        className={`absolute bottom-0.5 size-1 rounded-full ${isSelected ? "bg-white" : "bg-amber"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold text-navy!">{calendarMonth.getFullYear()}</p>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous year"
                  onClick={() => onMonthChange(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth(), 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next year"
                  onClick={() => onMonthChange(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth(), 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTH_ABBR.map((abbr, idx) => {
                const active = idx === calendarMonth.getMonth();
                return (
                  <Button
                    key={abbr}
                    type="button"
                    variant={active ? "default" : "secondary"}
                    className="h-11 text-sm font-bold!"
                    onClick={() => {
                      onMonthChange(new Date(calendarMonth.getFullYear(), idx, 1));
                      onViewModeChange("month");
                    }}
                  >
                    {abbr}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {onNewMeeting && (
            <Button type="button" className="h-11 w-full text-sm!" onClick={onNewMeeting}>
              <CalendarPlus className="size-4" />
              New meeting
            </Button>
          )}
          {!isSelectedToday && (
            <Button type="button" variant="outline" className="h-10 w-full text-sm!" onClick={onJumpToday}>
              Jump to today
            </Button>
          )}
        </div>

        <Separator />

        <div>
          <p className="mb-2.5 text-xs font-bold tracking-[0.06em] text-muted-foreground uppercase">
            Upcoming ({upcoming.length})
          </p>
          {upcoming.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              {searchQuery ? `No meetings match "${searchQuery}".` : "No upcoming meetings."}
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {upcoming.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectDate(dateKey(m.scheduledAt))}
                  className="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left transition-colors hover:bg-tint"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint text-[0.7rem] font-bold text-navy">
                    {getInitials(m.applicantName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {MONTH_ABBR[m.scheduledAt.getMonth()]} {m.scheduledAt.getDate()} · {m.applicantName}
                    </span>
                  </span>
                  <Video className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        <Button type="button" variant="link" className="mx-auto h-8 text-sm font-bold text-warn!" onClick={onViewAll}>
          View all meetings →
        </Button>
      </CardContent>
    </Card>
  );
}
