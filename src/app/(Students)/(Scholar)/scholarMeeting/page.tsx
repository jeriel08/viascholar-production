"use client";

import { useState } from "react";
import { AllMeetingsSheet } from "@/app/(Grantor)/grantMeeting/components/AllMeetingsSheet";
import { DayTimeline } from "@/app/(Grantor)/grantMeeting/components/DayTimeline";
import { dateKey } from "@/app/(Grantor)/grantMeeting/components/date-utils";
import { MeetingCalendar } from "@/app/(Grantor)/grantMeeting/components/MeetingCalendar";
import type { UIMeeting } from "@/app/(Grantor)/grantMeeting/components/meeting-types";
import { useMeetings } from "@/app/(Grantor)/grantMeeting/components/useMeetings";
import { PageHeader } from "@/components/PageHeader";

export default function ScholarMeetingPage() {
  const m = useMeetings();
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleSelectDate(key: string) {
    m.setSelectedDateKey(key);
    const parts = key.split("-").map(Number);
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      m.setCalendarMonth(new Date(parts[0], parts[1] - 1, 1));
    }
  }

  function handleSheetSelect(meeting: UIMeeting) {
    handleSelectDate(dateKey(meeting.scheduledAt));
    setSheetOpen(false);
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Meetings"
        subtitle="Check your scheduled interviews and meetings with your coordinator or grantor."
        searchValue={m.search}
        onSearchChange={m.setSearch}
        searchPlaceholder="Search meetings..."
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="grid flex-1 grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_340px]">
          <DayTimeline
            dayMeetings={m.dayMeetings}
            selectedDate={m.selectedDate}
            isSelectedToday={m.isSelectedToday}
            loading={m.loading}
            loadError={m.loadError}
            onRetry={() => void m.refresh()}
            searchQuery={m.search.trim()}
            onJumpToday={m.jumpToToday}
          />
          <MeetingCalendar
            calendarMonth={m.calendarMonth}
            onMonthChange={m.setCalendarMonth}
            viewMode={m.calendarViewMode}
            onViewModeChange={m.setCalendarViewMode}
            meetingDateKeys={m.meetingDateKeys}
            selectedDateKey={m.selectedDateKey}
            onSelectDate={handleSelectDate}
            onJumpToday={m.jumpToToday}
            upcoming={m.upcomingMeetings}
            isSelectedToday={m.isSelectedToday}
            onViewAll={() => setSheetOpen(true)}
            searchQuery={m.search.trim()}
          />
        </div>
      </div>

      <AllMeetingsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        meetings={m.filteredMeetings}
        searchQuery={m.search.trim()}
        onSelect={handleSheetSelect}
      />
    </div>
  );
}
