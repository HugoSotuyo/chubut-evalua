
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Building, Filter, FileDown, Map } from "lucide-react"
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
import { useSearch } from "@/context/search-context";
import { useSchools, type School } from "@/context/schools-context";


export default function EscuelasPage() {
  const { 
    schools, 
    districts, 
    addSchool, 
    updateSchool, 
    deleteSchool, 
    toggleSchoolStatus, 
    addDistrict 
  } = useSchools();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSchoolDialogOpen, setIsAddSchoolDialogOpen] = useState(false);
  const [isAddDistrictDialogOpen, setIsAddDistrictDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [districtFilter, setDistrictFilter] = useState("all");
  const { toast } = useToast();
  const { searchTerm } = useSearch();

  const filteredSchools = useMemo(() => {
    let results = schools;
    if (districtFilter !== "all") {
      results = results.filter(school => school.district === districtFilter);
    }
    if (searchTerm) {
      results = results.filter(school => school.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return results;
  }, [schools, districtFilter, searchTerm]);


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
    deleteSchool(selectedSchool.id);
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
    
    toggleSchoolStatus(schoolId);

    toast({
        title: `Escuela ${schoolToToggle.status === "Activa" ? "Desactivada" : "Activada"}`,
        description: `La escuela ${schoolToToggle.name} ahora está ${schoolToToggle.status === "Activa" ? "inactiva" : "activa"}.`,
    });
  };

  const handleUpdateSchool = () => {
    if (!editingSchool) return;
    updateSchool(editingSchool);
    toast({
        title: "Escuela Actualizada",
        description: `Los datos de la escuela ${editingSchool.name} han sido actualizados.`,
    });
    setIsEditDialogOpen(false);
    setEditingSchool(null);
  };
  
  const handleAddSchool = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("school-name") as string;
    const district = formData.get("school-district") as string;

    if (!name || !district) {
        toast({ title: "Error", description: "El nombre y el distrito son requeridos.", variant: "destructive"});
        return;
    }

    await addSchool({
        name,
        district,
    });
    toast({ title: "Escuela Agregada", description: `La escuela ${name} ha sido agregada.` });
    setIsAddSchoolDialogOpen(false);
  };

  const handleAddDistrict = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("district-name") as string;
    
    if (!name || !name.trim()) {
        toast({ title: "Error", description: "El nombre del distrito es requerido.", variant: "destructive"});
        return;
    }
    
    const result = await addDistrict(name.trim());
    toast({
        title: result.success ? "Distrito Agregado" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setIsAddDistrictDialogOpen(false);
    }
  }

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Distrito", "Estado"];
    const rows = filteredSchools.map(school => 
        [school.id, school.name, school.district, school.status].join(';')
    );
    
    const bom = "\uFEFF";
    const csvContent = bom + [headers.join(';'), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "escuelas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Escuelas</h1>
                <p className="text-muted-foreground">Administra las escuelas y distritos del sistema.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddDistrictDialogOpen(true)} variant="outline">
                    <Map className="mr-2 h-4 w-4" />
                    Agregar Distrito
                </Button>
                <Button onClick={() => setIsAddSchoolDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Escuela
                </Button>
                 <Button variant="outline" onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Escuelas
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle>Filtrar por Distrito</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="district-filter">Distrito</Label>
                        <Select onValueChange={setDistrictFilter} value={districtFilter}>
                            <SelectTrigger id="district-filter">
                                <SelectValue placeholder="Seleccionar distrito" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Distritos</SelectItem>
                                {districts.map((district, index) => (
                                    <SelectItem key={`${district}-${index}`} value={district}>{district}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>


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
                        {filteredSchools.map((school) => (
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
                                    {districts.map((d, index) => <SelectItem key={`${d}-${index}`} value={d}>{d}</SelectItem>)}
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
        
        <Dialog open={isAddSchoolDialogOpen} onOpenChange={setIsAddSchoolDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                 <form onSubmit={handleAddSchool}>
                    <DialogHeader>
                        <DialogTitle>Agregar Nueva Escuela</DialogTitle>
                        <DialogDescription>
                            Completa los datos para registrar una nueva escuela en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="school-name" className="text-right">
                                Nombre
                            </Label>
                            <Input id="school-name" name="school-name" placeholder="Ej: Escuela N° 505" className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="school-district" className="text-right">
                                Distrito
                            </Label>
                            <Select name="school-district" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona un distrito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map((d, index) => <SelectItem key={`${d}-${index}`} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Guardar Escuela</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isAddDistrictDialogOpen} onOpenChange={setIsAddDistrictDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddDistrict}>
                    <DialogHeader>
                        <DialogTitle>Agregar Nuevo Distrito</DialogTitle>
                        <DialogDescription>
                            Escribe el nombre del nuevo distrito para agregarlo al sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="district-name" className="text-right">
                                Nombre
                            </Label>
                            <Input id="district-name" name="district-name" placeholder="Ej: Distrito IV" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Guardar Distrito</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

    </div>
  )
}
