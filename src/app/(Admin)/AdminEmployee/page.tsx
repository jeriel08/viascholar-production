"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { useSocketEvent } from "@/contexts/SocketContext";
import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/api/auth";
import { createStaff, listUsers, resetPassword, updateUserStatus } from "@/lib/api/users";
import { addEmployeeSchema } from "@/lib/validation";
import { AddEmployeeSheet } from "./components/AddEmployeeSheet";
import { EmployeeHeader } from "./components/EmployeeHeader";
import { EmployeeResetPasswordDialog } from "./components/EmployeeResetPasswordDialog";
import { EmployeeSheet } from "./components/EmployeeSheet";
import { EmployeeTable } from "./components/EmployeeTable";
import {
  type AddEmployeeFields,
  EMPLOYEE_FILTERS,
  type EmployeeFilter,
  INITIAL_ADD_FIELDS,
  type StaffRow,
  toStaffRow,
} from "./components/employee-helpers";

export default function AdminEmployeePage() {
  const { showToast } = useToast();

  const [filter, setFilter] = useState<EmployeeFilter>("All");
  const [selected, setSelected] = useState<StaffRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [addFields, setAddFields] = useState<AddEmployeeFields>(INITIAL_ADD_FIELDS);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const users = await listUsers();
      setStaff(users.filter((u) => u.employee).map(toStaffRow));
      setPage(1);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setLoadError(err instanceof ApiError ? err.message : "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Real-time socket events for admin staff management
  useSocketEvent("staff:created", fetchStaff);
  useSocketEvent("user:status_updated", fetchStaff);
  useSocketEvent("user:password_reset", fetchStaff);

  const filtered = staff.filter((e) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesType = filter === "All" || e.type === filter;
    const matchesSearch =
      q === "" ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts: Record<EmployeeFilter, number> = {
    All: staff.length,
    Coordinator: staff.filter((e) => e.type === "Coordinator").length,
    Grantor: staff.filter((e) => e.type === "Grantor").length,
  };

  const hasActiveFilters = filter !== "All" || searchQuery.trim() !== "";

  const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = addEmployeeSchema.safeParse(addFields);
    if (!result.success) {
      setAddError(result.error.issues[0]?.message ?? "Please check all required fields.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      await createStaff(addFields);
      showToast("Employee account created successfully.");
      setShowAddModal(false);
      setAddFields(INITIAL_ADD_FIELDS);
      await fetchStaff();
    } catch (err) {
      console.error("Failed to add employee:", err);
      setAddError(err instanceof ApiError ? err.message : "Failed to add employee.");
    } finally {
      setAdding(false);
    }
  };

  const handleDirectResetPassword = async (employeeId: number, newPass: string) => {
    setActing(true);
    setActionError("");
    try {
      await resetPassword(employeeId, newPass);
      showToast("Employee password updated successfully.");
    } catch (err) {
      console.error("Failed to reset password:", err);
      setActionError(err instanceof ApiError ? err.message : "Failed to reset password.");
    } finally {
      setActing(false);
    }
  };

  const handleSendResetEmail = async (email: string) => {
    setActing(true);
    setActionError("");
    try {
      await requestPasswordReset(email);
      showToast("Password reset email sent successfully.");
    } catch (err) {
      console.error("Failed to send reset email:", err);
      setActionError(err instanceof ApiError ? err.message : "Failed to send reset email.");
    } finally {
      setActing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selected) return;
    const target = !selected.user.is_active;
    setActing(true);
    setActionError("");
    try {
      await updateUserStatus(selected.id, target);
      showToast(target ? "Employee account activated." : "Employee account deactivated.");
      setSelected(null);
      await fetchStaff();
    } catch (err) {
      console.error("Failed to update employee status:", err);
      setActionError(err instanceof ApiError ? err.message : "Failed to update employee status.");
    } finally {
      setActing(false);
    }
  };

  const closeSheet = () => {
    setSelected(null);
    setActionError("");
  };

  return (
    <div className="min-h-full bg-[#faf8f5]">
      <EmployeeHeader
        searchQuery={searchQuery}
        onSearchChange={(v) => {
          setSearchQuery(v);
          setPage(1);
        }}
        onAdd={() => setShowAddModal(true)}
        filter={{
          value: filter,
          onChange: (value) => {
            setFilter(value as EmployeeFilter);
            setPage(1);
          },
          options: EMPLOYEE_FILTERS.map((value) => ({
            value,
            label: `${value} (${counts[value]})`,
          })),
          hasActive: hasActiveFilters,
          onClear: () => {
            setFilter("All");
            setSearchQuery("");
            setPage(1);
          },
        }}
      />

      <div className="px-5 pb-24 md:px-10">
        <EmployeeTable
          employees={paginated}
          totalFiltered={filtered.length}
          loading={loading}
          loadError={loadError}
          onRetry={fetchStaff}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setFilter("All");
            setSearchQuery("");
            setPage(1);
          }}
          onSelect={setSelected}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <EmployeeSheet
        employee={selected}
        onClose={closeSheet}
        onOpenResetPassword={() => setResetDialogOpen(true)}
        acting={acting}
        actionError={actionError}
        onToggleStatus={handleToggleStatus}
      />

      <EmployeeResetPasswordDialog
        employee={selected}
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onDirectReset={handleDirectResetPassword}
        onSendResetEmail={handleSendResetEmail}
        acting={acting}
        actionError={actionError}
      />

      <AddEmployeeSheet
        open={showAddModal}
        onOpenChange={setShowAddModal}
        fields={addFields}
        onFieldsChange={setAddFields}
        adding={adding}
        addError={addError}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}
