
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Filter } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Label } from "@/components/ui/label";

const data = [
  { name: 'Pregunta 1', '1er Grado': 0.8, '2do Grado': 0.7, '3er Grado': 0.85 },
  { name: 'Pregunta 2', '1er Grado': 0.6, '2do Grado': 0.65, '3er Grado': 0.7 },
  { name: 'Pregunta 3', '1er Grado': 0.9, '2do Grado': 0.8, '3er Grado': 0.95 },
  { name: 'Pregunta 4', '1er Grado': 0.5, '2do Grado': 0.6, '3er Grado': 0.55 },
  { name: 'Pregunta 5', '1er Grado': 0.7, '2do Grado': 0.75, '3er Grado': 0.8 },
];

const dataAprobados = [
    { name: '1er Grado', Aprobados: 75, Desaprobados: 25 },
    { name: '2do Grado', Aprobados: 80, Desaprobados: 20 },
    { name: '3er Grado', Aprobados: 88, Desaprobados: 12 },
    { name: '4to Grado', Aprobados: 70, Desaprobados: 30 },
    { name: '5to Grado', Aprobados: 92, Desaprobados: 8 },
]

export default function AnalisisPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Análisis de Resultados</h1>
                <p className="text-muted-foreground">Filtra y visualiza los datos de las evaluaciones.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            <CardTitle>Filtros</CardTitle>
                        </div>
                    </div>
                    <CardDescription>Selecciona los criterios para acotar tu búsqueda. Los gráficos se actualizarán automáticamente.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-distrito">Distrito</Label>
                        <Select>
                            <SelectTrigger id="filtro-distrito"><SelectValue placeholder="Distrito" /></SelectTrigger>
                            <SelectContent><SelectItem value="1">Distrito I</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-escuela">Escuela</Label>
                        <Select>
                            <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                            <SelectContent><SelectItem value="101">Escuela N° 101</SelectItem></SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-grado">Grado</Label>
                        <Select>
                            <SelectTrigger id="filtro-grado"><SelectValue placeholder="Grado" /></SelectTrigger>
                            <SelectContent><SelectItem value="1">1er Grado</SelectItem></SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-curso">Curso</Label>
                        <Select>
                            <SelectTrigger id="filtro-curso"><SelectValue placeholder="Curso" /></SelectTrigger>
                            <SelectContent><SelectItem value="A">"A"</SelectItem></SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-examen">Examen</Label>
                        <Select>
                            <SelectTrigger id="filtro-examen"><SelectValue placeholder="Examen" /></SelectTrigger>
                            <SelectContent><SelectItem value="mat2023">Matemática 2023</SelectItem></SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Análisis por Pregunta</CardTitle>
                        <CardDescription>Promedio de respuestas correctas por pregunta y grado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="1er Grado" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="2do Grado" stroke="hsl(var(--accent))" />
                                <Line type="monotone" dataKey="3er Grado" stroke="hsl(var(--destructive))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Aprobados vs. Desaprobados</CardTitle>
                        <CardDescription>Porcentaje de alumnos por condición en cada grado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataAprobados} layout="vertical" stackOffset="expand">
                                <XAxis hide type="number" />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Aprobados" fill="hsl(var(--chart-1))" stackId="a" />
                                <Bar dataKey="Desaprobados" fill="hsl(var(--chart-3))" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="flex justify-end">
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Resultados (CSV)
                </Button>
            </div>
        </div>
    )
}
