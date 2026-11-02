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
  createSchool,
  deleteSchool,
  listSchoolGradings,
  listSchools,
  type School,
  type SchoolGrading,
  type SchoolInput,
  updateSchool,
} from "@/lib/api/settings";
import { AddSchoolSheet } from "../GradingSystems/components/AddSchoolSheet";
import { SchoolSheet } from "../GradingSystems/components/SchoolSheet";
import { SchoolTable } from "../GradingSystems/components/SchoolTable";

export default function SchoolsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [gradingScales, setGradingScales] = useState<SchoolGrading[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "GRANTOR";

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setSchools(await listSchools(false));
    } catch (err) {
      console.error("Failed to load schools:", err);
      setLoadError(err instanceof ApiError ? err.message : "Failed to load schools.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGradingScales = useCallback(async () => {
    try {
      setGradingScales(await listSchoolGradings());
    } catch (err) {
      console.error("Failed to load grading scales:", err);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchGradingScales();
  }, [fetchSchools, fetchGradingScales]);

  // Real-time socket events
  useSocketEvent("school:created", fetchSchools);
  useSocketEvent("school:updated", fetchSchools);
  useSocketEvent("school:deleted", fetchSchools);

  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.school_name.toLowerCase().includes(q) ||
        (s.school_code ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q) ||
        (s.grading_system?.grading_scale ?? "").toLowerCase().includes(q),
    );
  }, [schools, searchQuery]);

  async function handleCreate(input: SchoolInput): Promise<void> {
    try {
      await createSchool(input);
      showToast("Academic institution registered successfully.");
      setShowAdd(false);
      await fetchSchools();
    } catch (err) {
      console.error("Failed to create school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add school.");
    }
  }

  async function handleUpdate(id: number, input: Partial<SchoolInput>): Promise<void> {
    try {
      await updateSchool(id, input);
      showToast("Academic institution updated successfully.");
      await fetchSchools();
    } catch (err) {
      console.error("Failed to update school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update school.");
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      const res = await deleteSchool(id);
      showToast(res.message || "Academic institution removed successfully.");
      setSelectedSchool(null);
      await fetchSchools();
    } catch (err) {
      console.error("Failed to delete school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to delete school.");
    }
  }

  return (
    <div className="min-h-full bg-[#faf8f5]">
      <PageHeader
        title="Schools & Institutions"
        subtitle="Manage recognized colleges, universities, campus addresses, and assigned grading scales."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search schools, codes, or addresses..."
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
                  <span className="sr-only">Add school institution</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add school institution</TooltipContent>
            </Tooltip>
          ) : undefined
        }
      />

      <div className="px-5 pb-24 md:px-10">
        <SchoolTable
          schools={filteredSchools}
          totalCount={schools.length}
          loading={loading}
          loadError={loadError}
          onRetry={fetchSchools}
          onSelect={setSelectedSchool}
        />
      </div>

      <SchoolSheet
        school={selectedSchool}
        open={!!selectedSchool}
        onOpenChange={(open) => !open && setSelectedSchool(null)}
        gradingSystems={gradingScales}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <AddSchoolSheet open={showAdd} onOpenChange={setShowAdd} gradingSystems={gradingScales} onCreate={handleCreate} />
    </div>
  );
}
