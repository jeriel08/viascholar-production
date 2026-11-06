"use client";

import { cn } from "cn";
import { AlertCircle, AlertTriangle, Award, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ScholarPercentileItem } from "@/lib/api/analytics";

interface ScholarPercentileRankCardProps {
  scholars: ScholarPercentileItem[];
  globalThreshold?: number;
  className?: string;
}

export function ScholarPercentileRankCard({ scholars, className }: ScholarPercentileRankCardProps) {
  const [search, setSearch] = useState("");

  const filtered = scholars.filter((sc) => {
    const q = search.toLowerCase();
    return (
      sc.name.toLowerCase().includes(q) ||
      sc.email.toLowerCase().includes(q) ||
      sc.school.toLowerCase().includes(q) ||
      sc.course.toLowerCase().includes(q)
    );
  });

  const getStandingBadge = (health: "good" | "warn" | "bad") => {
    if (health === "good") {
      return (
        <Badge className="rounded-full bg-[#ddeee3] text-[#0a4f42] text-[9.5px] font-bold border-none px-2 py-0.5">
          <CheckCircle2 className="mr-1 size-2.5" /> Good
        </Badge>
      );
    }
    if (health === "warn") {
      return (
        <Badge className="rounded-full bg-[#fceec4] text-[#8a6410] text-[9.5px] font-bold border-none px-2 py-0.5">
          <AlertTriangle className="mr-1 size-2.5" /> Watch
        </Badge>
      );
    }
    return (
      <Badge className="rounded-full bg-rose-100 text-rose-800 text-[9.5px] font-bold border-none px-2 py-0.5">
        <AlertCircle className="mr-1 size-2.5" /> Risk
      </Badge>
    );
  };

  return (
    <Card className={cn("rounded-2xl border-line/80 bg-white shadow-2xs hover:shadow-xs transition-all", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 pb-2.5 gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7.5 items-center justify-center rounded-lg bg-[#0a4f42]/10 text-[#0a4f42]">
            <Award className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#14213a]">Scholar Rankings</h2>
            <p className="text-[11px] text-muted-foreground">Ranked by overall academic performance</p>
          </div>
        </div>

        <div className="relative w-full sm:w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholar..."
            className="h-7 pl-7 text-[11px] rounded-lg bg-[#FAF8F5] border-line/70"
          />
        </div>
      </CardHeader>

      <CardContent className="p-4.5 pt-0">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line/70 p-6 text-center text-xs text-muted-foreground">
            No scholars match the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line/70 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-line/70 bg-[#FAF8F5] text-[10.5px] font-bold text-muted-foreground">
                  <th className="py-2 px-2.5">#</th>
                  <th className="py-2 px-2.5">Scholar</th>
                  <th className="py-2 px-2 text-center">GWA</th>
                  <th className="py-2 px-2 text-center">Score</th>
                  <th className="py-2 px-2.5 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60 bg-white">
                {filtered.map((sc, index) => (
                  <tr key={sc.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-2 px-2.5 font-black text-[#14213a] text-xs">#{index + 1}</td>
                    <td className="py-2 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-[#0a4f42] text-white font-bold text-[9px]">
                          {sc.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2) || "SC"}
                        </div>
                        <div className="min-w-0 max-w-35 sm:max-w-45">
                          <p className="font-bold text-[#14213a] truncate text-xs">{sc.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{sc.course}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-extrabold text-[#0a4f42] text-xs">{sc.gwa.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center">
                      <Badge
                        className={`rounded-full text-[9px] font-bold border-none px-1.5 py-0.5 ${
                          sc.percentileRank >= 80
                            ? "bg-[#ddeee3] text-[#0a4f42]"
                            : sc.percentileRank >= 50
                              ? "bg-[#FAF8F5] text-[#14213a] border border-line/80"
                              : "bg-[#fceec4] text-[#8a6410]"
                        }`}
                      >
                        {sc.percentileRank.toFixed(0)}/100
                      </Badge>
                    </td>
                    <td className="py-2 px-2.5 text-right">{getStandingBadge(sc.health)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
