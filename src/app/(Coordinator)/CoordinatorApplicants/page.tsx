"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Applicant, Stage } from "@/components/Coordinatorshared";
import { MeetingSafeguardDialog } from "@/components/MeetingSafeguardDialog";
import { useSocketEvent } from "@/contexts/SocketContext";
import { ApiError } from "@/lib/api";
import { listApplications, updateStage } from "@/lib/api/applications";
import { listContracts } from "@/lib/api/contracts";
import { ApplicantDialog } from "./components/ApplicantDialog";
import { ApplicantsHeader } from "./components/ApplicantsHeader";
import { ApplicantsTable } from "./components/ApplicantsTable";
import {
  mapApplicationToApplicant,
  matchesQuery,
  resolveDisplayStage,
  STAGE_FILTERS,
  type StageFilter,
  stageToUpdatePayload,
} from "./components/applicant-helpers";

const PAGE_SIZE = 8;

export default function ApplicantsPage() {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [safeguardState, setSafeguardState] = useState<{
    open: boolean;
    id: number;
    stage: Stage;
    rejectionReason?: string;
  }>({
    open: false,
    id: 0,
    stage: "Accepted",
  });

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [rows, contracts] = await Promise.all([listApplications(), listContracts().catch(() => [])]);
      const contractsByProfileId = new Map(contracts.map((c) => [c.scholar_profile_id, c]));

      // Hide the applicant only if they are ACCEPTED and their contract is already SIGNED
      // (signing promotes them to Scholar and transitions them to the Scholars Monitor).
      // If their contract is PENDING, they are in the "Contract Signing" stage and must remain visible.
      const activeRows = rows.filter((r) => {
        const isAccepted = r.status === "APPROVED" || r.stage.trim().toLowerCase() === "accepted";
        const matchingContract =
          contractsByProfileId.get(r.scholar_profile_id) ??
          r.scholar_profile?.contracts?.[0];
        const isSigned = matchingContract?.status === "SIGNED";
        return !(isAccepted && isSigned);
      });
      const mapped = activeRows.map((r) =>
        mapApplicationToApplicant(r, contractsByProfileId.get(r.scholar_profile_id)),
      );
      setApplicants(mapped);
      setSelected((prev) => (prev ? (mapped.find((a) => a.id === prev.id) ?? null) : null));
    } catch (err) {
      console.error("Failed to load applicants:", err);
      setLoadError(err instanceof ApiError ? err.message : "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Real-time updates for coordinator application table
  useSocketEvent("application:submitted", () => fetchApplicants());
  useSocketEvent("document:confirmed_by_applicant", () => fetchApplicants());
  useSocketEvent("application:stage_updated", () => fetchApplicants());
  useSocketEvent("contract:created", () => fetchApplicants());
  useSocketEvent("contract:signed", () => fetchApplicants());

  const filtered = useMemo(() => {
    return applicants.filter((a) => {
      if (stageFilter !== "all" && a.stage !== stageFilter) return false;
      return matchesQuery(a, query);
    });
  }, [applicants, query, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasActiveFilters = query.trim() !== "" || stageFilter !== "all";

  function resetFilters() {
    setQuery("");
    setStageFilter("all");
    setPage(1);
  }

  // Applied when a document verify moves the application (backend writes the
  // new stage on verify) without a full refetch.
  function updateApplicantStage(id: number, stage: Stage) {
    const mapped = (prev: Applicant) => (prev.id === id ? { ...prev, stage } : prev);
    setApplicants((prev) => prev.map(mapped));
    setSelected((sel) => (sel && sel.id === id ? mapped(sel) : sel));
  }

  async function moveStage(id: number, stage: Stage, rejectionReason?: string, confirmWithoutMeeting = false) {
    setActing(true);
    setActionError(null);
    try {
      const payload = {
        ...stageToUpdatePayload(stage, rejectionReason),
        confirm_without_meeting: confirmWithoutMeeting,
      };
      const updated = await updateStage(id, payload);
      const mapped = (prev: Applicant) =>
        prev.id === id ? { ...prev, stage: resolveDisplayStage(updated.status, updated.stage) } : prev;
      setApplicants((prev) => prev.map(mapped));
      setSelected((sel) => (sel && sel.id === id ? mapped(sel) : sel));
      setSafeguardState((prev) => ({ ...prev, open: false }));
    } catch (err) {
      if (err instanceof ApiError && err.requiresMeetingConfirmation) {
        setSafeguardState({
          open: true,
          id,
          stage,
          rejectionReason,
        });
        return;
      }
      console.error("Failed to move stage:", err);
      setActionError(err instanceof ApiError ? err.message : "Failed to update stage.");
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="min-h-full bg-[#faf8f5]">
      <ApplicantsHeader
        searchQuery={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        filter={{
          value: stageFilter,
          onChange: (v) => {
            setStageFilter(v as StageFilter);
            setPage(1);
          },
          options: STAGE_FILTERS,
          label: "Filter by stage",
          hasActive: stageFilter !== "all",
          onClear: () => {
            setStageFilter("all");
            setPage(1);
          },
        }}
      />
      <div className="px-5 pb-24 md:px-10">
        <div className="mt-4 flex h-10 items-center gap-2 rounded-full border border-line bg-tint px-3.5 md:hidden">
          <input
            type="text"
            placeholder="Search name, track, stage..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-[0.82rem] outline-none placeholder:text-[#9a9a94]"
            aria-label="Search applicants"
          />
        </div>
        <ApplicantsTable
          applicants={paginated}
          totalFiltered={filtered.length}
          loading={loading}
          loadError={loadError}
          onRetry={fetchApplicants}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={resetFilters}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          onSelect={(a) => {
            setSelected(a);
            setActionError(null);
          }}
        />
      </div>
      <ApplicantDialog
        applicant={selected}
        acting={acting}
        actionError={actionError}
        onClose={() => {
          setSelected(null);
          setActionError(null);
        }}
        onMoveStage={moveStage}
        onStagesChanged={updateApplicantStage}
        onMeetingScheduled={fetchApplicants}
      />
      <MeetingSafeguardDialog
        open={safeguardState.open}
        onOpenChange={(open) => setSafeguardState((prev) => ({ ...prev, open }))}
        loading={acting}
        onConfirm={() => moveStage(safeguardState.id, safeguardState.stage, safeguardState.rejectionReason, true)}
      />
    </div>
  );
}
