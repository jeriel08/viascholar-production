"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { User } from "@/lib/api/auth";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 py-2 border-b border-line/60 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs sm:text-sm font-semibold text-navy text-left sm:text-right wrap-break-word">
        {value}
      </span>
    </div>
  );
}

interface ProfileDetailsCardsProps {
  user: User;
}

export function ProfileDetailsCards({ user }: ProfileDetailsCardsProps) {
  const scholarProfile = user.scholar_profile;

  return (
    <>
      {/* Academic & Personal Details */}
      <Card className="rounded-xl border border-line bg-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <InfoRow label="Scholarship Track" value={scholarProfile?.scholarship_track || "General"} />
            <InfoRow label="School Name" value={scholarProfile?.school_name || "Not specified"} />
            <InfoRow label="Program" value={scholarProfile?.course_of_study || "Not specified"} />
            <InfoRow
              label="Year Level"
              value={scholarProfile?.current_year_level ? `Year ${scholarProfile.current_year_level}` : "Not specified"}
            />
            <InfoRow label="Student Number" value={scholarProfile?.student_number || "Not specified"} />
            <InfoRow label="Relative in Company" value={scholarProfile?.relative_employee || "None"} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card className="rounded-xl border border-line bg-white shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact & Addresses</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone Number" value={scholarProfile?.phone_number || "Not provided"} />
            <InfoRow label="Permanent Address" value={scholarProfile?.student_address || "Not provided"} />
            <InfoRow label="School Address" value={scholarProfile?.school_address || "Not provided"} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
