
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ellipsis, UserPlus, Filter, FileDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSearch } from "@/context/search-context";
import { useUsers } from "@/context/users-context";
import type { User } from "@/context/users-context";
import { RoleIcon } from "@/components/role-icon";
import { useAuth } from "@/context/auth-context";

export default function UsuariosPage() {
  const { users, deleteUser, enableUser } = useUsers();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const { searchTerm } = useSearch();
  const { user } = useAuth();

  const uniqueRoles = useMemo(() => {
    const roles = users.map(user => user.role);
    return [...new Set(roles)];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!user) return [];
    let results = users;

    // Role-based pre-filtering
    if (user.role === "Director") {
        results = results.filter(u => u.school === user.school && u.role === "Docente");
    } else if (user.role !== "Evaluador") { // Evaluador skips UI role filter
      if (roleFilter !== "all") {
        results = results.filter(user => user.role === roleFilter);
      }
    }
    
    // Search term filtering (applies to all)
    if (searchTerm) {
      results = results.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return results;
  }, [users, roleFilter, searchTerm, user]);

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser.id);
    toast({
        title: "Usuario Eliminado",
        description: `El usuario ${selectedUser.name} ha sido eliminado correctamente.`,
    });
    setIsAlertOpen(false);
    setSelectedUser(null);
  };

  const handleEnableUser = (userId: string) => {
    const userToEnable = users.find((user) => user.id === userId);
    if (!userToEnable) return;
    
    enableUser(userId);
    
    toast({
        title: "Usuario Habilitado",
        description: `El usuario ${userToEnable.name} ha sido habilitado correctamente.`,
    });
  };
  
  const showToast = (title: string) => {
    toast({
        title,
        description: "Esta funcionalidad estará disponible próximamente.",
    });
  }

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Rol", "Escuela", "Estado"];
    const rows = filteredUsers.map(user => 
        [user.id, user.name, user.role, user.school, user.status].join(';')
    );
    
    // BOM para compatibilidad con Excel
    const bom = "\uFEFF";
    const csvContent = bom + [headers.join(';'), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "usuarios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return <div>Cargando...</div>;
  }
  
  const showRoleFilter = user.role !== "Director" && user.role !== "Evaluador";

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los roles y permisos de los usuarios del sistema.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => showToast('Invitar Usuario')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invitar Usuario
                </Button>
                <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Usuarios
                </Button>
            </div>
        </div>
        
        {showRoleFilter && (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle>Filtrar por Rol</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role-filter">Rol</Label>
                            <Select onValueChange={setRoleFilter} value={roleFilter}>
                                <SelectTrigger id="role-filter">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Roles</SelectItem>
                                    {uniqueRoles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>Lista de todos los usuarios con acceso a la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Escuela</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center">
                                        <RoleIcon role={user.role} />
                                    </div>
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.school}</TableCell>
                             <TableCell>
                                <Badge variant={user.status === "Pendiente" ? "secondary" : (user.status === "Activo" ? "default" : "destructive")}>{user.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <Ellipsis className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        {user.status === "Pendiente" && <DropdownMenuItem onSelect={() => handleEnableUser(user.id)}>Habilitar Usuario</DropdownMenuItem>}
                                        <DropdownMenuItem onSelect={() => showToast('Editar Usuario')}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => showToast('Cambiar Contraseña')}>Cambiar Contraseña</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(user)}>Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que deseas eliminar a este usuario?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente al usuario
                        <span className="font-bold"> {selectedUser?.name}</span> y todos sus datos asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
