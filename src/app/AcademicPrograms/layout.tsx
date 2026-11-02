"use client";

import type React from "react";
import { GlobalStyles, s } from "@/components/Adminshared";
import { AppSidebar } from "@/components/app-sidebar/AppSidebar";
import { RoleGuard } from "@/components/RoleGuard";
import { SidebarContext } from "@/components/SidebarContext";
import { SidebarInset, SidebarProvider, useSidebar as useShadcnSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

function SidebarBridge({ children }: { children: React.ReactNode }) {
  const { openMobile, toggleSidebar, setOpenMobile } = useShadcnSidebar();
  return (
    <SidebarContext.Provider
      value={{
        mobileOpen: openMobile,
        toggleMobile: toggleSidebar,
        closeMobile: () => setOpenMobile(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export default function AcademicProgramsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const rawRole = (user?.role || "").toLowerCase();
  const sidebarRole = rawRole === "grantor" ? "grantor" : rawRole === "coordinator" ? "coordinator" : "admin";

  return (
    <RoleGuard allowedRoles={["ADMIN", "COORDINATOR", "GRANTOR"]}>
      <SidebarProvider>
        <SidebarBridge>
          <div className="flex min-h-svh w-full bg-[#FAF8F5]">
            <GlobalStyles />
            <AppSidebar role={sidebarRole} />
            <SidebarInset className="flex min-w-0 flex-1 flex-col bg-[#FAF8F5]">
              <main className="flex-1 overflow-y-auto" style={s.main}>
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarBridge>
      </SidebarProvider>
    </RoleGuard>
  );
}

