
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ellipsis, UserPlus, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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


const initialUsers = [
    { id: "usr-001", name: "Ana Gomez", role: "Docente", school: "Escuela N° 101", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user1" },
    { id: "usr-002", name: "Carlos Diaz", role: "Director", school: "Escuela N° 789", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user2" },
    { id: "usr-003", name: "Lucia Fernandez", role: "Referente", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user3" },
    { id: "usr-004", name: "Marcos Torres", role: "Docente", school: "Escuela N° 101", status: "Pendiente", avatar: "https://i.pravatar.cc/150?u=user4" },
    { id: "usr-005", name: "Sofia Reyes", role: "Administrador", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user5" },
    { id: "usr-006", name: "Evaluador Principal", role: "Evaluador", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=evaluador@chubut.edu.ar" },
];

type User = typeof initialUsers[0];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  const uniqueRoles = useMemo(() => {
    const roles = users.map(user => user.role);
    return [...new Set(roles)];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") {
      return users;
    }
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter((user) => user.id !== selectedUser.id));
    toast({
        title: "Usuario Eliminado",
        description: `El usuario ${selectedUser.name} ha sido eliminado correctamente.`,
    });
    setIsAlertOpen(false);
    setSelectedUser(null);
  };

  const handleEnableUser = (userId: string) => {
    const userToEnable = users.find((user) => user.id === userId);
    setUsers(users.map((user) => 
      user.id === userId ? { ...user, status: "Activo" } : user
    ));
    if (userToEnable) {
        toast({
            title: "Usuario Habilitado",
            description: `El usuario ${userToEnable.name} ha sido habilitado correctamente.`,
        });
    }
  };
  
  const showToast = (title: string) => {
    toast({
        title,
        description: "Esta funcionalidad estará disponible próximamente.",
    });
  }

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los roles y permisos de los usuarios del sistema.</p>
            </div>
            <Button onClick={() => showToast('Invitar Usuario')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Usuario
            </Button>
        </div>

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
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
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
