"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, FileDown, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const results = [
    { id: "res-001", studentName: "Juan Pérez", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 101", grade: "Aprobado", score: 85 },
    { id: "res-002", studentName: "María Rodríguez", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 101", grade: "Desaprobado", score: 55 },
    { id: "res-003", studentName: "Carlos Sánchez", examName: "Lengua y Literatura 2024", school: "Escuela N° 789", grade: "Aprobado", score: 92 },
    { id: "res-004", studentName: "Ana López", examName: "Matemática Diagnóstico 2024", school: "Escuela N° 456", grade: "Aprobado", score: 78 },
    { id: "res-005", studentName: "Luis Martinez", examName: "Ciencias Naturales 2023", school: "Escuela N° 101", grade: "Desaprobado", score: 45 },
]

export default function ResultadosPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Resultados de Evaluaciones</h1>
                <p className="text-muted-foreground">Consulta y filtra los resultados de los alumnos.</p>
            </div>
             <Button>
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
                    <Button variant="outline">Aplicar Filtros</Button>
                </div>
                <CardDescription>Utiliza los filtros para encontrar resultados específicos.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select>
                    <SelectTrigger><SelectValue placeholder="Examen" /></SelectTrigger>
                    <SelectContent><SelectItem value="mat2024">Matemática Diagnóstico 2024</SelectItem></SelectContent>
                </Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Escuela" /></SelectTrigger>
                    <SelectContent><SelectItem value="101">Escuela N° 101</SelectItem></SelectContent>
                </Select>
                 <Input placeholder="Buscar por nombre de alumno..." />
                <Select>
                    <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="desaprobado">Desaprobado</SelectItem>
                    </SelectContent>
                </Select>
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
                        {results.map((result) => (
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
