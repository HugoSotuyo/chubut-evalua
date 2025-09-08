
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { navItems } from "@/data/menus";
import { LogOut } from "lucide-react";
import { mockLogout } from "@/context/auth-context";


interface DashboardNavProps {
  userRole: UserRole;
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole) && item.showInMenu
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={isActive(item.href)}
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
       <SidebarMenuItem className="mt-auto">
          <SidebarMenuButton
            onClick={mockLogout}
            tooltip={{
              children: "Cerrar Sesión",
              className: "bg-destructive text-destructive-foreground"
            }}
          >
            <LogOut />
            <span>Cerrar Sesión</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
