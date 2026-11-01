"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useSocketEvent } from "@/contexts/SocketContext";
import { ApiError } from "@/lib/api";
import {
  type AcademicProgram,
  type AcademicProgramInput,
  createAcademicProgram,
  createSchoolGrading,
  deleteAcademicProgram,
  deleteSchoolGrading,
  listAcademicPrograms,
  listSchoolGradings,
  type SchoolGrading,
  type SchoolGradingInput,
  updateAcademicProgram,
  updateSchoolGrading,
} from "@/lib/api/settings";
import { AddGradingSheet } from "./components/AddGradingSheet";
import { AddProgramSheet } from "./components/AddProgramSheet";
import { GradingHeader } from "./components/GradingHeader";
import { GradingSheet } from "./components/GradingSheet";
import { GradingTable } from "./components/GradingTable";
import { ProgramSheet } from "./components/ProgramSheet";
import { ProgramTable } from "./components/ProgramTable";

export default function GradingSystemsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"schools" | "programs">("schools");

  // Schools state
  const [schools, setSchools] = useState<SchoolGrading[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolsError, setSchoolsError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolGrading | null>(null);
  const [showAddSchool, setShowAddSchool] = useState(false);

  // Programs state
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [showAddProgram, setShowAddProgram] = useState(false);

  // Search query (shared header)
  const [searchQuery, setSearchQuery] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "GRANTOR";

  // 1. Fetch schools
  const fetchSchools = useCallback(async () => {
    setLoadingSchools(true);
    setSchoolsError("");
    try {
      setSchools(await listSchoolGradings());
    } catch (err) {
      console.error("Failed to load schools:", err);
      setSchoolsError(err instanceof ApiError ? err.message : "Failed to load schools.");
    } finally {
      setLoadingSchools(false);
    }
  }, []);

  // 2. Fetch programs
  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    setProgramsError("");
    try {
      setPrograms(await listAcademicPrograms(false));
    } catch (err) {
      console.error("Failed to load programs:", err);
      setProgramsError(err instanceof ApiError ? err.message : "Failed to load programs.");
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchPrograms();
  }, [fetchSchools, fetchPrograms]);

  // Real-time socket events
  useSocketEvent("school_grading:created", fetchSchools);
  useSocketEvent("school_grading:updated", fetchSchools);
  useSocketEvent("school_grading:deleted", fetchSchools);

  useSocketEvent("program:created", fetchPrograms);
  useSocketEvent("program:updated", fetchPrograms);
  useSocketEvent("program:deleted", fetchPrograms);

  // Filtered lists
  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return schools;
    return schools.filter(
      (s) =>
        s.school_name.toLowerCase().includes(q) ||
        s.grading_scale.toLowerCase().includes(q) ||
        (s.notes ?? "").toLowerCase().includes(q),
    );
  }, [schools, searchQuery]);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return programs;
    return programs.filter(
      (p) =>
        p.program_code.toLowerCase().includes(q) ||
        p.program_name.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q),
    );
  }, [programs, searchQuery]);

  // Handlers for Schools
  async function handleCreateSchool(input: SchoolGradingInput): Promise<void> {
    try {
      await createSchoolGrading(input);
      showToast("School grading system added successfully.");
      setShowAddSchool(false);
      await fetchSchools();
    } catch (err) {
      console.error("Failed to add school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add school.");
    }
  }

  async function handleUpdateSchool(id: number, input: Partial<SchoolGradingInput>): Promise<void> {
    try {
      await updateSchoolGrading(id, input);
      showToast("School grading system updated successfully.");
      await fetchSchools();
    } catch (err) {
      console.error("Failed to update school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update school.");
    }
  }

  async function handleDeleteSchool(id: number): Promise<void> {
    try {
      await deleteSchoolGrading(id);
      showToast("School grading system removed successfully.");
      setSelectedSchool(null);
      await fetchSchools();
    } catch (err) {
      console.error("Failed to delete school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to delete school.");
    }
  }

  // Handlers for Programs
  async function handleCreateProgram(input: AcademicProgramInput): Promise<void> {
    try {
      await createAcademicProgram(input);
      showToast("Academic program added successfully.");
      setShowAddProgram(false);
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to add program:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add program.");
    }
  }

  async function handleUpdateProgram(id: number, input: Partial<AcademicProgramInput>): Promise<void> {
    try {
      await updateAcademicProgram(id, input);
      showToast("Academic program updated successfully.");
      await fetchPrograms();
    } catch (err) {
      console.error("Failed to update program:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update program.");
    }
  }

  async function handleDeleteProgram(id: number): Promise<void> {
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

  const handleOpenAdd = () => {
    if (activeTab === "schools") {
      setShowAddSchool(true);
    } else {
      setShowAddProgram(true);
    }
  };

  return (
    <div className="min-h-full bg-[#faf8f5]">
      <GradingHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onAdd={handleOpenAdd}
      />

      <div className="px-5 pb-24 md:px-10">
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "schools" | "programs");
            setSearchQuery("");
          }}
          className="mt-2"
        >
          <TabsList className="bg-[#eef2f6] p-1 rounded-xl">
            <TabsTrigger
              value="schools"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-xs"
            >
              Schools & Grading Scales ({schools.length})
            </TabsTrigger>
            <TabsTrigger
              value="programs"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-xs"
            >
              Academic Programs ({programs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            <GradingTable
              schools={filteredSchools}
              totalCount={schools.length}
              loading={loadingSchools}
              loadError={schoolsError}
              onRetry={fetchSchools}
              onSelect={setSelectedSchool}
            />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramTable
              programs={filteredPrograms}
              totalCount={programs.length}
              loading={loadingPrograms}
              loadError={programsError}
              onRetry={fetchPrograms}
              onSelect={setSelectedProgram}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Schools Sheets */}
      <GradingSheet
        school={selectedSchool}
        onClose={() => setSelectedSchool(null)}
        canDelete={canManage}
        onUpdate={handleUpdateSchool}
        onDelete={handleDeleteSchool}
      />

      <AddGradingSheet
        open={showAddSchool}
        onOpenChange={setShowAddSchool}
        onCreate={handleCreateSchool}
      />

      {/* Programs Sheets */}
      <ProgramSheet
        program={selectedProgram}
        open={!!selectedProgram}
        canDelete={canManage}
        onOpenChange={(open) => !open && setSelectedProgram(null)}
        onUpdate={handleUpdateProgram}
        onDelete={handleDeleteProgram}
      />

      <AddProgramSheet
        open={showAddProgram}
        onOpenChange={setShowAddProgram}
        onCreate={handleCreateProgram}
      />
    </div>
  );
}
