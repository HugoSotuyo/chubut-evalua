import type { UserRole } from "@/lib/auth";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  school: string;
  status: "Activo" | "Pendiente" | "Inactivo";
  grade?: string;
  course?: string;
};
