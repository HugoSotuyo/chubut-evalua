"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  BarChart2,
  Users,
  Building,
  GraduationCap as StudentIcon,
  Settings,
  Shield,
  FileSignature,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Inicio", roles: ["Evaluador", "Referente", "Administrador", "Director", "Docente"] },
  { href: "/dashboard/examenes", icon: FileSignature, label: "Exámenes", roles: ["Evaluador", "Referente", "Director", "Docente"] },
  { href: "/dashboard/resultados", icon: FileText, label: "Resultados", roles: ["Evaluador", "Referente", "Director", "Docente"] },
  { href: "/dashboard/analisis", icon: BarChart2, label: "Análisis", roles: ["Evaluador", "Referente", "Administrador", "Director"] },
  { href: "/dashboard/usuarios", icon: Users, label: "Usuarios", roles: ["Evaluador", "Administrador", "Director"] },
  { href: "/dashboard/escuelas", icon: Building, label: "Escuelas", roles: ["Evaluador", "Administrador"] },
  { href: "/dashboard/alumnos", icon: StudentIcon, label: "Alumnos", roles: ["Director", "Docente"] },
  { href: "/dashboard/admin", icon: Shield, label: "Admin General", roles: ["Evaluador"] },
];

interface DashboardNavProps {
  userRole: UserRole;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={{
                children: item.label,
                className: "bg-primary text-primary-foreground"
              }}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
