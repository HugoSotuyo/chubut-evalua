
"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Filter } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Label } from "@/components/ui/label";

const originalData = [
  { name: 'Pregunta 1', '1er Grado': 0.8, '2do Grado': 0.7, '3er Grado': 0.85 },
  { name: 'Pregunta 2', '1er Grado': 0.6, '2do Grado': 0.65, '3er Grado': 0.7 },
  { name: 'Pregunta 3', '1er Grado': 0.9, '2do Grado': 0.8, '3er Grado': 0.95 },
  { name: 'Pregunta 4', '1er Grado': 0.5, '2do Grado': 0.6, '3er Grado': 0.55 },
  { name: 'Pregunta 5', '1er Grado': 0.7, '2do Grado': 0.75, '3er Grado': 0.8 },
];

const originalDataAprobados = [
    { name: '1er Grado', Aprobados: 75, Desaprobados: 25 },
    { name: '2do Grado', Aprobados: 80, Desaprobados: 20 },
    { name: '3er Grado', Aprobados: 88, Desaprobados: 12 },
    { name: '4to Grado', Aprobados: 70, Desaprobados: 30 },
    { name: '5to Grado', Aprobados: 92, Desaprobados: 8 },
];

const mockResults = [
    { district: "Distrito I", school: "Escuela N° 101", grade: "1er Grado", course: "A", exam: "Matemática 2023" },
    { district: "Distrito I", school: "Escuela N° 456", grade: "2do Grado", course: "B", exam: "Lengua y Literatura 2024" },
    { district: "Distrito II", school: "Escuela N° 789", grade: "3er Grado", course: "C", exam: "Ciencias Naturales 2023" },
    { district: "Distrito II", school: "Escuela N° 502", grade: "1er Grado", course: "A", exam: "Matemática 2024" },
    { district: "Distrito III", school: "Escuela N° 23", grade: "4to Grado", course: "A", exam: "Matemática Cierre 2023" },
    { district: "Distrito I", school: "Escuela N° 101", grade: "3er Grado", course: "A", exam: "Matemática 2023" },
];


export default function AnalisisPage() {
    const [filters, setFilters] = useState({
        district: "all",
        school: "all",
        grade: "all",
        course: "all",
        exam: "all",
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);

    const getUniqueValues = (key: keyof typeof mockResults[0]) => {
        const values = mockResults.map(item => item[key]);
        return [...new Set(values)];
    }

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [filterName]: value}));
    }

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    }
    
    const { data, dataAprobados } = useMemo(() => {
        if (appliedFilters.district === "all" && appliedFilters.school === "all" && appliedFilters.grade === "all" && appliedFilters.course === "all" && appliedFilters.exam === "all") {
            return { data: originalData, dataAprobados: originalDataAprobados };
        }

        const newQuestionData = originalData.map(d => {
            const filteredData = { ...d };
            const selectedGrade = appliedFilters.grade;

            if (selectedGrade !== "all") {
                if ('1er Grado' in filteredData && selectedGrade !== '1er Grado') filteredData['1er Grado'] = 0;
                if ('2do Grado' in filteredData && selectedGrade !== '2do Grado') filteredData['2do Grado'] = 0;
                if ('3er Grado' in filteredData && selectedGrade !== '3er Grado') filteredData['3er Grado'] = 0;
            } else {
                if ('1er Grado' in filteredData) filteredData['1er Grado'] = Math.max(0, filteredData['1er Grado'] * (Math.random() * (1.2 - 0.8) + 0.8));
                if ('2do Grado' in filteredData) filteredData['2do Grado'] = Math.max(0, filteredData['2do Grado'] * (Math.random() * (1.2 - 0.8) + 0.8));
                if ('3er Grado' in filteredData) filteredData['3er Grado'] = Math.max(0, filteredData['3er Grado'] * (Math.random() * (1.2 - 0.8) + 0.8));
            }
            return filteredData;
        });

        const newApprovalData = originalDataAprobados.map(d => {
            const selectedGrade = appliedFilters.grade;
            
            if (selectedGrade !== "all" && d.name !== selectedGrade) {
                 return { ...d, Aprobados: 0, Desaprobados: 0 };
            }

            const newAprobados = Math.min(100, Math.floor(d.Aprobados * (Math.random() * (1.2 - 0.8) + 0.8)));
            return {
                ...d,
                Aprobados: newAprobados,
                Desaprobados: 100 - newAprobados,
            };
        });

        return { data: newQuestionData, dataAprobados: newApprovalData };

    }, [appliedFilters]);

    const handleExport = () => {
        let csvContent = "";
        const bom = "\uFEFF";
        
        // Headers
        const headersAnalisis = ["Pregunta", "Promedio 1er Grado", "Promedio 2do Grado", "Promedio 3er Grado"];
        const headersAprobados = ["Grado", "% Aprobados", "% Desaprobados"];

        // Análisis por Pregunta
        csvContent += "Análisis por Pregunta\n";
        csvContent += headersAnalisis.join(';') + '\n';
        data.forEach(row => {
            const rowData = [row.name, row['1er Grado'].toFixed(2), row['2do Grado'].toFixed(2), row['3er Grado'].toFixed(2)];
            csvContent += rowData.join(';') + '\n';
        });

        csvContent += '\n\n'; // Separator

        // Aprobados vs. Desaprobados
        csvContent += "Aprobados vs. Desaprobados\n";
        csvContent += headersAprobados.join(';') + '\n';
        dataAprobados.forEach(row => {
            const rowData = [row.name, row.Aprobados, row.Desaprobados];
            csvContent += rowData.join(';') + '\n';
        });

        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "analisis_resultados.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
                         <Button onClick={handleApplyFilters}>
                            <Filter className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                        </Button>
                    </div>
                    <CardDescription>Selecciona los criterios para acotar tu búsqueda. Los gráficos se actualizarán automáticamente.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-distrito">Distrito</Label>
                        <Select onValueChange={(v) => handleFilterChange('district', v)} value={filters.district}>
                            <SelectTrigger id="filtro-distrito"><SelectValue placeholder="Distrito" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {getUniqueValues("district").map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-escuela">Escuela</Label>
                        <Select onValueChange={(v) => handleFilterChange('school', v)} value={filters.school}>
                            <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {getUniqueValues("school").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-grado">Grado</Label>
                        <Select onValueChange={(v) => handleFilterChange('grade', v)} value={filters.grade}>
                            <SelectTrigger id="filtro-grado"><SelectValue placeholder="Grado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {getUniqueValues("grade").map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-curso">Curso</Label>
                        <Select onValueChange={(v) => handleFilterChange('course', v)} value={filters.course}>
                            <SelectTrigger id="filtro-curso"><SelectValue placeholder="Curso" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {getUniqueValues("course").map(c => <SelectItem key={c} value={c}>"{c}"</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-examen">Examen</Label>
                        <Select onValueChange={(v) => handleFilterChange('exam', v)} value={filters.exam}>
                            <SelectTrigger id="filtro-examen"><SelectValue placeholder="Examen" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {getUniqueValues("exam").map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
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
                <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Resultados (CSV)
                </Button>
            </div>
        </div>
    )
}
