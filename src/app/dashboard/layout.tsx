
"use client";

import { getMockUser } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getMockUser());
  }, []);

  if (!user) {
    return <div>Cargando...</div>; 
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user } as { user: User });
    }
    return child;
  });

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
              {childrenWithProps}
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}
