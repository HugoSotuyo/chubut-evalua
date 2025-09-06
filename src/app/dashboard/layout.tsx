
"use client";

import * as React from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { SearchProvider } from "@/context/search-context";
import { SchoolsProvider } from "@/context/schools-context";
import { UsersProvider } from "@/context/users-context";
import { StudentsProvider } from "@/context/students-context";
import { ResultsProvider } from "@/context/results-context";
import { ExamsProvider } from "@/context/exams-context";

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
    }

    if (!user) {
        // This can be a more elaborate error component
        return <div className="flex h-screen w-full items-center justify-center">Error: Usuario no autenticado. Por favor, inicie sesión.</div>;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar>
                    <SidebarContent>
                        <SidebarHeader>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="size-6 text-primary" />
                                <span className="text-lg font-semibold font-headline">Chubut evalúa</span>
                            </div>
                        </SidebarHeader>
                        <DashboardNav userRole={user.role} />
                    </SidebarContent>
                </Sidebar>
                <div className="flex flex-col flex-1">
                    <DashboardHeader user={user} />
                    <main className="flex-1 p-4 md:p-8 pt-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <UsersProvider>
        <SchoolsProvider>
          <SearchProvider>
            <ExamsProvider>
              <StudentsProvider>
                <ResultsProvider>
                  <DashboardLayoutContent>{children}</DashboardLayoutContent>
                </ResultsProvider>
              </StudentsProvider>
            </ExamsProvider>
          </SearchProvider>
        </SchoolsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}
