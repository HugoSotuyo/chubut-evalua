
"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/auth-context";

function DashboardNavAndHeader() {
  const { user } = useAuth();

  if (!user) {
    return null; 
  }

  return (
    <>
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
          <InnerLayout>{null}</InnerLayout>
        </main>
      </div>
    </>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <div>Error: Usuario no encontrado.</div>
    }

    return <>{children}</>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
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
                        <DashboardNavWithAuth />
                    </SidebarContent>
                </Sidebar>
                <div className="flex flex-col flex-1">
                    <DashboardHeaderWithAuth />
                    <main className="flex-1 p-4 md:p-8 pt-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    </AuthProvider>
  );
}

function DashboardNavWithAuth() {
    const { user } = useAuth();
    if (!user) return null;
    return <DashboardNav userRole={user.role} />;
}

function DashboardHeaderWithAuth() {
    const { user } = useAuth();
    if (!user) return null;
    return <DashboardHeader user={user} />;
}
