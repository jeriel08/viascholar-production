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
  createSchool,
  createSchoolGrading,
  deleteAcademicProgram,
  deleteSchool,
  deleteSchoolGrading,
  listAcademicPrograms,
  listSchoolGradings,
  listSchools,
  type School,
  type SchoolGrading,
  type SchoolGradingInput,
  type SchoolInput,
  updateAcademicProgram,
  updateSchool,
  updateSchoolGrading,
} from "@/lib/api/settings";
import { AddGradingSheet } from "./components/AddGradingSheet";
import { AddProgramSheet } from "./components/AddProgramSheet";
import { AddSchoolSheet } from "./components/AddSchoolSheet";
import { GradingHeader } from "./components/GradingHeader";
import { GradingSheet } from "./components/GradingSheet";
import { GradingTable } from "./components/GradingTable";
import { ProgramSheet } from "./components/ProgramSheet";
import { ProgramTable } from "./components/ProgramTable";
import { SchoolSheet } from "./components/SchoolSheet";
import { SchoolTable } from "./components/SchoolTable";

export default function GradingSystemsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"schools" | "programs" | "grading-scales">("schools");

  // Normalized Schools (Institutions) state
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolsError, setSchoolsError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showAddSchool, setShowAddSchool] = useState(false);

  // Programs state
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [programsError, setProgramsError] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [showAddProgram, setShowAddProgram] = useState(false);

  // Grading Systems state
  const [gradingScales, setGradingScales] = useState<SchoolGrading[]>([]);
  const [loadingGradingScales, setLoadingGradingScales] = useState(true);
  const [gradingScalesError, setGradingScalesError] = useState("");
  const [selectedGradingScale, setSelectedGradingScale] = useState<SchoolGrading | null>(null);
  const [showAddGradingScale, setShowAddGradingScale] = useState(false);

  // Search query (shared header)
  const [searchQuery, setSearchQuery] = useState("");

  const canManage = user?.role === "ADMIN" || user?.role === "GRANTOR";

  // 1. Fetch normalized schools
  const fetchSchools = useCallback(async () => {
    setLoadingSchools(true);
    setSchoolsError("");
    try {
      setSchools(await listSchools(false));
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

  // 3. Fetch grading system scales
  const fetchGradingScales = useCallback(async () => {
    setLoadingGradingScales(true);
    setGradingScalesError("");
    try {
      setGradingScales(await listSchoolGradings());
    } catch (err) {
      console.error("Failed to load grading scales:", err);
      setGradingScalesError(err instanceof ApiError ? err.message : "Failed to load grading scales.");
    } finally {
      setLoadingGradingScales(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
    fetchPrograms();
    fetchGradingScales();
  }, [fetchSchools, fetchPrograms, fetchGradingScales]);

  // Real-time socket events
  useSocketEvent("school:created", fetchSchools);
  useSocketEvent("school:updated", fetchSchools);
  useSocketEvent("school:deleted", fetchSchools);

  useSocketEvent("program:created", fetchPrograms);
  useSocketEvent("program:updated", fetchPrograms);
  useSocketEvent("program:deleted", fetchPrograms);

  useSocketEvent("school_grading:created", fetchGradingScales);
  useSocketEvent("school_grading:updated", fetchGradingScales);
  useSocketEvent("school_grading:deleted", fetchGradingScales);

  // Filtered lists
  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return schools;
    return schools.filter(
      (s) =>
        s.school_name.toLowerCase().includes(q) ||
        (s.school_code ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q) ||
        (s.grading_system?.grading_scale ?? "").toLowerCase().includes(q),
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

  const filteredGradingScales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q === "") return gradingScales;
    return gradingScales.filter(
      (s) =>
        s.school_name.toLowerCase().includes(q) ||
        s.grading_scale.toLowerCase().includes(q) ||
        (s.notes ?? "").toLowerCase().includes(q),
    );
  }, [gradingScales, searchQuery]);

  // Handlers for School Institutions
  async function handleCreateSchool(input: SchoolInput): Promise<void> {
    try {
      await createSchool(input);
      showToast("School institution registered successfully.");
      setShowAddSchool(false);
      await fetchSchools();
    } catch (err) {
      console.error("Failed to add school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add school.");
    }
  }

  async function handleUpdateSchool(id: number, input: Partial<SchoolInput>): Promise<void> {
    try {
      await updateSchool(id, input);
      showToast("School institution updated successfully.");
      await fetchSchools();
    } catch (err) {
      console.error("Failed to update school:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update school.");
    }
  }

  async function handleDeleteSchool(id: number): Promise<void> {
    try {
      const res = await deleteSchool(id);
      showToast(res.message || "School institution removed successfully.");
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

  // Handlers for Grading Scales
  async function handleCreateGradingScale(input: SchoolGradingInput): Promise<void> {
    try {
      await createSchoolGrading(input);
      showToast("Grading scale added successfully.");
      setShowAddGradingScale(false);
      await fetchGradingScales();
    } catch (err) {
      console.error("Failed to add grading scale:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to add grading scale.");
    }
  }

  async function handleUpdateGradingScale(id: number, input: Partial<SchoolGradingInput>): Promise<void> {
    try {
      await updateSchoolGrading(id, input);
      showToast("Grading scale updated successfully.");
      await fetchGradingScales();
    } catch (err) {
      console.error("Failed to update grading scale:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to update grading scale.");
    }
  }

  async function handleDeleteGradingScale(id: number): Promise<void> {
    try {
      await deleteSchoolGrading(id);
      showToast("Grading scale removed successfully.");
      setSelectedGradingScale(null);
      await fetchGradingScales();
    } catch (err) {
      console.error("Failed to delete grading scale:", err);
      throw new Error(err instanceof ApiError ? err.message : "Failed to delete grading scale.");
    }
  }

  const handleOpenAdd = () => {
    if (activeTab === "schools") {
      setShowAddSchool(true);
    } else if (activeTab === "programs") {
      setShowAddProgram(true);
    } else {
      setShowAddGradingScale(true);
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
            setActiveTab(v as "schools" | "programs" | "grading-scales");
            setSearchQuery("");
          }}
          className="mt-2"
        >
          <TabsList className="bg-[#eef2f6] p-1 rounded-xl">
            <TabsTrigger
              value="schools"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-xs"
            >
              Schools ({schools.length})
            </TabsTrigger>
            <TabsTrigger
              value="programs"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-xs"
            >
              Academic Programs ({programs.length})
            </TabsTrigger>
            <TabsTrigger
              value="grading-scales"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-xs"
            >
              Grading Scales ({gradingScales.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            <SchoolTable
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
              searchQuery={searchQuery}
            />
          </TabsContent>

          <TabsContent value="grading-scales">
            <GradingTable
              schools={filteredGradingScales}
              totalCount={gradingScales.length}
              loading={loadingGradingScales}
              loadError={gradingScalesError}
              onRetry={fetchGradingScales}
              onSelect={setSelectedGradingScale}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Schools Sheets */}
      <SchoolSheet
        school={selectedSchool}
        open={!!selectedSchool}
        onOpenChange={(open) => !open && setSelectedSchool(null)}
        gradingSystems={gradingScales}
        onUpdate={handleUpdateSchool}
        onDelete={handleDeleteSchool}
      />

      <AddSchoolSheet
        open={showAddSchool}
        onOpenChange={setShowAddSchool}
        gradingSystems={gradingScales}
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

      <AddProgramSheet open={showAddProgram} onOpenChange={setShowAddProgram} onCreate={handleCreateProgram} />

      {/* Grading Scales Sheets */}
      <GradingSheet
        school={selectedGradingScale}
        onClose={() => setSelectedGradingScale(null)}
        canDelete={canManage}
        onUpdate={handleUpdateGradingScale}
        onDelete={handleDeleteGradingScale}
      />

      <AddGradingSheet
        open={showAddGradingScale}
        onOpenChange={setShowAddGradingScale}
        onCreate={handleCreateGradingScale}
      />
    </div>
  );
}
