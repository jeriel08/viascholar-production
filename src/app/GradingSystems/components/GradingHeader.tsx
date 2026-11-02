"use client";

import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GradingHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTab?: "schools" | "programs" | "grading-scales";
  onAdd: () => void;
}

export function GradingHeader({
  searchQuery,
  onSearchChange,
  activeTab = "schools",
  onAdd,
}: GradingHeaderProps) {
  let searchPlaceholder = "Search schools, codes, or addresses...";
  let addLabel = "Add academic institution";

  if (activeTab === "programs") {
    searchPlaceholder = "Search programs or codes...";
    addLabel = "Add academic program";
  } else if (activeTab === "grading-scales") {
    searchPlaceholder = "Search grading scales or rules...";
    addLabel = "Add grading scale";
  }

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
