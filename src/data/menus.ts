
import type { UserRole } from "@/lib/auth";
import {
  Home,
  FileText,
  BarChart2,
  Users,
  Building,
  GraduationCap as StudentIcon,
  Shield,
  FileSignature,
  User as UserIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: UserRole[];
  showInMenu: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Inicio", roles: ["Evaluador", "Referente", "Administrador", "Director", "Docente"], showInMenu: true },
  { href: "/dashboard/examenes", icon: FileSignature, label: "Exámenes", roles: ["Evaluador", "Referente", "Director", "Docente"], showInMenu: true },
  { href: "/dashboard/resultados", icon: FileText, label: "Resultados", roles: ["Evaluador", "Referente", "Director", "Docente"], showInMenu: true },
  { href: "/dashboard/resultados/cargar", icon: FileText, label: "Cargar Resultados", roles: ["Docente"], showInMenu: false },
  { href: "/dashboard/analisis", icon: BarChart2, label: "Análisis", roles: ["Evaluador", "Referente", "Administrador", "Director", "Docente"], showInMenu: true },
  { href: "/dashboard/usuarios", icon: Users, label: "Usuarios", roles: ["Evaluador", "Administrador", "Director"], showInMenu: true },
  { href: "/dashboard/escuelas", icon: Building, label: "Escuelas", roles: ["Evaluador", "Administrador", "Referente"], showInMenu: true },
  { href: "/dashboard/alumnos", icon: StudentIcon, label: "Alumnos", roles: ["Director", "Docente"], showInMenu: true },
  { href: "/dashboard/admin", icon: Shield, label: "Admin General", roles: ["Evaluador"], showInMenu: true },
  { href: "/dashboard/perfil", icon: UserIcon, label: "Mi Perfil", roles: ["Evaluador", "Referente", "Administrador", "Director", "Docente"], showInMenu: false },
];
