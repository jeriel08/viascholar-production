"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GradingHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab?: "schools" | "programs";
  onAdd: () => void;
}

export function GradingHeader({
  searchQuery,
  onSearchChange,
  activeTab = "schools",
  onAdd,
}: GradingHeaderProps) {
  const isSchools = activeTab === "schools";
  const searchPlaceholder = isSchools ? "Search schools or grading scales..." : "Search programs or codes...";
  const addLabel = isSchools ? "Add school grading system" : "Add academic program";

  return (
    <PageHeader
      title="Schools & Programs"
      subtitle="Manage partner schools, grading scales, and academic programs for applicants and scholars."
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" onClick={onAdd} size="icon" className="h-9 w-9 rounded-full">
              <Plus className="size-4" />
              <span className="sr-only">{addLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{addLabel}</TooltipContent>
        </Tooltip>
      }
    />
  );
}
