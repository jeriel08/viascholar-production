"use client";

import { CalendarDays, RotateCcw, Video } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";
import { cancelInterview } from "@/lib/api/meetings";
import { formatHourLabel, formatTimeLabel } from "./date-utils";
import { getMeetingStatusClass, getMeetingStatusLabel, type UIMeeting } from "./meeting-types";

interface DayTimelineProps {
  dayMeetings: UIMeeting[];
  selectedDate: Date;
  isSelectedToday: boolean;
  loading: boolean;
  loadError: string | null;
  onRetry: () => void;
  searchQuery: string;
  onBook?: () => void;
  onReschedule?: (meeting: UIMeeting) => void;
  onCancelled?: () => void;
  onJumpToday: () => void;
}

const HOUR_H = 96;

function openLink(raw: string) {
  const href = raw.startsWith("http") ? raw : `https://${raw}`;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function DayTimeline({
  dayMeetings,
  selectedDate,
  isSelectedToday,
  loading,
  loadError,
  onRetry,
  searchQuery,
  onBook,
  onReschedule,
  onCancelled,
  onJumpToday,
}: DayTimelineProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const selectedLabel = isSelectedToday
    ? "TODAY"
    : selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const selectedFull = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let startHour = 8;
  let endHour = 18;
  const minutesOf = (m: UIMeeting) => m.scheduledAt.getHours() * 60 + m.scheduledAt.getMinutes();
  if (dayMeetings.length > 0) {
    const mins = dayMeetings.map(minutesOf);
    startHour = Math.max(6, Math.floor(Math.min(...mins) / 60) - 1);
    endHour = Math.min(21, Math.ceil(Math.max(...mins) / 60) + 2);
    if (endHour - startHour < 6) endHour = startHour + 6;
  }
  const hoursArr = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const trackHeight = (endHour - startHour) * HOUR_H;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine = isSelectedToday && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const nowTop = ((nowMinutes - startHour * 60) / 60) * HOUR_H;

  async function confirmCancel(m: UIMeeting) {
    if (m.applicationId == null) {
      setCancelError("This meeting has no linked application to cancel.");
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelInterview(m.applicationId, { reason: cancelReason.trim() || undefined });
      setCancellingId(null);
      setCancelReason("");
      onCancelled?.();
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : "Could not cancel the meeting. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Card className="min-h-0 rounded-[20px]! shadow-va-sm">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6 md:p-7">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold tracking-[0.08em] text-warn">{selectedLabel}</p>
            <h2 className="truncate text-xl font-bold text-navy! md:text-2xl">{selectedFull}</h2>
          </div>
          {!isSelectedToday && (
            <Button
              type="button"
              variant="secondary"
              className="h-9 shrink-0 rounded-full px-4 text-sm!"
              onClick={onJumpToday}
            >
              Today
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 py-2">
            {["s1", "s2", "s3", "s4"].map((k) => (
              <div key={k} className="flex items-center gap-3 rounded-xl bg-tint p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="hidden h-4 flex-1 md:block" />
                <Skeleton className="ml-auto h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <div>
              <p className="text-base font-semibold">Could not load meetings</p>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            </div>
            <Button type="button" className="h-11 px-5 text-sm!" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
          </div>
        ) : dayMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-center">
            <CalendarDays className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No matching meetings on this day." : "No meetings scheduled for this day."}
            </p>
            {!searchQuery && onBook && (
              <Button type="button" className="mt-2 h-11 px-5 text-sm!" onClick={onBook}>
                <CalendarDays className="size-4" />
                Book a meeting
              </Button>
            )}
          </div>
        ) : (
          <div className="flex">
            <div className="relative w-14 shrink-0" style={{ height: trackHeight }}>
              {hoursArr.slice(0, -1).map((h) => (
                <span
                  key={h}
                  className="absolute right-2.5 text-xs font-semibold text-muted-foreground"
                  style={{ top: (h - startHour) * HOUR_H - 7 }}
                >
                  {formatHourLabel(h)}
                </span>
              ))}
              {showNowLine && (
                <span
                  className="absolute right-2.5 rounded-full bg-amber px-2 py-0.5 text-[0.68rem] font-bold whitespace-nowrap text-navy"
                  style={{ top: nowTop - 10 }}
                >
                  {formatTimeLabel(nowMinutes)}
                </span>
              )}
            </div>
            <div className="relative flex-1 border-l border-line" style={{ height: trackHeight }}>
              {hoursArr.map((h) => (
                <div
                  key={h}
                  className="absolute right-0 left-0 border-t border-tint"
                  style={{ top: (h - startHour) * HOUR_H }}
                />
              ))}
              {showNowLine && (
                <div className="absolute right-0 left-0 z-[2] h-0.5 bg-amber" style={{ top: nowTop }}>
                  <span className="absolute -top-1 -left-1 size-2.5 rounded-full bg-amber" />
                </div>
              )}
              {dayMeetings.map((m) => {
                const mins = minutesOf(m);
                const top = ((mins - startHour * 60) / 60) * HOUR_H + 6;
                const cardH = Math.max(88, HOUR_H - 18);
                const label = getMeetingStatusLabel(m);
                const isCancelling = cancellingId === m.id;
                return (
                  <div
                    key={m.id}
                    className="absolute right-3 left-4 flex flex-col justify-between gap-2 overflow-hidden rounded-xl border-l-4 border-navy bg-tint p-3.5"
                    style={{ top, height: isCancelling ? "auto" : cardH, minHeight: cardH }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-bold text-navy">{m.title}</p>
                        <Badge
                          variant="secondary"
                          className={`h-6 shrink-0 px-2.5 text-xs! ${getMeetingStatusClass(label)}`}
                        >
                          {label}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {formatTimeLabel(mins)} · {m.durationMinutes} min · with {m.applicantName}
                        {m.scheduledBy ? ` · by ${m.scheduledBy}` : ""}
                      </p>
                    </div>
                    {isCancelling ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Cancellation reason (optional)"
                          className="h-9 bg-white text-sm!"
                          aria-label="Cancellation reason"
                        />
                        {cancelError && <p className="text-xs text-destructive">{cancelError}</p>}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 bg-white text-xs!"
                            disabled={cancelling}
                            onClick={() => {
                              setCancellingId(null);
                              setCancelReason("");
                              setCancelError(null);
                            }}
                          >
                            Keep
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 flex-1 text-xs!"
                            disabled={cancelling}
                            onClick={() => void confirmCancel(m)}
                          >
                            {cancelling ? "Cancelling…" : "Confirm cancel"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {m.meetingLink ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white text-xs!"
                            onClick={() => openLink(m.meetingLink as string)}
                          >
                            <Video className="size-3.5" />
                            Join
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white text-xs!"
                            disabled
                            title="No meeting link available yet"
                          >
                            <Video className="size-3.5" />
                            Join
                          </Button>
                        )}
                        {onReschedule && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 bg-white text-xs!"
                            onClick={() => onReschedule(m)}
                          >
                            Reschedule
                          </Button>
                        )}
                        {onCancelled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive!"
                            disabled={m.applicationId == null}
                            title={m.applicationId == null ? "No linked application" : "Cancel meeting"}
                            onClick={() => {
                              setCancellingId(m.id);
                              setCancelReason("");
                              setCancelError(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
