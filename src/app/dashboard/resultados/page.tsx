

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
import type { Result } from "@/lib/types";
import { useExams } from "@/context/exams-context"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useStudents } from "@/context/students-context"
import { useSchools } from "@/context/schools-context"

type Filters = {
    exam: string;
    school: string;
    studentName: string;
    status: string;
    grade: string;
    course: string;
}

export default function ResultadosPage() {
    const { user, loading: authLoading } = useAuth();
    const { results: allResults, deleteResult, loading: resultsLoading } = useResults();
    const { exams, loading: examsLoading } = useExams();
    const { students } = useStudents();
    const { schools } = useSchools();
    const { searchTerm } = useSearch();
    const { toast } = useToast();
    
    const [filters, setFilters] = useState<Filters>({
        exam: "all",
        school: "all",
        studentName: "",
        status: "all",
        grade: "all",
        course: "all",
    });

    const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial filter setup based on user role
    useEffect(() => {
        if (user) {
            const initialSchool = (user.role === "Director" || user.role === "Docente") ? user.school : "all";
            const initialFilters = {
                exam: "all",
                school: initialSchool,
                studentName: "",
                status: "all",
                grade: user.role === 'Docente' ? user.grade ?? 'all' : 'all',
                course: user.role === 'Docente' ? user.course ?? 'all' : 'all',
            };
            setFilters(initialFilters);
            setAppliedFilters(initialFilters);
        }
    }, [user]);

    const availableExams = useMemo(() => {
        if (!user) return [];
        if (user.role === 'Docente') {
            return exams.filter(e => e.grade === user.grade);
        }
        return exams;
    }, [exams, user]);

    const availableGrades = useMemo(() => {
        return [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
    }, [students]);

    const availableCourses = useMemo(() => {
        return [...new Set(students.map(s => s.course).filter(Boolean))].sort();
    }, [students]);
    
    const availableSchools = useMemo(() => {
        return schools.map(s => s.name).sort();
    }, [schools]);


    const filteredResults = useMemo(() => {
        if (!user) return [];

        let results = allResults;

        // Role-based pre-filtering. Evaluador, Administrador, and Referente see everything by default.
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
        if (appliedFilters.grade !== "all") {
            results = results.filter(r => r.grade === appliedFilters.grade);
        }
        if (appliedFilters.course !== "all") {
            results = results.filter(r => r.course === appliedFilters.course);
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
        const headers = ["ID", "Alumno", "Examen", "Escuela", "Grado", "Curso", "Nota", "Estado"];
        const rows = filteredResults.map(res => 
            [res.id, res.studentName, res.examName, res.school, res.grade, res.course, res.score, res.status].join(';')
        );
        
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

    const handleConfirmDelete = async () => {
        if (selectedResult && !isSubmitting) {
            setIsSubmitting(true);
            try {
                await deleteResult(selectedResult.id);
                toast({
                    title: "Resultado Anulado",
                    description: `El resultado del examen para ${selectedResult.studentName} ha sido eliminado.`,
                });
            } catch (error) {
                 toast({
                    title: "Error",
                    description: "No se pudo anular el resultado.",
                    variant: "destructive"
                });
            } finally {
                setIsSubmitting(false);
                setIsDeleteAlertOpen(false);
                setSelectedResult(null);
            }
        }
    };

    const handleOpenDetailsDialog = (result: Result) => {
        setSelectedResult(result);
        setIsDetailsDialogOpen(true);
    };
    
    const examForDetails = useMemo(() => {
        if (!selectedResult) return null;
        return exams.find(e => e.id === selectedResult.examId) ?? null;
    }, [selectedResult, exams]);

    if (authLoading || resultsLoading || examsLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
    }

    const showGlobalFilters = user && ['Evaluador', 'Administrador', 'Referente'].includes(user.role);
    const showGradeCourseFilters = user && user.role !== 'Docente';

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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-6 items-end">
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
                    {showGlobalFilters && (
                        <div className="grid gap-2">
                            <Label htmlFor="filtro-escuela">Escuela</Label>
                            <Select onValueChange={(value) => handleFilterChange("school", value)} value={filters.school}>
                                <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {availableSchools.map(school => (
                                        <SelectItem key={school} value={school}>{school}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {showGradeCourseFilters && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-grado">Grado</Label>
                                <Select onValueChange={(v) => handleFilterChange('grade', v)} value={filters.grade} disabled={filters.school === 'all' && !showGlobalFilters}>
                                    <SelectTrigger id="filtro-grado"><SelectValue placeholder="Grado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {availableGrades.map((g, i) => <SelectItem key={`${g}-${i}`} value={g as string}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-curso">Curso</Label>
                                <Select onValueChange={(v) => handleFilterChange('course', v)} value={filters.course} disabled={filters.school === 'all' && !showGlobalFilters}>
                                    <SelectTrigger id="filtro-curso"><SelectValue placeholder="Curso" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {availableCourses.map((c, i) => <SelectItem key={`${c}-${i}`} value={c as string}>"{c}"</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
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
                                <SelectItem value="Aprobado">Aprobado</SelectItem>
                                <SelectItem value="Desaprobado">Desaprobado</SelectItem>
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
                                <TableHead>Grado</TableHead>
                                <TableHead>Curso</TableHead>
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
                                <TableCell>{result.grade}</TableCell>
                                <TableCell>{result.course}</TableCell>
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
                                            <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(result)} disabled={isSubmitting}>
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
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isSubmitting}>
                            {isSubmitting ? "Anulando..." : "Confirmar"}
                        </AlertDialogAction>
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

    