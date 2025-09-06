
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, FileDown, Filter, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/context/auth-context";
import { useResults } from "@/context/results-context";
import type { Result } from "@/context/results-context";
import { useExams } from "@/context/exams-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type Filters = {
    exam: string;
    school: string;
    studentName: string;
    status: string;
}

function ResultadosPageContent() {
    const { user } = useAuth();
    const { results: allResults, deleteResult } = useResults();
    const { exams } = useExams();
    const { searchTerm } = useSearch();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [filters, setFilters] = useState<Filters>({
        exam: "all",
        school: user?.role === "Director" || user?.role === "Docente" ? user.school : "all",
        studentName: "",
        status: "all",
    });

    const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);

    useEffect(() => {
        const examFromUrl = searchParams.get("exam");
        if (examFromUrl) {
            const decodedExamName = decodeURIComponent(examFromUrl);
            const newFilters = { ...filters, exam: decodedExamName };
            setFilters(newFilters);
            setAppliedFilters(newFilters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const availableExams = useMemo(() => {
        if (!user) return [];
        if (user.role === 'Docente') {
            return exams.filter(e => e.grade === user.grade);
        }
        if (user.role === 'Director') {
             return exams;
        }
        return exams;
    }, [exams, user]);

    const filteredResults = useMemo(() => {
        if (!user) return [];

        let results = allResults;

        // Role-based filtering first
        if (user.role === "Director") {
            results = results.filter(r => r.school === user.school);
        } else if (user.role === "Docente") {
            results = results.filter(r => 
                r.school === user.school &&
                r.grade === user.grade &&
                r.course === user.course
            );
        }
        
        // Then apply UI filters
        if (appliedFilters.exam !== "all") {
            results = results.filter(r => r.examName === appliedFilters.exam);
        }
        if (appliedFilters.school !== "all") {
            results = results.filter(r => r.school === appliedFilters.school);
        }
        if (appliedFilters.studentName) {
            results = results.filter(r => r.studentName.toLowerCase().includes(appliedFilters.studentName.toLowerCase()));
        }
        if (appliedFilters.status !== "all") {
            results = results.filter(r => r.status.toLowerCase() === appliedFilters.status);
        }

        // Global search term
        if (searchTerm) {
            results = results.filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return results;
    }, [allResults, appliedFilters, searchTerm, user]);

    const handleFilterChange = <K extends keyof Filters>(filterName: K, value: Filters[K]) => {
        setFilters(prev => ({...prev, [filterName]: value}));
    }

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    }
    
    const handleExport = () => {
        const headers = ["ID", "Alumno", "Examen", "Escuela", "Nota", "Estado"];
        const rows = filteredResults.map(res => [res.id, res.studentName, res.examName, res.school, res.score, res.status].join(';'));
        
        const bom = "﻿";
        const csvContent = bom + [headers.join(';'), ...rows].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "resultados_evaluacion.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleOpenDeleteDialog = (result: Result) => {
        setSelectedResult(result);
        setIsDeleteAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedResult) {
            deleteResult(selectedResult.id);
            toast({
                title: "Resultado Anulado",
                description: `El resultado del examen para ${selectedResult.studentName} ha sido eliminado.`,
            });
        }
        setIsDeleteAlertOpen(false);
        setSelectedResult(null);
    };

    const handleOpenDetailsDialog = (result: Result) => {
        setSelectedResult(result);
        setIsDetailsDialogOpen(true);
    };
    
    const getUniqueValues = (key: 'school') => {
        const values = allResults.map(item => item[key]);
        return [...new Set(values)];
    }
    
    const examForDetails = useMemo(() => {
        if (!selectedResult) return null;
        return exams.find(e => e.id === selectedResult.examId) ?? null;
    }, [selectedResult, exams]);

    if (!user) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Resultados de Evaluaciones</h1>
                    <p className="text-muted-foreground">Consulta y filtra los resultados de los alumnos.</p>
                </div>
                 <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Resultados
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Filtros de Búsqueda</CardTitle>
                        </div>
                    </div>
                    <CardDescription>Utiliza los filtros para encontrar resultados específicos y luego presiona "Aplicar Filtros".</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-examen">Examen</Label>
                        <Select onValueChange={(value) => handleFilterChange("exam", value)} value={filters.exam}>
                            <SelectTrigger id="filtro-examen"><SelectValue placeholder="Examen" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {availableExams.map(exam => (
                                    <SelectItem key={exam.id} value={exam.name}>{exam.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {user.role !== 'Director' && user.role !== 'Docente' && (
                        <div className="grid gap-2">
                            <Label htmlFor="filtro-escuela">Escuela</Label>
                            <Select onValueChange={(value) => handleFilterChange("school", value)} value={filters.school}>
                                <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {getUniqueValues("school").map(school => (
                                        <SelectItem key={school as string} value={school as string}>{school as string}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-alumno">Alumno</Label>
                        <Input
                            id="filtro-alumno"
                            placeholder="Buscar por nombre..."
                            value={filters.studentName}
                            onChange={(e) => handleFilterChange("studentName", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-estado">Estado</Label>
                        <Select onValueChange={(value) => handleFilterChange("status", value)} value={filters.status}>
                            <SelectTrigger id="filtro-estado"><SelectValue placeholder="Estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="aprobado">Aprobado</SelectItem>
                                <SelectItem value="desaprobado">Desaprobado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleApplyFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Aplicar Filtros
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Resultados</CardTitle>
                    <CardDescription>Resultados individuales de los alumnos en las evaluaciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Alumno</TableHead>
                                <TableHead>Examen</TableHead>
                                <TableHead>Escuela</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell className="font-medium">{result.studentName}</TableCell>
                                <TableCell>{result.examName}</TableCell>
                                <TableCell>{result.school}</TableCell>
                                <TableCell>{result.score.toFixed(0)}/100</TableCell>
                                <TableCell>
                                    <Badge variant={result.status === "Desaprobado" ? "destructive" : "default"}>{result.status}</Badge>
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
                                            <DropdownMenuItem onSelect={() => handleOpenDetailsDialog(result)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Detalles
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(result)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Anular Resultado
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
            
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de que quieres anular este resultado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el resultado del examen
                            <span className="font-bold"> {selectedResult?.examName}</span> para el alumno <span className="font-bold">{selectedResult?.studentName}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedResult(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalle del Resultado</DialogTitle>
                        <DialogDescription>
                            Examen: <span className="font-semibold">{selectedResult?.examName}</span><br/>
                            Alumno: <span className="font-semibold">{selectedResult?.studentName}</span>
                        </DialogDescription>
                    </DialogHeader>
                    {examForDetails && selectedResult && (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60%]">Consigna</TableHead>
                                    <TableHead>Respuesta Esperada</TableHead>
                                    <TableHead className="text-center">Puntaje Obtenido</TableHead>
                                    <TableHead className="text-center">Puntaje Máximo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examForDetails.questions.map((q, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{q.consigna}</TableCell>
                                        <TableCell>{q.respuesta}</TableCell>
                                        <TableCell className="text-center font-semibold">{selectedResult.scores[index] ?? 0}</TableCell>
                                        <TableCell className="text-center">{q.puntaje}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    )}
                     <DialogFooter className="sm:justify-between items-center pt-4">
                        <div className="text-lg font-bold">
                            Total: {selectedResult?.totalScore} / {selectedResult?.maxScore}
                        </div>
                        <Button type="button" onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default function ResultadosPage() {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <ResultadosPageContent />
        </React.Suspense>
    )
}
