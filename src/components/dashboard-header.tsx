
"use client"

import Link from "next/link";
import {
  Bell,
  CircleUser,
  HelpCircle,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarTrigger } from "./ui/sidebar";
import { useSearch } from "@/context/search-context";
import { usePathname } from "next/navigation";
import { RoleIcon } from "./role-icon";
import { mockLogout } from "@/context/auth-context";
import type { User } from "@/context/users-context";
import { useUsers } from "@/context/users-context";
import { useMemo } from "react";
import { useState } from "react";


interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userInitials = user.name.split(' ').map(n => n[0]).join('');
  const { searchTerm, setSearchTerm } = useSearch();
  const pathname = usePathname();
  const { users } = useUsers();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const evaluatorEmail = useMemo(() => {
    const evaluator = users.find(u => u.role === 'Evaluador');
    return evaluator ? evaluator.email : 'soporte@chubut.edu.ar';
  }, [users]);
  
  const searchPlaceholder = useMemo(() => {
    if (pathname.startsWith('/dashboard/examenes')) {
      return "Buscar examen...";
    }
    if (pathname.startsWith('/dashboard/usuarios')) {
        return "Buscar usuarios...";
    }
    if (pathname.startsWith('/dashboard/alumnos')) {
        return "Buscar alumnos...";
    }
     if (pathname.startsWith('/dashboard/escuelas')) {
        return "Buscar escuelas...";
    }
    return "Buscar...";
  }, [pathname]);

  const showSearch = ![
    '/dashboard/analisis',
    '/dashboard/perfil',
    '/dashboard/admin',
    '/dashboard/roles'
    ].includes(pathname) && !pathname.includes('/dashboard/examenes/crear');


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
       <SidebarTrigger className="flex" />
      <div className="w-full flex-1">
        {showSearch && (
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full">
                <RoleIcon role={user.role} className="h-6 w-6" />
            </div>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/perfil">Mi Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsSupportOpen(true)}>
            Soporte
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={mockLogout}>
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

       <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <HelpCircle className="h-8 w-8 text-primary" />
              <DialogTitle className="text-2xl">Contacto de Soporte</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="py-4 text-base text-center">
            Para cualquier consulta o problema con la plataforma, por favor contacta a:
          </DialogDescription>
          <div className="rounded-md bg-muted p-3 text-center">
            <a href={`mailto:${evaluatorEmail}`} className="text-lg font-semibold text-primary underline">
              {evaluatorEmail}
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
