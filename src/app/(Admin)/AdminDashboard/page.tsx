"use client";

import { type FormEvent, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/api/auth";
import { createStaff, resetPassword } from "@/lib/api/users";
import { addEmployeeSchema, getPasswordError } from "@/lib/validation";
import { AddEmployeeSheet } from "../AdminEmployee/components/AddEmployeeSheet";
import { EmployeeResetPasswordDialog } from "../AdminEmployee/components/EmployeeResetPasswordDialog";
import {
  type AddEmployeeFields,
  INITIAL_ADD_FIELDS,
  type StaffRow,
} from "../AdminEmployee/components/employee-helpers";
import { AdminDashboardHeader } from "./components/AdminDashboardHeader";
import { AdminDashboardSkeleton } from "./components/AdminDashboardSkeleton";
import { AdminGradingOverviewCard } from "./components/AdminGradingOverviewCard";
import { AdminKpiCards } from "./components/AdminKpiCards";
import { AdminQuickActions } from "./components/AdminQuickActions";
import { AdminRecentAuditFeed } from "./components/AdminRecentAuditFeed";
import { AdminStaffOverviewCard } from "./components/AdminStaffOverviewCard";
import { useAdminDashboardData } from "./hooks/useAdminDashboardData";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state for quick actions
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [addFields, setAddFields] = useState<AddEmployeeFields>(INITIAL_ADD_FIELDS);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [addEmployeeError, setAddEmployeeError] = useState("");

  const [selectedEmployeeForReset, setSelectedEmployeeForReset] = useState<StaffRow | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetActing, setResetActing] = useState(false);
  const [resetActionError, setResetActionError] = useState("");

  const { loading, loadError, metrics, staff, recentLogs, schools, refetch } = useAdminDashboardData();

  // Handle Add Employee Form Submit
  const handleAddEmployeeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = addEmployeeSchema.safeParse(addFields);
    if (!result.success) {
      setAddEmployeeError(result.error.issues[0]?.message ?? "Please check all required fields.");
      return;
    }
    setAddingEmployee(true);
    setAddEmployeeError("");
    try {
      await createStaff(addFields);
      showToast(`${addFields.first_name} ${addFields.last_name} added successfully.`);
      setShowAddEmployeeModal(false);
      setAddFields(INITIAL_ADD_FIELDS);
      await refetch(true);
    } catch (err) {
      console.error("Failed to create employee:", err);
      setAddEmployeeError(err instanceof ApiError ? err.message : "Failed to create employee.");
    } finally {
      setAddingEmployee(false);
    }
  };

  // Handle Direct Reset Password
  const handleDirectReset = async (employeeId: number, newPass: string) => {
    const err = getPasswordError(newPass);
    if (err) {
      setResetActionError(err);
      return;
    }
    setResetActing(true);
    setResetActionError("");
    try {
      await resetPassword(employeeId, newPass);
      showToast("Password has been reset successfully.");
      setResetDialogOpen(false);
      setSelectedEmployeeForReset(null);
      await refetch(true);
    } catch (e) {
      console.error("Failed to reset password:", e);
      setResetActionError(e instanceof ApiError ? e.message : "Failed to reset password.");
    } finally {
      setResetActing(false);
    }
  };

  // Handle Send Reset Email
  const handleSendResetEmail = async (email: string) => {
    setResetActing(true);
    setResetActionError("");
    try {
      await requestPasswordReset(email);
      showToast(`Password reset link sent to ${email}.`);
    } catch (e) {
      console.error("Failed to send reset email:", e);
      setResetActionError(e instanceof ApiError ? e.message : "Failed to send reset email.");
      throw e;
    } finally {
      setResetActing(false);
    }
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-full bg-[#faf8f5]">
      {/* Consistent Page Header */}
      <AdminDashboardHeader searchValue={searchQuery} onSearchChange={setSearchQuery} />

      <div className="px-3.5 sm:px-5 md:px-10 pb-24 space-y-5 mt-5">
        {loadError ? (
          <Card className="rounded-[18px]! shadow-va-sm">
            <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
              <p className="text-base font-semibold">Could not load admin dashboard</p>
              <p className="text-sm text-muted-foreground">{loadError}</p>
              <Button type="button" className="h-11 px-5 text-sm!" onClick={() => refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 1. System Platform KPIs */}
            <AdminKpiCards metrics={metrics} />

            {/* 2. Admin Quick Operations Hub */}
            <AdminQuickActions
              onOpenAddEmployee={() => {
                setAddFields(INITIAL_ADD_FIELDS);
                setAddEmployeeError("");
                setShowAddEmployeeModal(true);
              }}
            />

            {/* 3. Real-Time System Activity Feed */}
            <AdminRecentAuditFeed logs={recentLogs} />

            {/* 4. Operational Breakdown: Staff Directory & University Grading Systems */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AdminStaffOverviewCard
                staff={staff}
                onOpenResetPassword={(emp) => {
                  setSelectedEmployeeForReset(emp);
                  setResetActionError("");
                  setResetDialogOpen(true);
                }}
              />

              <AdminGradingOverviewCard schools={schools} />
            </div>
          </>
        )}
      </div>

      {/* Quick Action Modal: Add Employee */}
      <AddEmployeeSheet
        open={showAddEmployeeModal}
        onOpenChange={setShowAddEmployeeModal}
        fields={addFields}
        onFieldsChange={setAddFields}
        adding={addingEmployee}
        addError={addEmployeeError}
        onSubmit={handleAddEmployeeSubmit}
      />

      {/* Quick Action Modal: Reset Password Dialog */}
      <EmployeeResetPasswordDialog
        employee={selectedEmployeeForReset}
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        onDirectReset={handleDirectReset}
        onSendResetEmail={handleSendResetEmail}
        acting={resetActing}
        actionError={resetActionError}
      />
    </div>
  );
}
