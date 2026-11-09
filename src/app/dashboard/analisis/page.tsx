

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
import { useSchools } from "@/context/schools-context"
import { useStudents } from "@/context/students-context"
import { useSettings } from "@/context/settings-context"

const GRADE_COLORS: Record<string, { main: string, approved: string, disapproved: string }> = {
    "1er Grado": { main: "hsl(var(--chart-1))", approved: "hsl(var(--chart-1))", disapproved: "hsl(var(--chart-1-light))" },
    "2do Grado": { main: "hsl(var(--chart-5))", approved: "hsl(var(--chart-5))", disapproved: "hsl(var(--chart-5-light))" },
    "3er Grado": { main: "hsl(var(--chart-2))", approved: "hsl(var(--chart-2))", disapproved: "hsl(var(--chart-2-light))" },
    "4to Grado": { main: "hsl(var(--chart-4))", approved: "hsl(var(--chart-4))", disapproved: "hsl(var(--chart-4-light))" },
    "5to Grado": { main: "hsl(var(--primary))", approved: "hsl(var(--primary))", disapproved: "hsl(var(--primary-light))" },
    "6to Grado": { main: "hsl(var(--chart-3))", approved: "hsl(var(--chart-3))", disapproved: "hsl(var(--chart-3-light))" },
};

const getGradeColor = (grade: string | undefined, type: 'main' | 'approved' | 'disapproved'): string => {
    if (!grade) return "hsl(var(--muted-foreground))";
    return GRADE_COLORS[grade]?.[type] || "hsl(var(--muted-foreground))";
};

const getGradeOrder = (grade: string): number => {
    const match = grade.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 99;
}


export default function AnalisisPage() {
    const { user, loading: authLoading } = useAuth();
    const { exams: allExams, loading: examsLoading } = useExams();
    const { results: allResults, loading: resultsLoading } = useResults();
    const { schools: allSchools, regions: allRegions, loading: schoolsLoading } = useSchools();
    const { students: allStudents, loading: studentsLoading } = useStudents();
    const { settings } = useSettings();
    const searchParams = useSearchParams();

    const userRegion = useMemo(() => {
        if (!user) return undefined;
        return user.region || (user.school.startsWith("Región") ? user.school : allSchools.find(s => s.name === user.school)?.region);
    }, [user, allSchools]);

    const [filters, setFilters] = useState({
        region: "all",
        school: "all",
        grade: "all",
        course: "all",
        exam: "all",
        schoolYear: settings.currentSchoolYear || "all",
    });

    const [appliedFilters, setAppliedFilters] = useState(filters);

    // Effect to set initial filters based on user role
    useEffect(() => {
        if (user && !searchParams.get("exam")) {
            let initialFilters = {
                region: "all",
                school: "all",
                grade: "all",
                course: "all",
                exam: "all",
                schoolYear: settings.currentSchoolYear || "all",
            };

            if (user.role === 'Director') {
                initialFilters.school = user.school;
            } else if (user.role === 'Referente') {
                initialFilters.region = userRegion || 'all';
            } else if (user.role === 'Docente') {
                initialFilters.school = user.school;
                initialFilters.grade = user.grade ?? 'all';
                initialFilters.course = user.course ?? 'all';
                initialFilters.schoolYear = settings.currentSchoolYear; // Force current year for teacher
            }

            setFilters(initialFilters);
            setAppliedFilters(initialFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, settings.currentSchoolYear]);

    // When school year filter changes, reset other filters
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            region: user?.role === 'Referente' ? (userRegion || 'all') : 'all',
            school: (user?.role === "Director" || user?.role === "Docente") ? user.school : 'all',
            grade: user?.role === 'Docente' ? user.grade ?? 'all' : 'all',
            course: user?.role === 'Docente' ? user.course ?? 'all' : 'all',
            exam: 'all',
        }));
    }, [filters.schoolYear, user, userRegion]);

    // When grade filter changes, reset exam filter
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            exam: 'all',
        }));
    }, [filters.grade]);


    // Effect to handle exam filter from URL
    useEffect(() => {
        const examFromUrl = searchParams.get("exam");
        if (examFromUrl) {
            const decodedExamName = decodeURIComponent(examFromUrl);
            const examObject = allExams.find(e => e.name === decodedExamName);

            if (examObject && decodedExamName !== filters.exam) {
                const resultForExam = allResults.find(r => r.examId === examObject.id);
                const yearOfExam = resultForExam ? resultForExam.schoolYear : settings.currentSchoolYear;

                const newFilters = {
                    ...filters,
                    exam: decodedExamName,
                    grade: examObject.grade,
                    schoolYear: yearOfExam
                };

                setFilters(newFilters);
                setAppliedFilters(newFilters);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, allExams, allResults, settings.currentSchoolYear]);

    const availableSchoolYears = useMemo(() => {
        const fromResults = allResults.map(r => r.schoolYear).filter(Boolean);
        const fromSettings = settings.schoolYears || [];
        const current = settings.currentSchoolYear ? [settings.currentSchoolYear] : [];
        return [...new Set([...fromSettings, ...current, ...fromResults])].sort((a, b) => b.localeCompare(a));
    }, [allResults, settings.schoolYears, settings.currentSchoolYear]);

    const resultsForFilterOptions = useMemo(() => {
        if (filters.schoolYear === 'all') {
            return allResults;
        }
        return allResults.filter(r => r.schoolYear === filters.schoolYear);
    }, [allResults, filters.schoolYear]);

    const studentsForFilterOptions = useMemo(() => {
        if (filters.schoolYear === 'all') {
            return allStudents;
        }
        return allStudents.filter(s => s.schoolYear === filters.schoolYear);
    }, [allStudents, filters.schoolYear]);


    const availableRegions = useMemo(() => {
        if (user?.role === 'Referente') {
            return userRegion ? [userRegion] : [];
        }
        const schoolNamesInResults = new Set(resultsForFilterOptions.map(r => r.school));
        const regionsForSchools = new Set(allSchools.filter(s => schoolNamesInResults.has(s.name)).map(s => s.region));
        return Array.from(regionsForSchools).sort();
    }, [resultsForFilterOptions, allSchools, user?.role, userRegion]);

    const availableSchools = useMemo(() => {
        if (user?.role === 'Referente') {
            return allSchools.filter(s => s.region === userRegion).map(s => s.name).sort();
        }
        const schoolNames = new Set(resultsForFilterOptions.map(r => r.school));
        return Array.from(schoolNames).sort();
    }, [resultsForFilterOptions, user?.role, allSchools, userRegion]);

    const availableGrades = useMemo(() => {
        const gradeNames = new Set(studentsForFilterOptions.map(s => s.grade).filter(Boolean));
        return Array.from(gradeNames).sort();
    }, [studentsForFilterOptions]);

    const availableCourses = useMemo(() => {
        const courseNames = new Set(studentsForFilterOptions.map(s => s.course).filter(Boolean));
        return Array.from(courseNames).sort();
    }, [studentsForFilterOptions]);

    const availableExams = useMemo(() => {
        let examsToShow = allExams;

        if (user?.role === 'Docente' && user.grade) {
            examsToShow = allExams.filter(e => e.grade === user.grade && e.status === 'Cerrado');
        }

        if (filters.grade !== 'all') {
            examsToShow = examsToShow.filter(e => e.grade === filters.grade);
        }

        // Filter based on results for the selected school year to avoid showing exams from other years
        const examIdsInYear = new Set(resultsForFilterOptions.map(r => r.examId));
        examsToShow = examsToShow.filter(e => examIdsInYear.has(e.id));

        return examsToShow.map(e => ({ id: e.id, name: e.name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [allExams, user, filters.grade, resultsForFilterOptions]);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    }

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
    }

    const formatCourseLabel = (course?: string) => {
        if (!course || !course.trim()) return "Sin Curso";
        const clean = course.trim();
        if (clean.toLowerCase().startsWith("curso")) return clean;
        return `Curso ${clean}`;
    };

    const { dataAprobados, examAnalysisData, questionAnalysisData } = useMemo(() => {
        const existingExamIds = new Set(allExams.map(e => e.id));
        let filteredResults = allResults.filter(r => existingExamIds.has(r.examId));

        // 1. Role-based pre-filtering
        if (user?.role === 'Director') {
            filteredResults = filteredResults.filter(r => r.school === user.school);
        } else if (user?.role === 'Referente') {
            const schoolsInRegion = allSchools.filter(s => s.region === userRegion).map(s => s.name);
            const schoolsInRegionSet = new Set(schoolsInRegion);
            filteredResults = filteredResults.filter(r => schoolsInRegionSet.has(r.school));
        } else if (user?.role === 'Docente') {
            filteredResults = filteredResults.filter(r =>
                r.school === user.school &&
                r.grade === user.grade &&
                r.course === user.course &&
                r.schoolYear === settings.currentSchoolYear
            );
        }

        // Apply exam filter for all roles if selected
        if (appliedFilters.exam !== 'all') {
            filteredResults = filteredResults.filter(r => r.examName === appliedFilters.exam);
        }

        // 2. Apply user-selected filters (not applied for Docente)
        if (user?.role !== 'Docente') {
            if (appliedFilters.schoolYear !== "all") {
                filteredResults = filteredResults.filter(r => r.schoolYear === appliedFilters.schoolYear);
            }
            if (appliedFilters.region !== "all") {
                const schoolsInRegion = allSchools.filter(s => s.region === appliedFilters.region).map(s => s.name);
                const schoolsInRegionSet = new Set(schoolsInRegion);
                filteredResults = filteredResults.filter(r => schoolsInRegionSet.has(r.school));
            }
            if (appliedFilters.school !== 'all') {
                filteredResults = filteredResults.filter(r => r.school === appliedFilters.school);
            }
            if (appliedFilters.grade !== 'all') {
                filteredResults = filteredResults.filter(r => r.grade === appliedFilters.grade);
            }
            if (appliedFilters.course !== 'all') {
                filteredResults = filteredResults.filter(r => r.course === appliedFilters.course);
            }
        }


        // --- Data: Aprobados vs. Desaprobados con desglose por curso y por escuela ---
        const aprobadosPorGrado: Record<string, {
            Aprobados: number;
            Desaprobados: number;
            byCourse: Record<string, { Aprobados: number; Desaprobados: number; total: number }>;
            bySchool: Record<string, { Aprobados: number; Desaprobados: number; total: number }>;
        }> = {};

        filteredResults.forEach(r => {
            const grade = r.grade || 'Sin Grado';
            if (!aprobadosPorGrado[grade]) {
                aprobadosPorGrado[grade] = { Aprobados: 0, Desaprobados: 0, byCourse: {}, bySchool: {} };
            }
            const courseKey = formatCourseLabel(r.course);
            if (!aprobadosPorGrado[grade].byCourse[courseKey]) {
                aprobadosPorGrado[grade].byCourse[courseKey] = { Aprobados: 0, Desaprobados: 0, total: 0 };
            }

            const schoolKey = r.school || 'Sin Escuela';
            if (!aprobadosPorGrado[grade].bySchool[schoolKey]) {
                aprobadosPorGrado[grade].bySchool[schoolKey] = { Aprobados: 0, Desaprobados: 0, total: 0 };
            }

            aprobadosPorGrado[grade].byCourse[courseKey].total++;
            aprobadosPorGrado[grade].bySchool[schoolKey].total++;

            if (r.status === 'Aprobado') {
                aprobadosPorGrado[grade].Aprobados++;
                aprobadosPorGrado[grade].byCourse[courseKey].Aprobados++;
                aprobadosPorGrado[grade].bySchool[schoolKey].Aprobados++;
            } else {
                aprobadosPorGrado[grade].Desaprobados++;
                aprobadosPorGrado[grade].byCourse[courseKey].Desaprobados++;
                aprobadosPorGrado[grade].bySchool[schoolKey].Desaprobados++;
            }
        });

        const dataAprobados = Object.entries(aprobadosPorGrado)
            .map(([grade, counts]) => ({
                name: grade,
                Aprobados: counts.Aprobados,
                Desaprobados: counts.Desaprobados,
                byCourse: counts.byCourse,
                bySchool: counts.bySchool
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // --- Data: Análisis por Examen con desglose por curso y por escuela ---
        const examAnalysis: Record<string, {
            byGrade: Record<string, {
                totalScore: number;
                count: number;
                aprobados: number;
                totalMaxScore: number;
                byCourse: Record<string, {
                    totalScore: number;
                    count: number;
                    aprobados: number;
                    totalMaxScore: number;
                }>;
                bySchool: Record<string, {
                    totalScore: number;
                    count: number;
                    aprobados: number;
                    totalMaxScore: number;
                }>;
            }>;
        }> = {};

        filteredResults.forEach(r => {
            if (!examAnalysis[r.examName]) {
                examAnalysis[r.examName] = { byGrade: {} };
            }

            const grade = r.grade || 'Sin Grado';
            if (!examAnalysis[r.examName].byGrade[grade]) {
                examAnalysis[r.examName].byGrade[grade] = {
                    totalScore: 0,
                    count: 0,
                    aprobados: 0,
                    totalMaxScore: 0,
                    byCourse: {},
                    bySchool: {}
                };
            }

            const gradeData = examAnalysis[r.examName].byGrade[grade];
            gradeData.totalScore += r.totalScore;
            gradeData.totalMaxScore += r.maxScore;
            gradeData.count += 1;
            if (r.status === 'Aprobado') {
                gradeData.aprobados++;
            }

            const courseKey = formatCourseLabel(r.course);
            if (!gradeData.byCourse[courseKey]) {
                gradeData.byCourse[courseKey] = {
                    totalScore: 0,
                    count: 0,
                    aprobados: 0,
                    totalMaxScore: 0,
                };
            }
            const courseData = gradeData.byCourse[courseKey];
            courseData.totalScore += r.totalScore;
            courseData.totalMaxScore += r.maxScore;
            courseData.count += 1;
            if (r.status === 'Aprobado') {
                courseData.aprobados++;
            }

            const schoolKey = r.school || 'Sin Escuela';
            if (!gradeData.bySchool[schoolKey]) {
                gradeData.bySchool[schoolKey] = {
                    totalScore: 0,
                    count: 0,
                    aprobados: 0,
                    totalMaxScore: 0,
                };
            }
            const schoolData = gradeData.bySchool[schoolKey];
            schoolData.totalScore += r.totalScore;
            schoolData.totalMaxScore += r.maxScore;
            schoolData.count += 1;
            if (r.status === 'Aprobado') {
                schoolData.aprobados++;
            }
        });

        const examAnalysisData = Object.entries(examAnalysis).map(([examName, data]) => {
            const examRow: { name: string, [key: string]: any } = { name: examName };
            const originalExam = allExams.find(e => e.name === examName);
            let examGrade = 'Sin Grado'; // Default grade
            const byGradeCourses: Record<string, Record<string, any>> = {};
            const byGradeSchools: Record<string, Record<string, any>> = {};

            Object.entries(data.byGrade).forEach(([grade, gradeData]) => {
                const total = gradeData.count;
                examGrade = grade; // Capture the grade for sorting
                if (total > 0) {
                    examRow[`${grade}_Aprobados`] = (gradeData.aprobados / total) * 100;
                    examRow[`${grade}_Desaprobados`] = ((total - gradeData.aprobados) / total) * 100;
                    examRow[`${grade}_Rendimiento`] = (gradeData.totalScore / gradeData.totalMaxScore) * 100;
                    examRow[`${grade}_count`] = total;
                    examRow[`${grade}_aprobadosCount`] = gradeData.aprobados;
                    examRow[`${grade}_desaprobadosCount`] = total - gradeData.aprobados;
                } else {
                    examRow[`${grade}_Aprobados`] = 0;
                    examRow[`${grade}_Desaprobados`] = 0;
                    examRow[`${grade}_Rendimiento`] = 0;
                    examRow[`${grade}_count`] = 0;
                    examRow[`${grade}_aprobadosCount`] = 0;
                    examRow[`${grade}_desaprobadosCount`] = 0;
                }
                examRow[`${grade}_totalScore`] = gradeData.totalScore;
                examRow[`${grade}_totalMaxScore`] = gradeData.totalMaxScore;

                byGradeCourses[grade] = {};
                Object.entries(gradeData.byCourse).forEach(([courseName, cData]) => {
                    const cTotal = cData.count;
                    const cRendimiento = cData.totalMaxScore > 0 ? (cData.totalScore / cData.totalMaxScore) * 100 : 0;
                    const cAprobPct = cTotal > 0 ? (cData.aprobados / cTotal) * 100 : 0;
                    const cDesapPct = cTotal > 0 ? ((cTotal - cData.aprobados) / cTotal) * 100 : 0;
                    byGradeCourses[grade][courseName] = {
                        count: cTotal,
                        rendimiento: cRendimiento,
                        aprobados: cData.aprobados,
                        desaprobados: cTotal - cData.aprobados,
                        aprobadosPct: cAprobPct,
                        desaprobadosPct: cDesapPct,
                        totalScore: cData.totalScore,
                        totalMaxScore: cData.totalMaxScore,
                    };
                });

                byGradeSchools[grade] = {};
                Object.entries(gradeData.bySchool).forEach(([schoolName, sData]) => {
                    const sTotal = sData.count;
                    const sRendimiento = sData.totalMaxScore > 0 ? (sData.totalScore / sData.totalMaxScore) * 100 : 0;
                    const sAprobPct = sTotal > 0 ? (sData.aprobados / sTotal) * 100 : 0;
                    const sDesapPct = sTotal > 0 ? ((sTotal - sData.aprobados) / sTotal) * 100 : 0;
                    byGradeSchools[grade][schoolName] = {
                        count: sTotal,
                        rendimiento: sRendimiento,
                        aprobados: sData.aprobados,
                        desaprobados: sTotal - sData.aprobados,
                        aprobadosPct: sAprobPct,
                        desaprobadosPct: sDesapPct,
                        totalScore: sData.totalScore,
                        totalMaxScore: sData.totalMaxScore,
                    };
                });
            });

            examRow.byGradeCourses = byGradeCourses;
            examRow.byGradeSchools = byGradeSchools;
            examRow.gradeForSort = examGrade;
            examRow.createdForSort = originalExam ? originalExam.created : '0'; // Add created date for sorting
            return examRow;
        }).sort((a, b) => {
            const gradeOrder = getGradeOrder(a.gradeForSort) - getGradeOrder(b.gradeForSort);
            if (gradeOrder !== 0) {
                return gradeOrder;
            }
            // Secondary sort: by creation date, descending (newest first)
            return b.createdForSort.localeCompare(a.createdForSort);
        });


        // --- Data: Análisis por Pregunta con desglose por curso y por escuela ---
        const questionAnalysis: Record<string, {
            totalScore: number;
            totalMaxScore: number;
            byCourse: Record<string, { totalScore: number; totalMaxScore: number }>;
            bySchool: Record<string, { totalScore: number; totalMaxScore: number }>;
        }> = {};

        const selectedExam = allExams.find(e => e.name === appliedFilters.exam);

        if (selectedExam) {
            const examResultsForQuestionAnalysis = filteredResults.filter(r => r.examId === selectedExam.id);
            if (examResultsForQuestionAnalysis.length > 0) {
                selectedExam.questions.forEach((q, index) => {
                    const questionKey = `Preg. ${index + 1}`;
                    questionAnalysis[questionKey] = { totalScore: 0, totalMaxScore: 0, byCourse: {}, bySchool: {} };
                });

                examResultsForQuestionAnalysis.forEach(result => {
                    const courseKey = formatCourseLabel(result.course);
                    const schoolKey = result.school || 'Sin Escuela';
                    Object.entries(result.scores).forEach(([qIndex, score]) => {
                        const questionKey = `Preg. ${Number(qIndex) + 1}`;
                        const questionMax = selectedExam.questions[Number(qIndex)]?.puntaje ?? 0;
                        if (questionAnalysis[questionKey]) {
                            questionAnalysis[questionKey].totalScore += score;
                            questionAnalysis[questionKey].totalMaxScore += questionMax;

                            if (!questionAnalysis[questionKey].byCourse[courseKey]) {
                                questionAnalysis[questionKey].byCourse[courseKey] = { totalScore: 0, totalMaxScore: 0 };
                            }
                            questionAnalysis[questionKey].byCourse[courseKey].totalScore += score;
                            questionAnalysis[questionKey].byCourse[courseKey].totalMaxScore += questionMax;

                            if (!questionAnalysis[questionKey].bySchool[schoolKey]) {
                                questionAnalysis[questionKey].bySchool[schoolKey] = { totalScore: 0, totalMaxScore: 0 };
                            }
                            questionAnalysis[questionKey].bySchool[schoolKey].totalScore += score;
                            questionAnalysis[questionKey].bySchool[schoolKey].totalMaxScore += questionMax;
                        }
                    });
                });
            }
        }

        const questionAnalysisData = Object.entries(questionAnalysis).map(([name, data]) => {
            const courseBreakdown: Record<string, { score: number; maxScore: number; percentage: number }> = {};
            Object.entries(data.byCourse).forEach(([course, cData]) => {
                courseBreakdown[course] = {
                    score: cData.totalScore,
                    maxScore: cData.totalMaxScore,
                    percentage: cData.totalMaxScore > 0 ? (cData.totalScore / cData.totalMaxScore) * 100 : 0
                };
            });

            const schoolBreakdown: Record<string, { score: number; maxScore: number; percentage: number }> = {};
            Object.entries(data.bySchool).forEach(([school, sData]) => {
                schoolBreakdown[school] = {
                    score: sData.totalScore,
                    maxScore: sData.totalMaxScore,
                    percentage: sData.totalMaxScore > 0 ? (sData.totalScore / sData.totalMaxScore) * 100 : 0
                };
            });

            return {
                name,
                Rendimiento: data.totalMaxScore > 0 ? (data.totalScore / data.totalMaxScore) * 100 : 0,
                byCourse: courseBreakdown,
                bySchool: schoolBreakdown
            };
        });

        return { dataAprobados, examAnalysisData, questionAnalysisData };
    }, [appliedFilters, user, allResults, allExams, allSchools, settings.currentSchoolYear]);

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
                const totalScoreKey = `${grade}_totalScore`;
                const totalMaxScoreKey = `${grade}_totalMaxScore`;
                const totalScore = row[totalScoreKey] || 0;
                const totalMaxScore = row[totalMaxScoreKey] || 0;
                if (totalScore > 0 || totalMaxScore > 0) {
                    csvContent += [row.name, grade, totalScore, totalMaxScore].join(';') + '\n';
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

    // Tooltip para Análisis por Pregunta (por escuela si es Referente, o por curso para el resto)
    const QuestionTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const generalRendimiento = payload[0].value;
            const isReferente = user?.role === 'Referente';

            const breakdownData = isReferente ? (data.bySchool || {}) : (data.byCourse || {});
            const items = Object.entries(breakdownData).sort(([a], [b]) => a.localeCompare(b));

            return (
                <div className="p-3 bg-background/95 backdrop-blur-md border rounded-lg shadow-xl text-xs sm:text-sm min-w-[240px] max-w-[340px] space-y-2 z-50">
                    <div className="border-b pb-1.5 flex items-center justify-between gap-4">
                        <span className="font-bold text-sm text-foreground">{label}</span>
                        <span className="text-primary font-bold text-sm">
                            {typeof generalRendimiento === 'number' ? `${generalRendimiento.toFixed(1)}%` : ''}
                        </span>
                    </div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {isReferente ? "Rendimiento por escuela:" : "Rendimiento por curso:"}
                    </div>
                    {items.length > 0 ? (
                        <div className="space-y-1.5 pt-0.5 max-h-[220px] overflow-y-auto pr-1">
                            {items.map(([name, itemData]: [string, any]) => (
                                <div key={name} className="flex justify-between items-center text-xs bg-muted/40 px-2 py-1 rounded">
                                    <span className="font-medium text-foreground truncate max-w-[200px]" title={name}>{name}</span>
                                    <span className="font-bold text-primary shrink-0 ml-2">{itemData.percentage.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground italic">
                            {isReferente ? "Sin escuelas registradas" : "Sin cursos registrados"}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Tooltip para Aprobados vs. Desaprobados (por escuela si es Referente, o por curso para el resto)
    const AprobadosDesaprobadosTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const total = (data.Aprobados || 0) + (data.Desaprobados || 0);
            const aprobadosPercent = total > 0 ? ((data.Aprobados / total) * 100).toFixed(1) : "0.0";
            const desaprobadosPercent = total > 0 ? ((data.Desaprobados / total) * 100).toFixed(1) : "0.0";
            const isReferente = user?.role === 'Referente';

            const breakdownData = isReferente ? (data.bySchool || {}) : (data.byCourse || {});
            const items = Object.entries(breakdownData).sort(([a], [b]) => a.localeCompare(b));

            return (
                <div className="p-3 bg-background/95 backdrop-blur-md border rounded-lg shadow-xl text-xs sm:text-sm min-w-[260px] max-w-[360px] space-y-2.5 z-50">
                    <div className="border-b pb-1.5 flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground font-medium">{total} alumno{total !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1.5 bg-muted/40 rounded p-2">
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Aprobados:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {data.Aprobados} ({aprobadosPercent}%)
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Desaprobados:</span>
                            <span className="font-bold text-destructive">
                                {data.Desaprobados} ({desaprobadosPercent}%)
                            </span>
                        </div>
                    </div>

                    {items.length > 0 && (
                        <div className="space-y-1.5 pt-0.5">
                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {isReferente ? "Detalle por Escuela:" : "Detalle por Curso:"}
                            </div>
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                                {items.map(([name, itemData]: [string, any]) => {
                                    const itemTotal = itemData.total || 0;
                                    const aprobPct = itemTotal > 0 ? ((itemData.Aprobados / itemTotal) * 100).toFixed(1) : "0.0";
                                    const desapPct = itemTotal > 0 ? ((itemData.Desaprobados / itemTotal) * 100).toFixed(1) : "0.0";
                                    return (
                                        <div key={name} className="text-xs border rounded p-1.5 bg-background/60 space-y-1">
                                            <div className="flex justify-between font-semibold">
                                                <span className="truncate max-w-[220px]" title={name}>{name}</span>
                                                <span className="text-muted-foreground text-[11px] shrink-0 ml-1">{itemTotal} al.</span>
                                            </div>
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                    Aprob: {itemData.Aprobados} ({aprobPct}%)
                                                </span>
                                                <span className="text-destructive font-medium">
                                                    Desap: {itemData.Desaprobados} ({desapPct}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Tooltip para Análisis por Examen (por escuela si es Referente, o por curso para el resto)
    const ExamTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isReferente = user?.role === 'Referente';
            const breakdownDict = isReferente ? (data.byGradeSchools || {}) : (data.byGradeCourses || {});
            const gradesPresent = Object.keys(breakdownDict);

            return (
                <div className="p-3 bg-background/95 backdrop-blur-md border rounded-lg shadow-xl text-xs sm:text-sm min-w-[280px] max-w-[380px] space-y-2.5 z-50">
                    <div className="border-b pb-1.5">
                        <span className="text-sm font-bold text-foreground block">{label}</span>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {gradesPresent.map((grade) => {
                            const rendimiento = data[`${grade}_Rendimiento`] ?? 0;
                            const aprobadosCount = data[`${grade}_aprobadosCount`] ?? 0;
                            const desaprobadosCount = data[`${grade}_desaprobadosCount`] ?? 0;
                            const count = data[`${grade}_count`] ?? 0;
                            const aprobadosPct = data[`${grade}_Aprobados`] ?? 0;
                            const desaprobadosPct = data[`${grade}_Desaprobados`] ?? 0;
                            const items = Object.entries(breakdownDict[grade] || {}).sort(([a], [b]) => a.localeCompare(b));

                            return (
                                <div key={grade} className="space-y-1.5 border-b last:border-b-0 pb-2 last:pb-0">
                                    <div className="flex justify-between items-center font-bold text-xs">
                                        <span>{grade} ({count} al.)</span>
                                        <span className="text-primary font-bold">{rendimiento.toFixed(1)}% rend.</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] bg-muted/40 rounded px-2 py-1">
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                            Aprob: {aprobadosCount} ({aprobadosPct.toFixed(1)}%)
                                        </span>
                                        <span className="text-destructive font-medium">
                                            Desap: {desaprobadosCount} ({desaprobadosPct.toFixed(1)}%)
                                        </span>
                                    </div>

                                    {items.length > 0 && (
                                        <div className="space-y-1 pt-0.5">
                                            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                {isReferente ? "Detalle por escuela:" : "Detalle por curso:"}
                                            </div>
                                            <div className="space-y-1">
                                                {items.map(([name, itemData]: [string, any]) => (
                                                    <div key={name} className="text-xs border rounded p-1.5 bg-background/60">
                                                        <div className="flex justify-between items-center font-semibold text-xs">
                                                            <span className="truncate max-w-[220px]" title={name}>{name} ({itemData.count} al.)</span>
                                                            <span className="text-primary font-bold shrink-0 ml-1">{itemData.rendimiento.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex justify-between text-[11px] text-muted-foreground mt-0.5">
                                                            <span className="text-emerald-600 dark:text-emerald-400">
                                                                Aprob: {itemData.aprobados} ({itemData.aprobadosPct.toFixed(1)}%)
                                                            </span>
                                                            <span className="text-destructive">
                                                                Desap: {itemData.desaprobados} ({itemData.desaprobadosPct.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
                if (key.includes('_Aprobados')) {
                    keys.add(key.split('_')[0]);
                }
            });
        });
        return Array.from(keys);
    }, [examAnalysisData]);


    if (authLoading || examsLoading || resultsLoading || schoolsLoading || studentsLoading || !user) {
        return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
    }

    const showGlobalFilters = ['Evaluador', 'Administrador', 'Referente'].includes(user.role);
    const showGradeCourseFilters = user.role !== 'Docente';
    const showSchoolYearFilter = user.role !== 'Docente';


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
                    {showSchoolYearFilter && (
                        <div className="grid gap-2">
                            <Label htmlFor="filtro-ciclo-lectivo">Ciclo Lectivo</Label>
                            <Select onValueChange={(v) => handleFilterChange('schoolYear', v)} value={filters.schoolYear}>
                                <SelectTrigger id="filtro-ciclo-lectivo"><SelectValue placeholder="Ciclo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {availableSchoolYears.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {showGlobalFilters && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-region">Región</Label>
                                <Select
                                    onValueChange={(v) => handleFilterChange('region', v)}
                                    value={user?.role === 'Referente' ? (userRegion || filters.region) : filters.region}
                                    disabled={user?.role === 'Referente'}
                                >
                                    <SelectTrigger id="filtro-region"><SelectValue placeholder="Región" /></SelectTrigger>
                                    <SelectContent>
                                        {user?.role !== 'Referente' && <SelectItem value="all">Todas</SelectItem>}
                                        {availableRegions.map((d, i) => <SelectItem key={`${d}-${i}`} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-escuela">Escuela</Label>
                                <Select onValueChange={(v) => handleFilterChange('school', v)} value={filters.school}>
                                    <SelectTrigger id="filtro-escuela"><SelectValue placeholder="Escuela" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {availableSchools.map((s, i) => <SelectItem key={`${s}-${i}`} value={s}>{s}</SelectItem>)}
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
                                        {availableGrades.map((g, i) => <SelectItem key={`${g}-${i}`} value={g as string}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="filtro-curso">Curso</Label>
                                <Select onValueChange={(v) => handleFilterChange('course', v)} value={filters.course}>
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
                        <Label htmlFor="filtro-examen">Examen</Label>
                        <Select onValueChange={(v) => handleFilterChange('exam', v)} value={filters.exam}>
                            <SelectTrigger id="filtro-examen"><SelectValue placeholder="Examen" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {availableExams.map((e, i) => <SelectItem key={`${e.id}-${i}`} value={e.name}>{e.name}</SelectItem>)}
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
                                    <Tooltip content={<QuestionTooltip />} />
                                    <Bar dataKey="Rendimiento" fill="hsl(var(--chart-2))" name="Rendimiento">
                                        <LabelList dataKey="Rendimiento" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} />
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
                                <Tooltip content={<AprobadosDesaprobadosTooltip />} />
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
                                    {dataAprobados.map((item, index) => {
                                        const total = item.Aprobados + item.Desaprobados
                                        const aprobadosPercent = total > 0 ? ((item.Aprobados / total) * 100).toFixed(1) : "0.0";
                                        const desaprobadosPercent = total > 0 ? ((item.Desaprobados / total) * 100).toFixed(1) : "0.0";

                                        if (item.Aprobados === 0 && item.Desaprobados === 0) return null;

                                        return (
                                            <TableRow key={`${item.name}-${index}`}>
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
                        <CardDescription>Rendimiento y porcentaje de aprobados por grado para cada examen.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" className="no-print" onClick={() => handlePrint('analisis-examen-card')}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={examAnalysisData} margin={{ top: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip content={<ExamTooltip />} />
                            <Legend />
                            {gradeDataKeys.map((gradeName) => [
                                <Bar
                                    key={`${gradeName}_Rendimiento`}
                                    name={`${gradeName} - Rendimiento`}
                                    dataKey={`${gradeName}_Rendimiento`}
                                    fill={getGradeColor(gradeName, 'main')}
                                    barSize={20}
                                >
                                    <LabelList
                                        dataKey={`${gradeName}_Rendimiento`}
                                        position="top"
                                        formatter={(value: number) => {
                                            if (value > 0) {
                                                return `${value.toFixed(0)}%`;
                                            }
                                            return '';
                                        }}
                                    />
                                </Bar>,
                                <Bar
                                    key={`${gradeName}_Aprobados`}
                                    name={`${gradeName} - Aprobados`}
                                    dataKey={`${gradeName}_Aprobados`}
                                    stackId={gradeName}
                                    fill={getGradeColor(gradeName, 'approved')}
                                    barSize={40}
                                >
                                    <LabelList
                                        dataKey={`${gradeName}_Aprobados`}
                                        position="center"
                                        className="fill-white font-bold"
                                        formatter={(value: number) => {
                                            if (value > 0) {
                                                return `${value.toFixed(0)}%`;
                                            }
                                            return '';
                                        }}
                                    />
                                </Bar>,
                                <Bar
                                    key={`${gradeName}_Desaprobados`}
                                    name={`${gradeName} - Desaprobados`}
                                    dataKey={`${gradeName}_Desaprobados`}
                                    stackId={gradeName}
                                    fill={getGradeColor(gradeName, 'disapproved')}
                                    barSize={40}
                                >
                                    <LabelList
                                        dataKey={`${gradeName}_Desaprobados`}
                                        position="center"
                                        className="fill-white font-bold"
                                        formatter={(value: number) => {
                                            if (value > 0) {
                                                return `${value.toFixed(0)}%`;
                                            }
                                            return '';
                                        }}
                                    />
                                </Bar>
                            ])}
                        </BarChart>
                    </ResponsiveContainer>
                    <Separator />
                    <CardDescription>Datos detallados por examen y grado.</CardDescription>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">Examen</TableHead>
                                    <TableHead className="font-bold text-center">Grado</TableHead>
                                    <TableHead className="text-center">% Aprobados</TableHead>
                                    <TableHead className="text-center">% Desaprobados</TableHead>
                                    <TableHead className="text-center">Puntaje Total</TableHead>
                                    <TableHead className="text-center">Puntaje Máx Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examAnalysisData.map((examen) => {
                                    const grades = gradeDataKeys.filter(g => examen[`${g}_totalScore`] !== undefined);
                                    let firstVisibleRowRendered = false;

                                    return grades.map((grade) => {
                                        const aprobados = examen[`${grade}_Aprobados`] || 0;
                                        const desaprobados = examen[`${grade}_Desaprobados`] || 0;
                                        const totalScore = examen[`${grade}_totalScore`];
                                        const totalMaxScore = examen[`${grade}_totalMaxScore`];

                                        const isFirstVisibleRow = !firstVisibleRowRendered;
                                        if (isFirstVisibleRow) {
                                            firstVisibleRowRendered = true;
                                        }

                                        return (
                                            <TableRow key={`${examen.name}-${grade}`}>
                                                {isFirstVisibleRow && (
                                                    <TableCell
                                                        rowSpan={grades.length}
                                                        className="font-medium align-middle"
                                                    >
                                                        {examen.name}
                                                    </TableCell>
                                                )}
                                                <TableCell className="text-center">{grade}</TableCell>
                                                <TableCell className="text-center">{aprobados.toFixed(1)}%</TableCell>
                                                <TableCell className="text-center">{desaprobados.toFixed(1)}%</TableCell>
                                                <TableCell className="text-center">{totalScore}</TableCell>
                                                <TableCell className="text-center">{totalMaxScore}</TableCell>
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
