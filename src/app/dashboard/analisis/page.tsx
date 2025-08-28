
"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Filter } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Total de alumnos por grado (simulado)
const totalAlumnos = { '1er Grado': 100, '2do Grado': 120, '3er Grado': 110, '4to Grado': 95, '5to Grado': 105 };

// Datos simulados: Cantidad de respuestas correctas e incorrectas por pregunta.
const originalData = [
  { name: 'Pregunta 1', '1er Grado': { correctas: 80, incorrectas: 20 }, '2do Grado': { correctas: 84, incorrectas: 36 }, '3er Grado': { correctas: 94, incorrectas: 16 } },
  { name: 'Pregunta 2', '1er Grado': { correctas: 60, incorrectas: 40 }, '2do Grado': { correctas: 78, incorrectas: 42 }, '3er Grado': { correctas: 77, incorrectas: 33 } },
  { name: 'Pregunta 3', '1er Grado': { correctas: 90, incorrectas: 10 }, '2do Grado': { correctas: 96, incorrectas: 24 }, '3er Grado': { correctas: 105, incorrectas: 5 } },
  { name: 'Pregunta 4', '1er Grado': { correctas: 50, incorrectas: 50 }, '2do Grado': { correctas: 72, incorrectas: 48 }, '3er Grado': { correctas: 61, incorrectas: 49 } },
  { name: 'Pregunta 5', '1er Grado': { correctas: 70, incorrectas: 30 }, '2do Grado': { correctas: 90, incorrectas: 30 }, '3er Grado': { correctas: 88, incorrectas: 22 } },
];


// Datos calculados en base a porcentajes y totales.
const originalDataAprobados = [
    { name: '1er Grado', Aprobados: 75, Desaprobados: 25 },
    { name: '2do Grado', Aprobados: 96, Desaprobados: 24 }, // 80% de 120
    { name: '3er Grado', Aprobados: 97, Desaprobados: 13 }, // 88% de 110
    { name: '4to Grado', Aprobados: 67, Desaprobados: 28 }, // 70% de 95
    { name: '5to Grado', Aprobados: 97, Desaprobados: 8 },  // 92% de 105
];

const originalExamAnalysisData = [
  { name: 'Matemática 2023', '1er Grado': { correctas: 70, incorrectas: 30 }, '2do Grado': { correctas: 80, incorrectas: 40 }, '3er Grado': { correctas: 90, incorrectas: 20 } },
  { name: 'Lengua 2024', '1er Grado': { correctas: 85, incorrectas: 15 }, '2do Grado': { correctas: 95, incorrectas: 25 }, '3er Grado': { correctas: 100, incorrectas: 10 } },
  { name: 'Ciencias 2023', '1er Grado': { correctas: 65, incorrectas: 35 }, '2do Grado': { correctas: 75, incorrectas: 45 }, '3er Grado': { correctas: 85, incorrectas: 25 } },
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
    
    const { data, dataAprobados, examAnalysisData } = useMemo(() => {
        const hasActiveFilters = Object.values(appliedFilters).some(value => value !== "all");

        if (!hasActiveFilters) {
             return { data: originalData, dataAprobados: originalDataAprobados, examAnalysisData: originalExamAnalysisData };
        }
        
        const alterData = (data: { correctas: number; incorrectas: number }) => {
            const total = data.correctas + data.incorrectas;
            const newCorrectas = Math.floor(data.correctas * (Math.random() * (1.2 - 0.8) + 0.8));
            return {
                correctas: Math.min(total, newCorrectas),
                incorrectas: Math.max(0, total - Math.min(total, newCorrectas)),
            };
        };

        const newQuestionData = originalData.map(d => {
            let filteredData = { ...d };
            const selectedGrade = appliedFilters.grade;

            const shouldFilter = (key: '1er Grado' | '2do Grado' | '3er Grado') => {
                return selectedGrade !== 'all' && key !== selectedGrade;
            };
            
            if (hasActiveFilters) {
                filteredData['1er Grado'] = shouldFilter('1er Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['1er Grado']);
                filteredData['2do Grado'] = shouldFilter('2do Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['2do Grado']);
                filteredData['3er Grado'] = shouldFilter('3er Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['3er Grado']);
            } else {
                return d;
            }

            return filteredData;
        });

        const newApprovalData = originalDataAprobados.map(d => {
            const selectedGrade = appliedFilters.grade;
            
            if (selectedGrade !== "all" && d.name !== selectedGrade) {
                 return { ...d, Aprobados: 0, Desaprobados: 0 };
            }

            if (hasActiveFilters) {
                const total = (totalAlumnos[d.name as keyof typeof totalAlumnos] || 100);
                const newAprobados = Math.floor(d.Aprobados * (Math.random() * (1.2 - 0.8) + 0.8));
                
                return {
                    ...d,
                    Aprobados: Math.min(total, newAprobados),
                    Desaprobados: Math.max(0, total - Math.min(total, newAprobados)),
                };
            }
            return d;
        });
        
        const newExamAnalysisData = originalExamAnalysisData.map(d => {
            let filteredData = { ...d };
            const selectedGrade = appliedFilters.grade;

            const shouldFilter = (key: '1er Grado' | '2do Grado' | '3er Grado') => {
                return selectedGrade !== 'all' && key !== selectedGrade;
            };

            if (hasActiveFilters) {
                filteredData['1er Grado'] = shouldFilter('1er Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['1er Grado']);
                filteredData['2do Grado'] = shouldFilter('2do Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['2do Grado']);
                filteredData['3er Grado'] = shouldFilter('3er Grado') ? { correctas: 0, incorrectas: 0 } : alterData(d['3er Grado']);
            } else {
                return d;
            }

            return filteredData;
        });

        return { data: newQuestionData, dataAprobados: newApprovalData, examAnalysisData: newExamAnalysisData };

    }, [appliedFilters]);

    const handleExport = () => {
        let csvContent = "";
        const bom = "\uFEFF";
        
        // Headers
        const headersAnalisis = ["Pregunta", "Grado", "Correctas", "Incorrectas"];
        const headersAprobados = ["Grado", "Aprobados", "Desaprobados"];

        // Análisis por Pregunta
        csvContent += "Análisis por Pregunta (Cantidad de Respuestas)\n";
        csvContent += headersAnalisis.join(';') + '\n';
        data.forEach(row => {
            Object.keys(row).forEach(key => {
                if (key !== 'name') {
                    const gradeData = row[key as keyof typeof row] as { correctas: number, incorrectas: number };
                    const rowData = [row.name, key, gradeData.correctas, gradeData.incorrectas];
                    csvContent += rowData.join(';') + '\n';
                }
            });
        });

        csvContent += '\n\n'; // Separator

        // Aprobados vs. Desaprobados
        csvContent += "Aprobados vs. Desaprobados (Cantidad de Alumnos)\n";
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
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
            <div className="p-2 bg-background border rounded-lg shadow-lg">
                <p className="font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                <p key={index} style={{ color: pld.fill }}>
                    {`${pld.name}: ${pld.value}`}
                </p>
                ))}
            </div>
            );
        }
        return null;
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
                        <CardDescription>Respuestas correctas vs. incorrectas por pregunta y grado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar name="1er Grado - Correctas" dataKey="1er Grado.correctas" fill="hsl(var(--chart-5))">
                                    <LabelList dataKey="1er Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                <Bar name="1er Grado - Incorrectas" dataKey="1er Grado.incorrectas" fill="hsl(var(--chart-5)/0.4)">
                                    <LabelList dataKey="1er Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                 <Bar name="2do Grado - Correctas" dataKey="2do Grado.correctas" fill="hsl(var(--chart-4))">
                                    <LabelList dataKey="2do Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                <Bar name="2do Grado - Incorrectas" dataKey="2do Grado.incorrectas" fill="hsl(var(--chart-4)/0.4)">
                                    <LabelList dataKey="2do Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                 <Bar name="3er Grado - Correctas" dataKey="3er Grado.correctas" fill="hsl(var(--chart-3))">
                                    <LabelList dataKey="3er Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                <Bar name="3er Grado - Incorrectas" dataKey="3er Grado.incorrectas" fill="hsl(var(--chart-3)/0.4)">
                                    <LabelList dataKey="3er Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <Separator />
                        <CardDescription>Datos detallados por pregunta.</CardDescription>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Preg.</TableHead>
                                        <TableHead className="font-bold text-center">Grado</TableHead>
                                        <TableHead className="text-center">Corr.</TableHead>
                                        <TableHead className="text-center">% Corr.</TableHead>
                                        <TableHead className="text-center">Incorr.</TableHead>
                                        <TableHead className="text-center">% Incorr.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((pregunta) => (
                                        <React.Fragment key={pregunta.name}>
                                            {['1er Grado', '2do Grado', '3er Grado'].map((grado, index) => {
                                                const gradoKey = grado as keyof typeof totalAlumnos;
                                                const total = totalAlumnos[gradoKey];
                                                const { correctas, incorrectas } = pregunta[gradoKey as keyof typeof pregunta] as { correctas: number, incorrectas: number };
                                                const correctasPercent = total > 0 ? ((correctas / total) * 100).toFixed(1) : 0;
                                                const incorrectasPercent = total > 0 ? ((incorrectas / total) * 100).toFixed(1) : 0;
                                                
                                                if (correctas === 0 && incorrectas === 0 && appliedFilters.grade !== 'all' && appliedFilters.grade !== gradoKey) {
                                                    return null;
                                                }

                                                return (
                                                    <TableRow key={grado}>
                                                        {index === 0 && <TableCell rowSpan={3} className="font-medium align-middle px-2 py-1">{pregunta.name}</TableCell>}
                                                        <TableCell className="text-center px-2 py-1">{grado}</TableCell>
                                                        <TableCell className="text-center px-2 py-1">{correctas}</TableCell>
                                                        <TableCell className="text-center px-2 py-1">{correctasPercent}%</TableCell>
                                                        <TableCell className="text-center px-2 py-1">{incorrectas}</TableCell>
                                                        <TableCell className="text-center px-2 py-1">{incorrectasPercent}%</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Aprobados vs. Desaprobados</CardTitle>
                        <CardDescription>Cantidad de alumnos por condición en cada grado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataAprobados} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Aprobados" fill="hsl(var(--chart-1))" stackId="a">
                                    <LabelList dataKey="Aprobados" position="center" className="fill-white font-bold" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                                <Bar dataKey="Desaprobados" fill="hsl(var(--chart-3))" stackId="a">
                                     <LabelList dataKey="Desaprobados" position="center" className="fill-white font-bold" formatter={(value: number) => value > 0 ? value : ''} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <Separator />
                        <CardDescription>Datos detallados por condición.</CardDescription>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Grado</TableHead>
                                        <TableHead className="text-center">Aprob.</TableHead>
                                        <TableHead className="text-center">% Aprob.</TableHead>
                                        <TableHead className="text-center">Desap.</TableHead>
                                        <TableHead className="text-center">% Desap.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataAprobados.map((item) => {
                                        const gradoKey = item.name as keyof typeof totalAlumnos;
                                        const total = totalAlumnos[gradoKey];
                                        const aprobadosPercent = total > 0 ? ((item.Aprobados / total) * 100).toFixed(1) : "0.0";
                                        const desaprobadosPercent = total > 0 ? ((item.Desaprobados / total) * 100).toFixed(1) : "0.0";
                                        
                                        if (item.Aprobados === 0 && item.Desaprobados === 0 && appliedFilters.grade !== 'all' && appliedFilters.grade !== gradoKey) {
                                            return null;
                                        }

                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium px-2 py-1">{item.name}</TableCell>
                                                <TableCell className="text-center px-2 py-1">{item.Aprobados}</TableCell>
                                                <TableCell className="text-center px-2 py-1">{aprobadosPercent}%</TableCell>
                                                <TableCell className="text-center px-2 py-1">{item.Desaprobados}</TableCell>
                                                <TableCell className="text-center px-2 py-1">{desaprobadosPercent}%</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Análisis por Examen</CardTitle>
                    <CardDescription>Resultados por examen, desglosado por grado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={examAnalysisData} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar name="1er Grado - Correctas" dataKey="1er Grado.correctas" fill="hsl(var(--chart-5))">
                                <LabelList dataKey="1er Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                            <Bar name="1er Grado - Incorrectas" dataKey="1er Grado.incorrectas" fill="hsl(var(--chart-5)/0.4)">
                                <LabelList dataKey="1er Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                             <Bar name="2do Grado - Correctas" dataKey="2do Grado.correctas" fill="hsl(var(--chart-4))">
                                <LabelList dataKey="2do Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                            <Bar name="2do Grado - Incorrectas" dataKey="2do Grado.incorrectas" fill="hsl(var(--chart-4)/0.4)">
                                <LabelList dataKey="2do Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                             <Bar name="3er Grado - Correctas" dataKey="3er Grado.correctas" fill="hsl(var(--chart-3))">
                                <LabelList dataKey="3er Grado.correctas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                            <Bar name="3er Grado - Incorrectas" dataKey="3er Grado.incorrectas" fill="hsl(var(--chart-3)/0.4)">
                                <LabelList dataKey="3er Grado.incorrectas" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <Separator />
                    <CardDescription>Datos detallados por examen.</CardDescription>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">Examen</TableHead>
                                    <TableHead className="font-bold text-center">Grado</TableHead>
                                    <TableHead className="text-center">Corr.</TableHead>
                                    <TableHead className="text-center">% Corr.</TableHead>
                                    <TableHead className="text-center">Incorr.</TableHead>
                                    <TableHead className="text-center">% Incorr.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examAnalysisData.map((examen) => (
                                    <React.Fragment key={examen.name}>
                                        {['1er Grado', '2do Grado', '3er Grado'].map((grado, index) => {
                                            const gradoKey = grado as keyof typeof totalAlumnos;
                                            const total = totalAlumnos[gradoKey];
                                            const { correctas, incorrectas } = examen[gradoKey as keyof typeof examen] as { correctas: number, incorrectas: number };
                                            const correctasPercent = total > 0 ? ((correctas / total) * 100).toFixed(1) : 0;
                                            const incorrectasPercent = total > 0 ? ((incorrectas / total) * 100).toFixed(1) : 0;
                                            
                                            if (correctas === 0 && incorrectas === 0 && appliedFilters.grade !== 'all' && appliedFilters.grade !== gradoKey) {
                                                return null;
                                            }

                                            return (
                                                <TableRow key={grado}>
                                                    {index === 0 && <TableCell rowSpan={3} className="font-medium align-middle px-2 py-1">{examen.name}</TableCell>}
                                                    <TableCell className="text-center px-2 py-1">{grado}</TableCell>
                                                    <TableCell className="text-center px-2 py-1">{correctas}</TableCell>
                                                    <TableCell className="text-center px-2 py-1">{correctasPercent}%</TableCell>
                                                    <TableCell className="text-center px-2 py-1">{incorrectas}</TableCell>
                                                    <TableCell className="text-center px-2 py-1">{incorrectasPercent}%</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

             <div className="flex justify-end col-span-1 lg:col-span-2">
                <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Resultados (CSV)
                </Button>
            </div>
        </div>
    )
}
