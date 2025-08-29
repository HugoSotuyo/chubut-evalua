
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, FileDown, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/context/search-context";

const allResults = [
    { id: "res-001", studentName: "Juan Pérez", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 101", grade: "Aprobado", score: 85 },
    { id: "res-002", studentName: "María Rodríguez", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 101", grade: "Desaprobado", score: 55 },
    { id: "res-003", studentName: "Carlos Sánchez", examName: "Lengua y Literatura 2024", school: "Escuela N° 789", grade: "Aprobado", score: 92 },
    { id: "res-004", studentName: "Ana López", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 456", grade: "Aprobado", score: 78 },
    { id: "res-005", studentName: "Luis Martínez", examName: "Ciencias Naturales 2023", school: "Escuela N° 101", grade: "Desaprobado", score: 45 },
    { id: "res-006", studentName: "Laura García", examName: "Lengua y Literatura 2024", school: "Escuela N° 456", grade: "Aprobado", score: 88 },
]

type Filters = {
    exam: string;
    school: string;
    studentName: string;
    status: string;
}

export default function ResultadosPage() {
    const { searchTerm } = useSearch();
    const [filters, setFilters] = useState<Filters>({
        exam: "all",
        school: "all",
        studentName: "",
        status: "all",
    });

    const [appliedFilters, setAppliedFilters] = useState<Filters>(filters);

    const filteredResults = useMemo(() => {
        let results = allResults;

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
            results = results.filter(r => r.grade.toLowerCase() === appliedFilters.status);
        }
        if (searchTerm) {
            results = results.filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return results;
    }, [appliedFilters, searchTerm]);

    const handleFilterChange = <K extends keyof Filters>(filterName: K, value: Filters[K]) => {
        setFilters(prev => ({...prev, [filterName]: value}));
    }

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    }
    
    const handleExport = () => {
        const headers = ["ID", "Alumno", "Examen", "Escuela", "Nota", "Estado"];
        const rows = filteredResults.map(res => [res.id, res.studentName, res.examName, res.school, res.score, res.grade].join(';'));
        
        // BOM para compatibilidad con Excel
        const bom = "\uFEFF";
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

    const getUniqueValues = (key: 'examName' | 'school') => {
        const values = allResults.map(item => item[key]);
        return [...new Set(values)];
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
                                {getUniqueValues("examName").map(exam => (
                                    <SelectItem key={exam as string} value={exam as string}>{exam as string}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                                <TableCell>{result.score}/100</TableCell>
                                <TableCell>
                                    <Badge variant={result.grade === "Desaprobado" ? "destructive" : "default"}>{result.grade}</Badge>
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
                                            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Anular Resultado</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
