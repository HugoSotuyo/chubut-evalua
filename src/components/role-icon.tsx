
"use client"

import { Shield, Building, GraduationCap, BookUser, User as UserIcon } from "lucide-react";
import type { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface RoleIconProps {
  role: UserRole;
  className?: string;
}

export function RoleIcon({ role, className }: RoleIconProps) {
  const iconProps = {
    className: cn("h-5 w-5 text-muted-foreground", className),
  };

  switch (role) {
    case "Evaluador":
      return <Shield {...iconProps} />;
    case "Administrador":
      return <Building {...iconProps} />;
    case "Director":
      return <GraduationCap {...iconProps} />;
    case "Referente":
      return <BookUser {...iconProps} />;
    case "Docente":
      return <UserIcon {...iconProps} />;
    default:
      return <UserIcon {...iconProps} />;
  }
}
