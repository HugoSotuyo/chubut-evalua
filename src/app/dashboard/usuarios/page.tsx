

"use client"

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Ellipsis, UserPlus, Filter, FileDown, Eye, Edit, KeyRound } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSearch } from "@/context/search-context";
import { useUsers } from "@/context/users-context";
import type { User } from "@/context/users-context";
import { RoleIcon } from "@/components/role-icon";
import { useAuth } from "@/context/auth-context";
import { useSchools } from "@/context/schools-context";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/auth";
import type { School } from "@/lib/types";
import { useSettings } from "@/context/settings-context";


export default function UsuariosPage() {
  const { users, deleteUser, enableUser, updateUser, updateUserPassword } = useUsers();
  const { schools } = useSchools();
  const { settings } = useSettings();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [filters, setFilters] = useState({
    role: "all",
    school: "all",
    grade: "all",
    course: "all",
    schoolYear: settings.currentSchoolYear || "all",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { toast } = useToast();
  const { searchTerm } = useSearch();
  const { user: currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When school year filter changes, reset other filters
  useEffect(() => {
    setFilters(prev => ({
        ...prev,
        role: "all",
        school: currentUser?.role === 'Director' ? prev.school : "all",
        grade: "all",
        course: "all",
    }));
  }, [filters.schoolYear, currentUser?.role]);

  const usersForFilterOptions = useMemo(() => {
    if (filters.schoolYear === 'all') {
        return users;
    }
    return users.filter(u => u.schoolYear === filters.schoolYear);
  }, [users, filters.schoolYear]);

  const uniqueRoles = useMemo(() => {
    const roles = usersForFilterOptions.map(user => user.role);
    return [...new Set(roles)].filter(role => role !== 'Evaluador');
  }, [usersForFilterOptions]);
  
  const uniqueSchools = useMemo(() => {
    const schoolNames = usersForFilterOptions.map(user => user.school).filter(Boolean);
    return [...new Set(schoolNames)].sort();
  }, [usersForFilterOptions]);

  const uniqueGrades = useMemo(() => {
    const grades = usersForFilterOptions.map(user => user.grade).filter(Boolean);
    return [...new Set(grades)].sort();
  }, [usersForFilterOptions]);

  const uniqueCourses = useMemo(() => {
    const courses = usersForFilterOptions.map(user => user.course).filter(Boolean);
    return [...new Set(courses)].sort();
  }, [usersForFilterOptions]);

  const uniqueSchoolYears = useMemo(() => {
    return [...new Set(users.map(u => u.schoolYear).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];

    let results: User[] = users;

    if (currentUser.role === "Director") {
        results = users.filter(u => u.school === currentUser.school && u.role === "Docente");
        if (appliedFilters.schoolYear !== "all") {
             results = results.filter(u => u.schoolYear === appliedFilters.schoolYear);
        }
         if (appliedFilters.grade !== "all") {
            results = results.filter(u => u.grade === appliedFilters.grade);
        }
        if (appliedFilters.course !== "all") {
            results = results.filter(u => u.course === appliedFilters.course);
        }

    } else {
       if (appliedFilters.role !== "all") {
            results = results.filter(u => u.role === appliedFilters.role);
        }
        if (appliedFilters.school !== "all") {
            results = results.filter(u => u.school === appliedFilters.school);
        }
        if (appliedFilters.grade !== "all") {
            results = results.filter(u => u.grade === appliedFilters.grade);
        }
        if (appliedFilters.course !== "all") {
            results = results.filter(u => u.course === appliedFilters.course);
        }
        if (appliedFilters.schoolYear !== "all") {
            results = results.filter(u => u.schoolYear === appliedFilters.schoolYear);
        }
    }
    
    if (searchTerm) {
      results = results.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const finalResults = results.filter(u => u.role !== 'Evaluador');

    if (currentUser.role === 'Director') {
      const getGradeNumber = (grade: string | undefined): number => {
        if (!grade) return Infinity;
        const match = grade.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
      };
      finalResults.sort((a, b) => getGradeNumber(a.grade) - getGradeNumber(b.grade));
    }

    return finalResults;
  }, [users, appliedFilters, searchTerm, currentUser]);
  
  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  };
  
  const handleOpenProfileDialog = (user: User) => {
    setSelectedUser(user);
    setIsProfileDialogOpen(true);
  }

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }

  const handleOpenChangePasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsChangePasswordDialogOpen(true);
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser.id);
      toast({
          title: "Usuario Eliminado",
          description: `El usuario ${selectedUser.name} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar al usuario. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
      setIsAlertOpen(false);
      setSelectedUser(null);
    }
  };

  const handleEnableUser = async (userId: string) => {
    const userToEnable = users.find((user) => user.id === userId);
    if (!userToEnable || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await enableUser(userId);
      toast({
          title: "Usuario Habilitado",
          description: `El usuario ${userToEnable.name} ha sido habilitado correctamente.`,
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error al Habilitar",
        description: "No se pudo actualizar el estado del usuario. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const showToast = (title: string) => {
    toast({
        title,
        description: "Esta funcionalidad estará disponible próximamente.",
    });
  }

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Rol", "Escuela", "Estado", "Grado", "Curso", "Ciclo Lectivo"];
    const rows = filteredUsers.map(user => 
        [user.id, user.name, user.role, user.school, user.status, user.grade || '', user.course || '', user.schoolYear || ''].join(';')
    );
    
    const bom = "﻿";
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

  if (!currentUser) {
    return <div>Cargando...</div>;
  }
  
  const showAdvancedFilters = ['Evaluador', 'Administrador', 'Referente', 'Director'].includes(currentUser.role);
  const isEvaluator = currentUser.role === 'Evaluador';

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los roles y permisos de los usuarios del sistema.</p>
            </div>
            {currentUser.role !== 'Director' && (
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleExport}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Exportar Usuarios
                  </Button>
              </div>
            )}
        </div>
        
        {showAdvancedFilters && (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Filtros</CardTitle>
                        </div>
                        <Button onClick={handleApplyFilters}>
                            <Filter className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                        </Button>
                    </div>
                    <CardDescription>Filtra la lista de usuarios por diferentes criterios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="school-year-filter">Ciclo Lectivo</Label>
                            <Select onValueChange={(v) => handleFilterChange("schoolYear", v)} value={filters.schoolYear}>
                                <SelectTrigger id="school-year-filter">
                                    <SelectValue placeholder="Seleccionar ciclo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Ciclos</SelectItem>
                                    {uniqueSchoolYears.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {currentUser.role !== 'Director' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="role-filter">Rol</Label>
                                    <Select onValueChange={(v) => handleFilterChange("role", v)} value={filters.role}>
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
                                <div className="grid gap-2">
                                    <Label htmlFor="school-filter">Escuela</Label>
                                    <Select onValueChange={(v) => handleFilterChange("school", v)} value={filters.school}>
                                        <SelectTrigger id="school-filter">
                                            <SelectValue placeholder="Seleccionar escuela" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas las Escuelas</SelectItem>
                                            {uniqueSchools.map(school => (
                                                <SelectItem key={school} value={school}>{school}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="grade-filter">Grado</Label>
                            <Select onValueChange={(v) => handleFilterChange("grade", v)} value={filters.grade}>
                                <SelectTrigger id="grade-filter">
                                    <SelectValue placeholder="Seleccionar grado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Grados</SelectItem>
                                    {uniqueGrades.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="course-filter">Curso</Label>
                            <Select onValueChange={(v) => handleFilterChange("course", v)} value={filters.course}>
                                <SelectTrigger id="course-filter">
                                    <SelectValue placeholder="Seleccionar curso" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los Cursos</SelectItem>
                                    {uniqueCourses.map(course => (
                                        <SelectItem key={course} value={course}>{course}</SelectItem>
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
                <CardTitle>{currentUser.role === 'Director' ? 'Docentes de mi Escuela' : 'Usuarios Registrados'}</CardTitle>
                <CardDescription>{currentUser.role === 'Director' ? 'Lista de todos los docentes con acceso a tu escuela.' : 'Lista de todos los usuarios con acceso a la plataforma.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Escuela</TableHead>
                            <TableHead>Grado</TableHead>
                            <TableHead>Curso</TableHead>
                            <TableHead>Ciclo Lectivo</TableHead>
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
                            <TableCell>{user.grade || "-"}</TableCell>
                            <TableCell>{user.course || "-"}</TableCell>
                            <TableCell>{user.schoolYear || "-"}</TableCell>
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
                                        <DropdownMenuItem onSelect={() => handleOpenProfileDialog(user)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver Perfil
                                        </DropdownMenuItem>
                                        {user.status === "Pendiente" && (currentUser.role === 'Evaluador' || currentUser.role === 'Director' || currentUser.role === 'Administrador') && (
                                            <DropdownMenuItem onSelect={() => handleEnableUser(user.id)} disabled={isSubmitting}>
                                                {isSubmitting ? "Habilitando..." : `Habilitar ${user.role}`}
                                            </DropdownMenuItem>
                                        )}
                                        {showAdvancedFilters && (
                                            <DropdownMenuItem onSelect={() => handleOpenEditDialog(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                        )}
                                        {isEvaluator && (
                                            <DropdownMenuItem onSelect={() => handleOpenChangePasswordDialog(user)}>
                                                <KeyRound className="mr-2 h-4 w-4" />
                                                Cambiar Contraseña
                                            </DropdownMenuItem>
                                        )}
                                        {(currentUser.role === 'Evaluador' || currentUser.role === 'Director' || currentUser.role === 'Administrador') && (
                                          <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(user)}>Eliminar</DropdownMenuItem>
                                        )}
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
                    <AlertDialogAction onClick={handleDeleteUser} disabled={isSubmitting}>
                      {isSubmitting ? "Eliminando..." : "Confirmar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Perfil del Usuario</DialogTitle>
                    <DialogDescription>
                        Información detallada del usuario seleccionado.
                    </DialogDescription>
                </DialogHeader>
                {selectedUser && (
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                                {selectedUser.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <RoleIcon role={selectedUser.role} className="h-4 w-4" />
                                    <span>{selectedUser.role}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={selectedUser.email} readOnly />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="escuela">Escuela</Label>
                            <Input id="escuela" value={selectedUser.school} readOnly />
                        </div>
                        {selectedUser.grade && (
                            <div className="space-y-2">
                                <Label htmlFor="grado">Grado</Label>
                                <Input id="grado" value={selectedUser.grade} readOnly />
                            </div>
                        )}
                        {selectedUser.course && (
                            <div className="space-y-2">
                                <Label htmlFor="curso">Curso</Label>
                                <Input id="curso" value={selectedUser.course} readOnly />
                            </div>
                        )}
                        {selectedUser.schoolYear && (
                            <div className="space-y-2">
                                <Label htmlFor="schoolYear">Ciclo Lectivo</Label>
                                <Input id="schoolYear" value={selectedUser.schoolYear} readOnly />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <div>
                                <Badge variant={selectedUser.status === "Pendiente" ? "secondary" : (selectedUser.status === "Activo" ? "default" : "destructive")}>
                                    {selectedUser.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={() => setIsProfileDialogOpen(false)}>Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <EditUserDialog 
            isOpen={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
            onSave={async (updatedUser) => {
                setIsSubmitting(true);
                try {
                    await updateUser(updatedUser);
                    toast({ title: "Usuario Actualizado", description: "Los datos del usuario han sido actualizados." });
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                } catch (error) {
                    toast({ title: "Error", description: "No se pudo actualizar el usuario.", variant: "destructive" });
                } finally {
                    setIsSubmitting(false);
                }
            }}
            allSchools={schools}
            isSubmitting={isSubmitting}
        />

        <ChangePasswordDialog
            isOpen={isChangePasswordDialogOpen}
            onOpenChange={setIsChangePasswordDialogOpen}
            user={selectedUser}
            onSave={async (userId, newPassword) => {
                setIsSubmitting(true);
                try {
                    await updateUserPassword(userId, newPassword);
                    toast({ title: "Contraseña Actualizada", description: "La contraseña del usuario ha sido cambiada." });
                    setIsChangePasswordDialogOpen(false);
                    setSelectedUser(null);
                } catch (error) {
                    toast({ title: "Error", description: "No se pudo actualizar la contraseña.", variant: "destructive" });
                } finally {
                    setIsSubmitting(false);
                }
            }}
            isSubmitting={isSubmitting}
        />
    </div>
  )
}

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: User) => Promise<void>;
  allSchools: School[];
  isSubmitting: boolean;
}

function EditUserDialog({ isOpen, onOpenChange, user, onSave, allSchools, isSubmitting }: EditUserDialogProps) {
    const [editedUser, setEditedUser] = useState<User | null>(user);

    useEffect(() => {
        setEditedUser(user);
    }, [user]);

    const handleFieldChange = (field: keyof User, value: any) => {
        if (!editedUser) return;
        
        const updatedUser = { ...editedUser, [field]: value };

        if (field === 'role' && value !== 'Docente') {
            delete updatedUser.grade;
            delete updatedUser.course;
        }

        setEditedUser(updatedUser);
    }
    
    const handleSchoolChange = (schoolId: string) => {
        if (!editedUser) return;
        const selectedSchool = allSchools.find(s => s.id === schoolId);
        if (selectedSchool) {
            setEditedUser({ ...editedUser, school: selectedSchool.name });
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editedUser) {
            onSave(editedUser);
        }
    }

    if (!editedUser) return null;
    
    const selectedSchoolId = allSchools.find(s => s.name === editedUser.school)?.id || "";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario. El email y el DNI no se pueden cambiar.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre Completo</Label>
                            <Input id="edit-name" value={editedUser.name} onChange={(e) => handleFieldChange('name', e.target.value)} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select value={editedUser.role} onValueChange={(value) => handleFieldChange('role', value as UserRole)} disabled={isSubmitting}>
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Administrador">Administrador</SelectItem>
                                    <SelectItem value="Referente">Referente</SelectItem>
                                    <SelectItem value="Director">Director</SelectItem>
                                    <SelectItem value="Docente">Docente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-school">Escuela</Label>
                            <Select value={selectedSchoolId} onValueChange={handleSchoolChange} disabled={isSubmitting}>
                                <SelectTrigger id="edit-school">
                                    <SelectValue placeholder="Seleccionar escuela" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allSchools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {editedUser.role === 'Docente' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-grade">Grado</Label>
                                    <Select value={editedUser.grade || ''} onValueChange={(value) => handleFieldChange('grade', value)} disabled={isSubmitting}>
                                        <SelectTrigger id="edit-grade"><SelectValue placeholder="Grado" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1er Grado">1er Grado</SelectItem>
                                            <SelectItem value="2do Grado">2do Grado</SelectItem>
                                            <SelectItem value="3er Grado">3er Grado</SelectItem>
                                            <SelectItem value="4to Grado">4to Grado</SelectItem>
                                            <SelectItem value="5to Grado">5to Grado</SelectItem>
                                            <SelectItem value="6to Grado">6to Grado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-course">Curso</Label>
                                    <Input id="edit-course" value={editedUser.course || ''} onChange={(e) => handleFieldChange('course', e.target.value)} disabled={isSubmitting} />
                                </div>
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label htmlFor="edit-schoolYear">Ciclo Lectivo</Label>
                            <Input id="edit-schoolYear" value={editedUser.schoolYear || ''} onChange={(e) => handleFieldChange('schoolYear', e.target.value)} disabled={isSubmitting} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (userId: string, newPassword: string) => Promise<void>;
  isSubmitting: boolean;
}

function ChangePasswordDialog({ isOpen, onOpenChange, user, onSave, isSubmitting }: ChangePasswordDialogProps) {
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setNewPassword("");
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && newPassword) {
            onSave(user.id, newPassword);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                            Estás a punto de cambiar la contraseña para <span className="font-bold">{user?.name}</span>. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || !newPassword}>{isSubmitting ? "Guardando..." : "Guardar Contraseña"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


    


    