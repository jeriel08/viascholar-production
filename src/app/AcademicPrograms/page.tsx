"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/components/ToastContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useSocketEvent } from "@/contexts/SocketContext";
import { ApiError } from "@/lib/api";
import {
  type AcademicProgram,
  type AcademicProgramInput,
  createAcademicProgram,
  deleteAcademicProgram,
  listAcademicPrograms,
  updateAcademicProgram,
} from "@/lib/api/settings";
import { AddProgramSheet } from "../GradingSystems/components/AddProgramSheet";
import { ProgramSheet } from "../GradingSystems/components/ProgramSheet";
import { ProgramTable } from "../GradingSystems/components/ProgramTable";

export default function AcademicProgramsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "GRANTOR";

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setPrograms(await listAcademicPrograms(false));
    } catch (err) {
      console.error("Failed to load programs:", err);
      setLoadError(err instanceof ApiError ? err.message : "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Real-time socket events
  useSocketEvent("program:created", fetchPrograms);
  useSocketEvent("program:updated", fetchPrograms);
  useSocketEvent("program:deleted", fetchPrograms);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter(
      (p) =>
        p.program_code.toLowerCase().includes(q) ||
        p.program_name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }, [programs, searchQuery]);

  async function handleCreate(input: AcademicProgramInput): Promise<void> {
    try {
      await createAcademicProgram(input);
      showToast("Academic program registered successfully.");
      setShowAdd(false);
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to create program:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add program.");
    }
  }

  async function handleUpdate(id: number, input: Partial<AcademicProgramInput>): Promise<void> {
    try {
      await updateAcademicProgram(id, input);
      showToast("Academic program updated successfully.");
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to update program:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update program.");
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      await deleteAcademicProgram(id);
      showToast("Academic program removed successfully.");
      setSelectedProgram(null);
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to delete program:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to delete program.");
    }
  }

  return (
    <div className="min-h-full bg-[#faf8f5]">
      <PageHeader
        title="Academic Programs"
        subtitle="Manage degree programs, majors, and academic strands for applicant selection."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search programs, codes, or categories..."
        actions={
          canManage ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-xs"
                >
                  <Plus className="size-4" />
                  <span className="sr-only">Add academic program</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add academic program</TooltipContent>
            </Tooltip>
          ) : undefined
        }
      />

      <div className="px-5 pb-24 md:px-10">
        <ProgramTable
          programs={filteredPrograms}
          totalCount={programs.length}
          loading={loading}
          loadError={loadError}
          onRetry={fetchPrograms}
          onSelect={setSelectedProgram}
          searchQuery={searchQuery}
        />
      </div>

      <ProgramSheet
        program={selectedProgram}
        open={!!selectedProgram}
        canDelete={canManage}
        onOpenChange={(open) => !open && setSelectedProgram(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <AddProgramSheet open={showAdd} onOpenChange={setShowAdd} onCreate={handleCreate} />
    </div>
  );
}
