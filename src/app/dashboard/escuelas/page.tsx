
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Building } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";


const initialSchools = [
    { id: "esc-001", name: "Escuela N° 101", district: "Distrito I", status: "Activa" },
    { id: "esc-002", name: "Escuela N° 789", district: "Distrito II", status: "Activa" },
    { id: "esc-003", name: "Escuela N° 456", district: "Distrito I", status: "Activa" },
    { id: "esc-004", name: "Escuela N° 23", district: "Distrito III", status: "Inactiva" },
    { id: "esc-005", name: "Escuela N° 502", district: "Distrito II", status: "Activa" },
];

type School = typeof initialSchools[0];

const districts = ["Distrito I", "Distrito II", "Distrito III", "Distrito IV", "Distrito V"];

export default function EscuelasPage() {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const { toast } = useToast();

  const handleOpenDeleteDialog = (school: School) => {
    setSelectedSchool(school);
    setIsAlertOpen(true);
  };

  const handleOpenEditDialog = (school: School) => {
    setEditingSchool({ ...school });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSchool = () => {
    if (!selectedSchool) return;
    setSchools(schools.filter((school) => school.id !== selectedSchool.id));
    toast({
        title: "Escuela Eliminada",
        description: `La escuela ${selectedSchool.name} ha sido eliminada correctamente.`,
    });
    setIsAlertOpen(false);
    setSelectedSchool(null);
  };

  const handleToggleStatus = (schoolId: string) => {
    const schoolToToggle = schools.find((school) => school.id === schoolId);
    if (!schoolToToggle) return;

    const newStatus = schoolToToggle.status === "Activa" ? "Inactiva" : "Activa";
    
    setSchools(schools.map((school) =>
      school.id === schoolId ? { ...school, status: newStatus } : school
    ));

    toast({
        title: `Escuela ${newStatus === "Activa" ? "Activada" : "Desactivada"}`,
        description: `La escuela ${schoolToToggle.name} ahora está ${newStatus.toLowerCase()}.`,
    });
  };

  const handleUpdateSchool = () => {
    if (!editingSchool) return;

    setSchools(schools.map((school) =>
        school.id === editingSchool.id ? editingSchool : school
    ));

    toast({
        title: "Escuela Actualizada",
        description: `Los datos de la escuela ${editingSchool.name} han sido actualizados.`,
    });
    setIsEditDialogOpen(false);
    setEditingSchool(null);
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Escuelas</h1>
                <p className="text-muted-foreground">Administra las escuelas del sistema.</p>
            </div>
            <Button onClick={() => showToast('Agregar Escuela')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Escuela
            </Button>
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <CardTitle>Escuelas Registradas</CardTitle>
                </div>
                <CardDescription>Lista de todas las escuelas cargadas en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre de la Escuela</TableHead>
                            <TableHead>Distrito</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.map((school) => (
                        <TableRow key={school.id}>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell>{school.district}</TableCell>
                            <TableCell>
                                <Badge variant={school.status === "Inactiva" ? "secondary" : "default"}>{school.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleOpenEditDialog(school)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleToggleStatus(school.id)}>
                                            {school.status === "Activa" ? "Desactivar" : "Activar"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(school)}>
                                            Eliminar
                                        </DropdownMenuItem>
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
                    <AlertDialogTitle>¿Estás seguro de que deseas eliminar esta escuela?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la escuela
                        <span className="font-bold"> {selectedSchool?.name}</span> y todos sus datos asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedSchool(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSchool}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Escuela</DialogTitle>
                    <DialogDescription>
                        Modifica los datos de la escuela. Haz clic en "Guardar Cambios" cuando termines.
                    </DialogDescription>
                </DialogHeader>
                {editingSchool && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={editingSchool.name}
                                onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="district" className="text-right">
                                Distrito
                            </Label>
                            <Select
                                value={editingSchool.district}
                                onValueChange={(value) => setEditingSchool({ ...editingSchool, district: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona un distrito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleUpdateSchool}>
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  )
}
