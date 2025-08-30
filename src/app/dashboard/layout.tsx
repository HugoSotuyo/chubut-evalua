import { getMockUser } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav } from "@/components/dashboard-nav";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { GraduationCap } from "lucide-react";
import { SearchProvider } from "@/context/search-context";
import { ExamsProvider } from "@/context/exams-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getMockUser();

  return (
    <SearchProvider>
      <ExamsProvider>
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
      </ExamsProvider>
    </SearchProvider>
  );
}
