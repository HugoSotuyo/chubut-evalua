

"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Building, Filter, FileDown, Map, Trash2 } from "lucide-react"
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
import { useSchools } from "@/context/schools-context";
import { useAuth } from "@/context/auth-context";
import type { School, Region } from "@/lib/types";


export default function EscuelasPage() {
  const { user } = useAuth();
  const { 
    schools, 
    regions, 
    addSchool, 
    updateSchool, 
    deleteSchool, 
    toggleSchoolStatus, 
    addRegion,
    deleteRegion,
    loading,
  } = useSchools();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleteRegionAlertOpen, setIsDeleteRegionAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSchoolDialogOpen, setIsAddSchoolDialogOpen] = useState(false);
  const [isAddRegionDialogOpen, setIsAddRegionDialogOpen] = useState(false);
  const [isDeleteRegionDialogOpen, setIsDeleteRegionDialogOpen] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  
  const [regionFilter, setRegionFilter] = useState("all");
  const { toast } = useToast();
  const { searchTerm } = useSearch();

  const filteredSchools = useMemo(() => {
    let results = schools;
    if (regionFilter !== "all") {
      results = results.filter(school => school.region === regionFilter);
    }
    if (searchTerm) {
      results = results.filter(school => school.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return results;
  }, [schools, regionFilter, searchTerm]);


  const handleOpenDeleteDialog = (school: School) => {
    setSelectedSchool(school);
    setIsAlertOpen(true);
  };
  
  const handleOpenDeleteRegionDialog = () => {
    setIsDeleteRegionDialogOpen(true);
  };

  const handleOpenEditDialog = (school: School) => {
    setEditingSchool({ ...school });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSchool = async () => {
    if (!selectedSchool) return;
    try {
      await deleteSchool(selectedSchool.id);
      toast({
          title: "Escuela Eliminada",
          description: `La escuela ${selectedSchool.name} ha sido eliminada correctamente.`,
      });
    } catch (error) {
       toast({ title: "Error", description: "No se pudo eliminar la escuela.", variant: "destructive"});
    } finally {
      setIsAlertOpen(false);
      setSelectedSchool(null);
    }
  };
  
  const handleDeleteRegion = async () => {
    if (!selectedRegion) return;
    try {
      const result = await deleteRegion(selectedRegion.id);
      toast({
        title: result.success ? "Región Eliminada" : "Error al Eliminar",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la región.", variant: "destructive"});
    } finally {
      setIsDeleteRegionAlertOpen(false);
      setSelectedRegion(null);
      setIsDeleteRegionDialogOpen(false); // Close the selection dialog
    }
  };

  const handleToggleStatus = async (schoolId: string) => {
    const schoolToToggle = schools.find((school) => school.id === schoolId);
    if (!schoolToToggle) return;
    
    try {
        await toggleSchoolStatus(schoolId);
        toast({
            title: `Escuela ${schoolToToggle.status === "Activa" ? "Desactivada" : "Activada"}`,
            description: `La escuela ${schoolToToggle.name} ahora está ${schoolToToggle.status === "Activa" ? "inactiva" : "activa"}.`,
        });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo cambiar el estado de la escuela.", variant: "destructive"});
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;
    try {
        await updateSchool(editingSchool);
        toast({
            title: "Escuela Actualizada",
            description: `Los datos de la escuela ${editingSchool.name} han sido actualizados.`,
        });
    } catch (error) {
         toast({ title: "Error", description: "No se pudo actualizar la escuela.", variant: "destructive"});
    } finally {
        setIsEditDialogOpen(false);
        setEditingSchool(null);
    }
  };
  
  const handleAddSchool = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("school-name") as string;
    const regionId = formData.get("school-region") as string;

    const selectedRegion = regions.find(d => d.id === regionId);

    if (!name || !selectedRegion) {
        toast({ title: "Error", description: "El nombre y la región son requeridos.", variant: "destructive"});
        return;
    }

    const schoolExists = schools.some(
      school => school.name.toLowerCase() === name.toLowerCase() && school.region === selectedRegion.name
    );

    if (schoolExists) {
        toast({
            title: "Escuela Duplicada",
            description: `La escuela "${name}" ya existe en la región "${selectedRegion.name}".`,
            variant: "destructive"
        });
        return;
    }

    try {
        await addSchool({ name, region: selectedRegion.name }, selectedRegion.id);
        toast({ title: "Escuela Agregada", description: `La escuela ${name} ha sido agregada.` });
        setIsAddSchoolDialogOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "No se pudo agregar la escuela.", variant: "destructive"});
    }
  };

  const handleAddRegion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("region-name") as string;
    
    if (!name || !name.trim()) {
        toast({ title: "Error", description: "El nombre de la región es requerido.", variant: "destructive"});
        return;
    }
    
    const regionExists = regions.some(d => d.name.toLowerCase() === name.trim().toLowerCase());
    
    if (regionExists) {
        toast({
            title: "Región Duplicada",
            description: `La región "${name.trim()}" ya existe en la lista.`,
            variant: "destructive",
        });
        return;
    }
    
    try {
        const result = await addRegion(name.trim());
        toast({
            title: result.success ? "Región Agregada" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

        if (result.success) {
            setIsAddRegionDialogOpen(false);
        }
    } catch (error) {
        toast({
            title: "Error Inesperado",
            description: "Ocurrió un error al intentar guardar la región.",
            variant: "destructive",
        });
        console.error("Error submitting region:", error);
    }
  }

  const handleExport = () => {
    const headers = ["ID", "Nombre", "Región", "Estado"];
    const rows = filteredSchools.map(school => 
        [school.id, school.name, school.region, school.status].join(';')
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
  
  if (loading || !user) {
      return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }

  const isEvaluador = user.role === 'Evaluador';

  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Escuelas</h1>
                <p className="text-muted-foreground">Administra las escuelas y regiones del sistema.</p>
            </div>
            <div className="flex items-center gap-2">
                {isEvaluador && (
                    <Button onClick={handleOpenDeleteRegionDialog} variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Región
                    </Button>
                )}
                <Button onClick={() => setIsAddRegionDialogOpen(true)} variant="outline">
                    <Map className="mr-2 h-4 w-4" />
                    Agregar Región
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
                    <CardTitle>Filtrar por Región</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="region-filter">Región</Label>
                        <Select onValueChange={setRegionFilter} value={regionFilter}>
                            <SelectTrigger id="region-filter">
                                <SelectValue placeholder="Seleccionar región" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Regiones</SelectItem>
                                {regions.map((region, index) => (
                                    <SelectItem key={`${region.id}-${index}`} value={region.name}>{region.name}</SelectItem>
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
                            <TableHead>Región</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSchools.length > 0 ? (
                            filteredSchools.map((school) => (
                            <TableRow key={school.id}>
                                <TableCell className="font-medium">{school.name}</TableCell>
                                <TableCell>{school.region}</TableCell>
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
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No se encontraron escuelas para los filtros seleccionados.
                                </TableCell>
                            </TableRow>
                        )}
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

        <AlertDialog open={isDeleteRegionAlertOpen} onOpenChange={setIsDeleteRegionAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar la región?</AlertDialogTitle>
                    <AlertDialogDescription>
                       Esta acción eliminará permanentemente la región <span className="font-bold">{selectedRegion?.name}</span>. 
                       Solo podrás eliminar una región si no tiene escuelas asociadas.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedRegion(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRegion}>Confirmar</AlertDialogAction>
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
                            <Label htmlFor="region" className="text-right">
                                Región
                            </Label>
                            <Select
                                value={editingSchool.region}
                                onValueChange={(value) => {
                                    const selected = regions.find(d => d.name === value);
                                    if(selected) {
                                        setEditingSchool({ ...editingSchool, region: selected.name, regionId: selected.id })
                                    }
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona una región" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((d, index) => <SelectItem key={`${d.id}-${index}`} value={d.name}>{d.name}</SelectItem>)}
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
                            <Label htmlFor="school-region" className="text-right">
                                Región
                            </Label>
                            <Select name="school-region" required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona una región" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((d, index) => <SelectItem key={`${d.id}-${index}`} value={d.id}>{d.name}</SelectItem>)}
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

        <Dialog open={isAddRegionDialogOpen} onOpenChange={setIsAddRegionDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddRegion}>
                    <DialogHeader>
                        <DialogTitle>Agregar Nueva Región</DialogTitle>
                        <DialogDescription>
                            Escribe el nombre de la nueva región para agregarla al sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="region-name" className="text-right">
                                Nombre
                            </Label>
                            <Input id="region-name" name="region-name" placeholder="Ej: Región IV" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Guardar Región</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isDeleteRegionDialogOpen} onOpenChange={setIsDeleteRegionDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Eliminar una Región</DialogTitle>
                    <DialogDescription>
                        Selecciona la región que deseas eliminar. Esta acción es irreversible.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="region-to-delete">Región</Label>
                    <Select onValueChange={(value) => setSelectedRegion(regions.find(d => d.id === value) || null)}>
                        <SelectTrigger id="region-to-delete">
                            <SelectValue placeholder="Selecciona una región para eliminar" />
                        </SelectTrigger>
                        <SelectContent>
                            {regions.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button 
                        type="button" 
                        variant="destructive"
                        onClick={() => {
                            if (selectedRegion) {
                                setIsDeleteRegionAlertOpen(true);
                            } else {
                                toast({ title: "Error", description: "Debes seleccionar una región.", variant: "destructive" });
                            }
                        }}
                        disabled={!selectedRegion}
                    >
                        Eliminar Región
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  )
}

    
