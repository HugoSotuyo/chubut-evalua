
"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, Filter, Printer } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useExams } from "@/context/exams-context";
import { useResults } from "@/context/results-context"
import type { Result } from "@/context/results-context"


const mockResults = [
    { district: "Distrito I", school: "Escuela N° 101", grade: "1er Grado", course: "A", exam: "Matemática 2023" },
    { district: "Distrito I", school: "Escuela N° 456", grade: "2do Grado", course: "B", exam: "Lengua 2024" },
    { district: "Distrito II", school: "Escuela N° 789", grade: "3er Grado", course: "C", exam: "Ciencias 2023" },
    { district: "Distrito II", school: "Escuela N° 502", grade: "1er Grado", course: "A", exam: "Diagnóstico 2024" },
    { district: "Distrito III", school: "Escuela N° 23", grade: "4to Grado", course: "A", exam: "Cierre 2023" },
    { district: "Distrito I", school: "Escuela N° 101", grade: "3er Grado", course: "A", exam: "Matemática 2023" },
];

function AnalisisPageContent() {
    const { user } = useAuth();
    const { exams } = useExams();
    const { results } = useResults();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState({
        district: "all",
        school: "all",
        grade: "all",
        course: "all",
        exam: "all",
        question: "all",
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);
    
    // Total de alumnos por grado (simulado) - Podríamos calcularlo desde los alumnos en el futuro
    const totalAlumnosPorGrado = useMemo(() => {
        const counts: Record<string, number> = {};
        results.forEach(r => {
            if (!counts[r.grade]) counts[r.grade] = 0;
            counts[r.grade]++;
        })
        return counts;
    }, [results])

    useEffect(() => {
        const userFilters = { ...filters };
        let filtersChanged = false;

        if (user?.role === 'Director') {
            userFilters.school = user.school;
            filtersChanged = true;
        } else if (user?.role === 'Docente') {
            userFilters.school = user.school;
            userFilters.grade = user.grade ?? 'all';
            userFilters.course = user.course ?? 'all';
            filtersChanged = true;
        }
        
        if (filtersChanged) {
            setFilters(userFilters);
            setAppliedFilters(userFilters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        const examFromUrl = searchParams.get("exam");
        if (examFromUrl) {
            const decodedExamName = decodeURIComponent(examFromUrl);
            const newFilters = { ...filters, exam: decodedExamName };
            setFilters(newFilters);
            setAppliedFilters(newFilters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const getUniqueValues = (key: keyof Result | "examName" | "schoolName") => {
        if (key === 'examName') {
            return [...new Set(exams.map(e => e.name))];
        }
        if (key === 'schoolName') {
             return [...new Set(results.map(r => r.school))];
        }
        const values = results.map(item => item[key as keyof Result]);
        return [...new Set(values)];
    }

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [filterName]: value}));
    }

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    }
    
    const { dataAprobados, examAnalysisData } = useMemo(() => {
        let filteredData = results;

        if (user?.role === 'Director') {
            filteredData = filteredData.filter(r => r.school === user.school);
        } else if (user?.role === 'Docente') {
            filteredData = filteredData.filter(r => 
                r.school === user.school &&
                r.grade === user.grade &&
                r.course === user.course
            );
        }

        if (appliedFilters.exam !== 'all') {
            filteredData = filteredData.filter(r => r.examName === appliedFilters.exam);
        }
        if (appliedFilters.school !== 'all') {
            filteredData = filteredData.filter(r => r.school === appliedFilters.school);
        }
        if (appliedFilters.grade !== 'all') {
            filteredData = filteredData.filter(r => r.grade === appliedFilters.grade);
        }
        if (appliedFilters.course !== 'all') {
            filteredData = filteredData.filter(r => r.course === appliedFilters.course);
        }

        // Procesamiento para Aprobados/Desaprobados
        const aprobadosPorGrado: Record<string, { Aprobados: number, Desaprobados: number }> = {};
        filteredData.forEach(r => {
            if (!aprobadosPorGrado[r.grade]) {
                aprobadosPorGrado[r.grade] = { Aprobados: 0, Desaprobados: 0 };
            }
            if (r.status === 'Aprobado') {
                aprobadosPorGrado[r.grade].Aprobados++;
            } else {
                aprobadosPorGrado[r.grade].Desaprobados++;
            }
        });
        const dataAprobados = Object.entries(aprobadosPorGrado).map(([grade, counts]) => ({
            name: grade,
            ...counts
        }));

        // Procesamiento para Análisis por Examen
        const examAnalysis: Record<string, {
            name: string;
            school: string;
            [grade: string]: any;
        }> = {};

        filteredData.forEach(r => {
            const examKey = r.examName;
            if (!examAnalysis[examKey]) {
                examAnalysis[examKey] = { name: r.examName, school: r.school };
            }
            if (!examAnalysis[examKey][r.grade]) {
                examAnalysis[examKey][r.grade] = { correctas: 0, incorrectas: 0 };
            }
            
            // Simulación de correctas e incorrectas basado en el score
            // Esto es una aproximación. Lo ideal sería tener las respuestas individuales.
            const correctas = Math.round(r.totalScore);
            const incorrectas = Math.round(r.maxScore - r.totalScore);

            examAnalysis[examKey][r.grade].correctas += correctas;
            examAnalysis[examKey][r.grade].incorrectas += incorrectas;
        });

        const examAnalysisData = Object.values(examAnalysis);

        return { dataAprobados, examAnalysisData };

    }, [appliedFilters, user, results]);
    
    // TODO: La data de preguntas no está disponible en los resultados, por lo que no se puede implementar el gráfico de análisis por pregunta.
    const data = [] as any[];


    const handleExport = () => {
        let csvContent = "";
        const bom = "\uFEFF";
        
        // Headers
        const headersAprobados = ["Grado", "Aprobados", "Desaprobados"];
        const headersExamen = ["Examen", "Grado", "Correctas", "Incorrectas"];

        // Aprobados vs. Desaprobados
        csvContent += "Aprobados vs. Desaprobados (Cantidad de Alumnos)\n";
        csvContent += headersAprobados.join(';') + '\n';
        dataAprobados.forEach(row => {
            if (row.Aprobados > 0 || row.Desaprobados > 0) {
                const rowData = [row.name, row.Aprobados, row.Desaprobados];
                csvContent += rowData.join(';') + '\n';
            }
        });

        csvContent += '\n\n';

        // Análisis por Examen
        csvContent += "Análisis por Examen (Puntaje Agregado)\n";
        csvContent += headersExamen.join(';') + '\n';
        examAnalysisData.forEach(row => {
             Object.keys(row).forEach(key => {
                if (key !== 'name' && key !== 'school') {
                    const gradeData = row[key as keyof typeof row] as { correctas: number, incorrectas: number };
                    if (gradeData.correctas > 0 || gradeData.incorrectas > 0) {
                        const rowData = [row.name, key, gradeData.correctas, gradeData.incorrectas];
                        csvContent += rowData.join(';') + '\n';
                    }
                }
            });
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
    
    const handlePrint = (cardId: string) => {
        const printContent = document.getElementById(cardId);
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                const contentToPrint = printContent.cloneNode(true) as HTMLElement;
                
                // Eliminar el botón de impresión de la copia para que no aparezca en la impresión
                const noPrintElements = contentToPrint.querySelectorAll('.no-print');
                noPrintElements.forEach(el => el.parentNode?.removeChild(el));

                printWindow.document.write('<html><head><title>Imprimir</title>');
                // Enlazar las mismas hojas de estilo que la página principal
                Array.from(document.styleSheets).forEach(styleSheet => {
                    if (styleSheet.href) {
                        printWindow.document.write(`<link rel="stylesheet" href="${styleSheet.href}">`);
                    }
                });
                // Enlazar fuentes de google
                printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
                printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
                printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">');
                
                printWindow.document.write('<style>body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .recharts-responsive-container { width: 100% !important; height: auto !important; } </style>');
                printWindow.document.write('</head><body >');
                printWindow.document.write(contentToPrint.innerHTML);
                printWindow.document.write('</body></html>');
                
                printWindow.document.close();
                
                // Esperar a que los estilos se carguen antes de imprimir
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                };
            }
        }
    };

    if (!user) {
        return <div>Cargando...</div>;
    }

    const showGeneralFilters = user.role !== 'Director' && user.role !== 'Docente';
    const showGradeCourseFilters = user.role !== 'Docente';


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Análisis de Resultados</h1>
                <p className="text-muted-foreground">Filtra y visualiza los datos de las evaluaciones.</p>
            </div>

            <Card className="no-print">
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
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {showGeneralFilters && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-distrito">Distrito</Label>
                                <Select onValueChange={(v) => handleFilterChange('district', v)} value={filters.district}>
                                    <SelectTrigger id="filtro-distrito"><SelectValue placeholder="Distrito" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {getUniqueValues("district" as any).map((d: any) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-escuela">Escuela</Label>
                                <Select onValueChange={(v) => handleFilterChange('school', v)} value={filters.school}>
                                    <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {getUniqueValues("schoolName").map(s => <SelectItem key={s as string} value={s as string}>{s as string}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                     {showGradeCourseFilters && (
                        <>
                             <div className="grid gap-2">
                                <Label htmlFor="filtro-grado">Grado</Label>
                                <Select onValueChange={(v) => handleFilterChange('grade', v)} value={filters.grade}>
                                    <SelectTrigger id="filtro-grado"><SelectValue placeholder="Grado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {getUniqueValues("grade").map(g => <SelectItem key={g as string} value={g as string}>{g as string}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-curso">Curso</Label>
                                <Select onValueChange={(v) => handleFilterChange('course', v)} value={filters.course}>
                                    <SelectTrigger id="filtro-curso"><SelectValue placeholder="Curso" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {getUniqueValues("course").map(c => <SelectItem key={c as string} value={c as string}>"{c}"</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                     )}
                     <div className="grid gap-2">
                        <Label htmlFor="filtro-examen">Examen</Label>
                        <Select onValueChange={(v) => handleFilterChange('exam', v)} value={filters.exam}>
                            <SelectTrigger id="filtro-examen"><SelectValue placeholder="Examen" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {getUniqueValues("examName").map(e => <SelectItem key={e as string} value={e as string}>{e as string}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="filtro-pregunta">Pregunta</Label>
                        <Select onValueChange={(v) => handleFilterChange('question', v)} value={filters.question}>
                            <SelectTrigger id="filtro-pregunta" disabled><SelectValue placeholder="Pregunta (No disp.)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card id="analisis-pregunta-card">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Análisis por Pregunta</CardTitle>
                            <CardDescription>Esta funcionalidad requiere almacenar respuestas individuales (próximamente).</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="no-print" onClick={() => handlePrint('analisis-pregunta-card')}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            Gráfico no disponible
                       </div>
                    </CardContent>
                </Card>
                <Card id="aprobados-desaprobados-card">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Aprobados vs. Desaprobados</CardTitle>
                            <CardDescription>Cantidad de alumnos por condición en cada grado.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="no-print" onClick={() => handlePrint('aprobados-desaprobados-card')}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir</span>
                        </Button>
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
                                        const total = item.Aprobados + item.Desaprobados
                                        const aprobadosPercent = total > 0 ? ((item.Aprobados / total) * 100).toFixed(1) : "0.0";
                                        const desaprobadosPercent = total > 0 ? ((item.Desaprobados / total) * 100).toFixed(1) : "0.0";
                                        
                                        if (item.Aprobados === 0 && item.Desaprobados === 0) return null;

                                        return (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.Aprobados}</TableCell>
                                                <TableCell className="text-center">{aprobadosPercent}%</TableCell>
                                                <TableCell className="text-center">{item.Desaprobados}</TableCell>
                                                <TableCell className="text-center">{desaprobadosPercent}%</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="col-span-1 lg:col-span-2" id="analisis-examen-card">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Análisis por Examen</CardTitle>
                        <CardDescription>Resultados por examen, desglosado por grado.</CardDescription>
                    </div>
                     <Button variant="outline" size="icon" className="no-print" onClick={() => handlePrint('analisis-examen-card')}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={examAnalysisData} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {/* Bucle para crear las barras dinámicamente */}
                             {Object.keys(getUniqueValues('grade')).map((gradeIndex) => {
                                const grade = getUniqueValues('grade')[gradeIndex as any] as string;
                                const colorKey = `chart-${(parseInt(gradeIndex) % 5) + 1}` as const;
                                return (
                                    <React.Fragment key={grade}>
                                        <Bar name={`${grade} - Puntaje`} dataKey={`${grade}.correctas`} fill={`hsl(var(--${colorKey}))`} >
                                            <LabelList dataKey={`${grade}.correctas`} position="top" formatter={(value: number) => value > 0 ? value : ''} />
                                        </Bar>
                                    </React.Fragment>
                                );
                            })}
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
                                    <TableHead className="text-center">Puntaje Total</TableHead>
                                    <TableHead className="text-center">Puntaje Máx Total</TableHead>
                                    <TableHead className="text-center">% Rendimiento</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {examAnalysisData.map((examen) => (
                                    <React.Fragment key={examen.name}>
                                        {Object.keys(examen).filter(key => key !== 'name' && key !== 'school').map((grade, index) => {
                                            const examenData = examen[grade as keyof typeof examen] as { correctas: number; incorrectas: number } | undefined;
                                            
                                            if (!examenData) return null;

                                            const { correctas, incorrectas } = examenData;
                                            const maxScore = correctas + incorrectas;
                                            const rendimiento = maxScore > 0 ? ((correctas / maxScore) * 100).toFixed(1) : "0.0";
                                            
                                            const shouldShowRow = !(correctas === 0 && incorrectas === 0);
                                            if (!shouldShowRow) return null;
                                            
                                            const firstVisibleRow = Object.keys(examen).filter(key => key !== 'name' && key !== 'school').findIndex(g => {
                                                const data = examen[g as keyof typeof examen] as { correctas: number; incorrectas: number };
                                                return data && (data.correctas > 0 || data.incorrectas > 0);
                                            });
                                            
                                            return (
                                                <TableRow key={grade}>
                                                    {index === firstVisibleRow && (
                                                        <TableCell 
                                                             rowSpan={Object.keys(examen).filter(key => key !== 'name' && key !== 'school').reduce((acc, g) => {
                                                                const data = examen[g as keyof typeof examen] as { correctas: number; incorrectas: number };
                                                                return acc + (data && (data.correctas > 0 || data.incorrectas > 0) ? 1 : 0);
                                                            }, 0)} 
                                                            className="font-medium align-middle"
                                                        >
                                                            {examen.name}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-center">{grade}</TableCell>
                                                    <TableCell className="text-center">{correctas}</TableCell>
                                                    <TableCell className="text-center">{maxScore}</TableCell>
                                                    <TableCell className="text-center">{rendimiento}%</TableCell>
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

             <div className="flex justify-end col-span-1 lg:col-span-2 no-print">
                <Button onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Resultados (CSV)
                </Button>
            </div>
        </div>
    )
}

export default function AnalisisPage() {
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <AnalisisPageContent />
        </React.Suspense>
    )
}

    