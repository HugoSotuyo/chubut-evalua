
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
    
    useEffect(() => {
        let userFilters = { ...filters };
        let filtersChanged = false;

        if (user?.role === 'Director') {
            userFilters.school = user.school;
            userFilters.grade = 'all';
            userFilters.course = 'all';
            filtersChanged = true;
        } else if (user?.role === 'Docente') {
            userFilters.school = user.school;
            userFilters.grade = user.grade ?? 'all';
            userFilters.course = user.course ?? 'all';
            filtersChanged = true;
        }
        
        const examFromUrl = searchParams.get("exam");
        if (examFromUrl) {
            const decodedExamName = decodeURIComponent(examFromUrl);
            userFilters.exam = decodedExamName;
            filtersChanged = true;
        }
        
        if (filtersChanged) {
            setFilters(userFilters);
            setAppliedFilters(userFilters);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, searchParams]);


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
    
    const { dataAprobados, examAnalysisData, questionAnalysisData } = useMemo(() => {
        let filteredData = results;

        if (appliedFilters.exam !== 'all') {
            const examId = exams.find(e => e.name === appliedFilters.exam)?.id;
            if(examId) {
                filteredData = filteredData.filter(r => r.examId === examId);
            }
        }

        if (user?.role === 'Director') {
            filteredData = filteredData.filter(r => r.school === user.school);
        } else if (user?.role === 'Docente') {
            filteredData = filteredData.filter(r => 
                r.school === user.school &&
                r.grade === user.grade &&
                r.course === user.course
            );
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

        // --- Data Aprobados vs. Desaprobados ---
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

        // --- Data Análisis por Examen ---
        const examAnalysis: Record<string, { name: string; school: string; [grade: string]: any; }> = {};
        filteredData.forEach(r => {
            const examKey = r.examName;
            if (!examAnalysis[examKey]) {
                examAnalysis[examKey] = { name: r.examName, school: r.school };
            }
            const gradeKey = r.grade;
            const correctasKey = `${gradeKey}_correctas`;
            const totalMaxScoreKey = `${gradeKey}_totalMaxScore`;

            if (!examAnalysis[examKey][correctasKey]) {
                 examAnalysis[examKey][correctasKey] = 0;
            }
            if (!examAnalysis[examKey][totalMaxScoreKey]) {
                 examAnalysis[examKey][totalMaxScoreKey] = 0;
            }

            examAnalysis[examKey][correctasKey] += r.totalScore;
            examAnalysis[examKey][totalMaxScoreKey] += r.maxScore;
        });
        
        const examAnalysisData = Object.values(examAnalysis).map(exam => {
            const newExamData = { ...exam };
            const grades = [...new Set(Object.keys(exam).filter(k => k.includes('_')).map(k => k.split('_')[0]))];
            grades.forEach(grade => {
                const correctas = exam[`${grade}_correctas`] || 0;
                const totalMaxScore = exam[`${grade}_totalMaxScore`] || 0;
                const rendimientoKey = `${grade}_rendimiento`;
                newExamData[rendimientoKey] = totalMaxScore > 0 ? (correctas / totalMaxScore) * 100 : 0;
            });
            return newExamData;
        });

        // --- Data Análisis por Pregunta ---
        const questionAnalysis: Record<string, { totalScore: number, totalMaxScore: number, count: number }> = {};
        if (appliedFilters.exam !== 'all' && filteredData.length > 0) {
            const examId = exams.find(e => e.name === appliedFilters.exam)?.id;
            const exam = exams.find(e => e.id === examId);

            if (exam) {
                exam.questions.forEach((q, index) => {
                    const questionKey = `Preg. ${index + 1}`;
                    questionAnalysis[questionKey] = { totalScore: 0, totalMaxScore: 0, count: 0 };
                });

                filteredData.forEach(result => {
                    if (result.examId === exam.id) {
                         Object.entries(result.scores).forEach(([qIndex, score]) => {
                             const questionKey = `Preg. ${Number(qIndex) + 1}`;
                             if (questionAnalysis[questionKey]) {
                                 questionAnalysis[questionKey].totalScore += score;
                                 questionAnalysis[questionKey].totalMaxScore += exam.questions[Number(qIndex)].puntaje;
                                 questionAnalysis[questionKey].count += 1;
                             }
                         })
                    }
                });
            }
        }
        const questionAnalysisData = Object.entries(questionAnalysis).map(([name, data]) => ({
            name,
            Rendimiento: data.totalMaxScore > 0 ? (data.totalScore / data.totalMaxScore) * 100 : 0
        }));

        return { dataAprobados, examAnalysisData, questionAnalysisData };

    }, [appliedFilters, user, results, exams]);
    
    const handleExport = () => {
        let csvContent = "";
        const bom = "\uFEFF";
        
        csvContent += "Aprobados vs. Desaprobados (Cantidad de Alumnos)\n";
        csvContent += ["Grado", "Aprobados", "Desaprobados"].join(';') + '\n';
        dataAprobados.forEach(row => {
            if (row.Aprobados > 0 || row.Desaprobados > 0) {
                csvContent += [row.name, row.Aprobados, row.Desaprobados].join(';') + '\n';
            }
        });
        csvContent += '\n\n';

        csvContent += "Análisis por Examen (Puntaje Agregado)\n";
        csvContent += ["Examen", "Grado", "Puntaje Total Obtenido", "Puntaje Máximo Total"].join(';') + '\n';
        examAnalysisData.forEach(row => {
             const grades = [...new Set(Object.keys(row).filter(k => k.includes('_')).map(k => k.split('_')[0]))];
             grades.forEach(grade => {
                const correctasKey = `${grade}_correctas`;
                const totalMaxScoreKey = `${grade}_totalMaxScore`;
                const correctas = row[correctasKey] || 0;
                const totalMaxScore = row[totalMaxScoreKey] || 0;
                 if(correctas > 0 || totalMaxScore > 0){
                    csvContent += [row.name, grade, correctas, totalMaxScore].join(';') + '\n';
                 }
             })
        });
        csvContent += '\n\n';
        
        csvContent += "Análisis por Pregunta (% de Rendimiento)\n";
        csvContent += ["Pregunta", "Rendimiento (%)"].join(';') + '\n';
        questionAnalysisData.forEach(row => {
            csvContent += [row.name, row.Rendimiento.toFixed(2)].join(';') + '\n';
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
                    {pld.name.includes("Rendimiento") 
                        ? `${pld.name}: ${pld.value.toFixed(1)}%`
                        : `${pld.name}: ${pld.value}`
                    }
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
                const noPrintElements = contentToPrint.querySelectorAll('.no-print');
                noPrintElements.forEach(el => el.parentNode?.removeChild(el));
                printWindow.document.write('<html><head><title>Imprimir</title>');
                Array.from(document.styleSheets).forEach(styleSheet => {
                    if (styleSheet.href) {
                        printWindow.document.write(`<link rel="stylesheet" href="${styleSheet.href}">`);
                    }
                });
                printWindow.document.write('<link rel="preconnect" href="https://fonts.googleapis.com">');
                printWindow.document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
                printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">');
                printWindow.document.write('<style>body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .recharts-responsive-container { width: 100% !important; height: auto !important; } </style>');
                printWindow.document.write('</head><body >');
                printWindow.document.write(contentToPrint.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                };
            }
        }
    };
    
    const gradeDataKeys = useMemo(() => {
        const keys = new Set<string>();
        examAnalysisData.forEach(exam => {
            Object.keys(exam).forEach(key => {
                if (key.endsWith('_rendimiento')) {
                    keys.add(key);
                }
            });
        });
        return Array.from(keys);
    }, [examAnalysisData]);


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
                                        {(getUniqueValues("district" as any) as string[]).map((d, i) => <SelectItem key={`${d}-${i}`} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-escuela">Escuela</Label>
                                <Select onValueChange={(v) => handleFilterChange('school', v)} value={filters.school}>
                                    <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {(getUniqueValues("schoolName") as string[]).map((s, i) => <SelectItem key={`${s}-${i}`} value={s}>{s}</SelectItem>)}
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
                                        {(getUniqueValues("grade") as string[]).map((g, i) => <SelectItem key={`${g}-${i}`} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-curso">Curso</Label>
                                <Select onValueChange={(v) => handleFilterChange('course', v)} value={filters.course}>
                                    <SelectTrigger id="filtro-curso"><SelectValue placeholder="Curso" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {(getUniqueValues("course") as string[]).map((c, i) => <SelectItem key={`${c}-${i}`} value={c}>"{c}"</SelectItem>)}
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
                                {(getUniqueValues("examName") as string[]).map((e, i) => <SelectItem key={`${e}-${i}`} value={e}>{e}</SelectItem>)}
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
                            <CardDescription>Rendimiento promedio por pregunta en el examen seleccionado.</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="no-print" onClick={() => handlePrint('analisis-pregunta-card')}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {questionAnalysisData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={questionAnalysisData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} unit="%" />
                                    <Tooltip content={<CustomTooltip />}/>
                                    <Bar dataKey="Rendimiento" fill="hsl(var(--chart-2))" name="Rendimiento">
                                         <LabelList dataKey="Rendimiento" position="top" formatter={(value: number) => `${value.toFixed(1)}%`}/>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                       ) : (
                           <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                {appliedFilters.exam === 'all' ? "Selecciona un examen para ver el análisis por pregunta." : "No hay datos para el examen seleccionado."}
                           </div>
                       )}
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
                                <Tooltip content={<CustomTooltip />}/>
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
                        <CardDescription>Rendimiento por examen, desglosado por grado.</CardDescription>
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
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {gradeDataKeys.map((dataKey, index) => {
                                const gradeName = dataKey.replace('_rendimiento', '');
                                const colorKey = `chart-${(index % 5) + 1}` as const;
                                return (
                                    <Bar 
                                        key={dataKey}
                                        name={`${gradeName} - Rendimiento`} 
                                        dataKey={dataKey} 
                                        fill={`hsl(var(--${colorKey}))`} 
                                    >
                                        <LabelList dataKey={dataKey} position="top" formatter={(value: number) => `${value.toFixed(1)}%`} />
                                    </Bar>
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
                                {examAnalysisData.map((examen) => {
                                    const grades = [...new Set(Object.keys(examen).filter(k => k.includes('_')).map(k => k.split('_')[0]))];
                                    const visibleGrades = grades.filter(grade => {
                                        const correctas = examen[`${grade}_correctas`] || 0;
                                        const totalMaxScore = examen[`${grade}_totalMaxScore`] || 0;
                                        return correctas > 0 || totalMaxScore > 0;
                                    });
                                    let firstVisibleRowRendered = false;

                                    return visibleGrades.map((grade, index) => {
                                        const correctasKey = `${grade}_correctas`;
                                        const totalMaxScoreKey = `${grade}_totalMaxScore`;
                                        const correctas = examen[correctasKey];
                                        const totalMaxScore = examen[totalMaxScoreKey];
                                        const rendimiento = totalMaxScore > 0 ? ((correctas / totalMaxScore) * 100).toFixed(1) : "0.0";
                                        
                                        const isFirstVisibleRow = !firstVisibleRowRendered;
                                        if (isFirstVisibleRow) {
                                            firstVisibleRowRendered = true;
                                        }

                                        return (
                                            <TableRow key={`${examen.name}-${grade}`}>
                                                {isFirstVisibleRow && (
                                                    <TableCell 
                                                        rowSpan={visibleGrades.length} 
                                                        className="font-medium align-middle"
                                                    >
                                                        {examen.name}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">{grade}</TableCell>
                                                <TableCell className="text-center">{correctas}</TableCell>
                                                <TableCell className="text-center">{totalMaxScore}</TableCell>
                                                <TableCell className="text-center">{rendimiento}%</TableCell>
                                            </TableRow>
                                        )
                                    })
                                })}
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
