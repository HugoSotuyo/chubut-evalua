"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  BookUser,
  FileCheck2,
  Users,
  Eye,
  BarChart2,
  School as SchoolIcon,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { RoleIcon } from "@/components/role-icon";
import { useUsers } from "@/context/users-context";
import { useStudents } from "@/context/students-context";
import { useExams } from "@/context/exams-context";
import { useResults } from "@/context/results-context";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { useSchools } from "@/context/schools-context";
import { ViewExamDialog } from "./examenes/view-exam-dialog";
import type { Exam } from "@/lib/types";

export default function Dashboard() {
    const { user } = useAuth();
    const { users: allUsers } = useUsers();
    const { students: allStudents } = useStudents();
    const { exams: allExams } = useExams();
    const { results: allResults } = useResults();
    const { settings } = useSettings();
    const { schools } = useSchools();

    const [viewingExam, setViewingExam] = useState<Exam | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const isOverviewRole = user?.role === 'Evaluador' || user?.role === 'Administrador' || user?.role === 'Referente';

    const handleOpenExamStats = (exam: Exam) => {
        setViewingExam(exam);
        setIsViewDialogOpen(true);
    };

    const filteredData = useMemo(() => {
        if (!user || !settings.currentSchoolYear) return { users: [], students: [], exams: [], results: [] };

        const getExamYear = (e: any) => e.schoolYear || e.created?.slice(0, 4) || "2024";

        // Filtrar datos para el ciclo lectivo actual
        const usersInYear = allUsers.filter(u => u.schoolYear === settings.currentSchoolYear);
        const studentsInYear = allStudents.filter(s => s.schoolYear === settings.currentSchoolYear);
        const resultsInYear = allResults.filter(r => r.schoolYear === settings.currentSchoolYear);
        
        const relevantExamIds = new Set(resultsInYear.map(r => r.examId));
        const examsInYear = allExams.filter(e => relevantExamIds.has(e.id) || getExamYear(e) === settings.currentSchoolYear);

        if (user.role === 'Director') {
            const schoolStudents = studentsInYear.filter(s => s.school === user.school);
            const schoolResults = resultsInYear.filter(r => r.school === user.school);
            const schoolRelevantExamIds = new Set(schoolResults.map(r => r.examId));
            const schoolExams = allExams.filter(e => schoolRelevantExamIds.has(e.id) || getExamYear(e) === settings.currentSchoolYear);
            const schoolTeachers = usersInYear.filter(u => u.school === user.school && u.role === 'Docente');
            return { users: schoolTeachers, students: schoolStudents, exams: schoolExams, results: schoolResults };
        }

        if (user.role === 'Referente') {
            const userRegion = user.region || (user.school.startsWith("Región") ? user.school : schools.find(s => s.name === user.school)?.region);
            const regionSchoolNames = new Set(schools.filter(s => s.region === userRegion).map(s => s.name));
            const regionStudents = studentsInYear.filter(s => regionSchoolNames.has(s.school));
            const regionResults = resultsInYear.filter(r => regionSchoolNames.has(r.school));
            const regionRelevantExamIds = new Set(regionResults.map(r => r.examId));
            const regionExams = allExams.filter(e => regionRelevantExamIds.has(e.id) || getExamYear(e) === settings.currentSchoolYear);
            const regionUsers = usersInYear.filter(u => regionSchoolNames.has(u.school) || (u.role === 'Referente' && (u.region === userRegion || u.school === userRegion)));
            return { users: regionUsers, students: regionStudents, exams: regionExams, results: regionResults };
        }

        if (user.role === 'Docente') {
            const courseStudents = studentsInYear.filter(s => 
                s.school === user.school && 
                s.grade === user.grade && 
                s.course === user.course
            );
            const courseResults = resultsInYear.filter(r => 
                r.school === user.school && 
                r.grade === user.grade && 
                r.course === user.course
            );
            const courseExams = allExams.filter(e => e.grade === user.grade && getExamYear(e) === settings.currentSchoolYear);
            return { users: allUsers, students: courseStudents, exams: courseExams, results: courseResults };
        }

        // Para Evaluador y Administrador, retornar todos los datos del ciclo actual
        return { users: usersInYear, students: studentsInYear, exams: examsInYear, results: resultsInYear };
    }, [user, allUsers, allStudents, allExams, allResults, schools, settings.currentSchoolYear]);

    const stats = useMemo(() => {
        const activeTeachers = filteredData.users.filter(u => u.role === 'Docente' && u.status === 'Activo').length;
        const closedExams = filteredData.exams.filter(e => e.status === 'Cerrado').length;
        const pendingExams = filteredData.exams.filter(e => e.status === 'Abierto').length;

        return {
            totalStudents: filteredData.students.length,
            activeTeachers,
            closedExams,
            pendingExams,
        };
    }, [filteredData]);
    
    // Resultados de alumnos recientes (para Director y Docente)
    const recentResults = useMemo(() => {
        return [...filteredData.results].reverse().slice(0, 5);
    }, [filteredData.results]);

    // Estadisticas de examenes e impacto por escuela (para Evaluador, Administrador y Referente)
    const examStatsList = useMemo(() => {
        if (!isOverviewRole) return [];

        return filteredData.exams.map((exam) => {
            const examResults = filteredData.results.filter((r) => r.examId === exam.id);
            const totalStudents = examResults.length;
            const totalScoreSum = examResults.reduce((sum, r) => sum + r.score, 0);
            const approvedCount = examResults.filter((r) => r.status === "Aprobado").length;
            const avgScore = totalStudents > 0 ? totalScoreSum / totalStudents : 0;
            const approvalRate = totalStudents > 0 ? (approvedCount / totalStudents) * 100 : 0;

            // Agrupar impacto por escuela
            const schoolsMap = new Map<string, { count: number; scoreSum: number; approved: number }>();
            examResults.forEach((r) => {
                const current = schoolsMap.get(r.school) || { count: 0, scoreSum: 0, approved: 0 };
                current.count += 1;
                current.scoreSum += r.score;
                if (r.status === "Aprobado") current.approved += 1;
                schoolsMap.set(r.school, current);
            });

            const evaluatedSchools = Array.from(schoolsMap.entries())
                .map(([schoolName, data]) => ({
                    schoolName,
                    studentsCount: data.count,
                    avgScore: data.scoreSum / data.count,
                    approvalRate: (data.approved / data.count) * 100,
                }))
                .sort((a, b) => b.avgScore - a.avgScore);

            return {
                exam,
                totalStudents,
                avgScore,
                approvalRate,
                schoolsCount: evaluatedSchools.length,
                schools: evaluatedSchools,
            };
        }).sort((a, b) => b.totalStudents - a.totalStudents || b.exam.created.localeCompare(a.exam.created));
    }, [isOverviewRole, filteredData.exams, filteredData.results]);

    const performanceByGrade = useMemo(() => {
        const gradeData: Record<string, { totalScore: number, count: number }> = {};
        
        filteredData.results.forEach(result => {
            const grade = result.grade || 'Sin Grado';
            if (!gradeData[grade]) {
                gradeData[grade] = { totalScore: 0, count: 0 };
            }
            gradeData[grade].totalScore += result.score;
            gradeData[grade].count += 1;
        });

        return Object.entries(gradeData).map(([grade, data]) => ({
            name: grade,
            Rendimiento: data.count > 0 ? data.totalScore / data.count : 0,
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredData.results]);
    
    const chartConfig = {
        Rendimiento: {
          label: "Rendimiento",
          color: "hsl(var(--chart-1))",
        },
    }

    if (!user) return <div>Cargando...</div>

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Registrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Total de alumnos en el ciclo lectivo actual.
              </p>
            </CardContent>
          </Card>
          {user.role !== 'Docente' && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Docentes Activos
                </CardTitle>
                <BookUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{stats.activeTeachers}</div>
                <p className="text-xs text-muted-foreground">
                    Docentes activos en el ciclo actual.
                </p>
                </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exámenes Cerrados</CardTitle>
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedExams}</div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones finalizadas en el ciclo actual.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Exámenes Abiertos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingExams}</div>
              <p className="text-xs text-muted-foreground">
                Evaluaciones en curso en el ciclo actual.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Rendimiento General por Grado</CardTitle>
                <CardDescription>
                  Promedio de rendimiento en el ciclo lectivo actual.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/analisis">
                  Ver Análisis Detallado
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                     <BarChart accessibilityLayer data={performanceByGrade}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            domain={[0, 100]}
                            unit="%"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="Rendimiento" fill="hsl(var(--chart-1))" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => `${value.toFixed(0)}%`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>

          {/* Tarjeta de Estadisticas de Examenes (Evaluador, Administrador, Referente) vs Resultados Recientes (Director, Docente) */}
          {isOverviewRole ? (
            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">
                      Estadísticas de Exámenes
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Por Escuela
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {user.role === 'Referente'
                      ? `Impacto en escuelas de tu región (${settings.currentSchoolYear}).`
                      : `Impacto y rendimiento institucional (${settings.currentSchoolYear}).`}
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard/examenes" title="Ir a Gestión de Exámenes">
                    Ver todos
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[460px] space-y-3.5 pr-1">
                {examStatsList.length > 0 ? (
                  examStatsList.map(({ exam, totalStudents, avgScore, approvalRate, schoolsCount, schools }) => {
                    const hasEvaluations = totalStudents > 0;
                    return (
                      <div
                        key={exam.id}
                        className="rounded-lg border bg-card p-3.5 space-y-2.5 transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        {/* Cabecera del Examen */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-semibold">
                                {exam.tema}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                {exam.grade}
                              </Badge>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenExamStats(exam)}
                              className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left truncate block w-full hover:underline"
                              title="Clic para ver KPIs, preguntas y dificultad"
                            >
                              {exam.name}
                            </button>
                          </div>

                          {/* Badge de Rendimiento */}
                          <div className="text-right shrink-0">
                            {hasEvaluations ? (
                              <Badge
                                variant={avgScore >= 75 ? "outline" : avgScore >= 50 ? "outline" : "destructive"}
                                className={`font-mono text-xs font-bold ${
                                  avgScore >= 75
                                    ? "border-emerald-500 text-emerald-600 bg-emerald-500/10"
                                    : avgScore >= 50
                                    ? "border-amber-500 text-amber-600 bg-amber-500/10"
                                    : ""
                                }`}
                              >
                                {avgScore.toFixed(1)}% prom.
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                                Sin datos
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Metricas Rapidas */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-1 px-2 rounded bg-muted/40 border text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground">{schoolsCount}</span> escuela{schoolsCount !== 1 ? 's' : ''} evaluada{schoolsCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-foreground">{totalStudents}</span> alumno{totalStudents !== 1 ? 's' : ''} ({approvalRate.toFixed(0)}% aprob.)
                          </div>
                        </div>

                        {/* Impacto por Escuela */}
                        {schools.length > 0 && (
                          <div className="space-y-1 pt-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <SchoolIcon className="h-3 w-3" />
                              Impacto por Escuela:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {schools.map((s) => (
                                <div
                                  key={s.schoolName}
                                  className="inline-flex items-center gap-1.5 text-[11px] bg-background border px-2 py-0.5 rounded shadow-2xs"
                                  title={`${s.schoolName}: ${s.avgScore.toFixed(1)}% rendimiento promedio, ${s.studentsCount} alumnos evaluados`}
                                >
                                  <span className="font-medium text-foreground truncate max-w-[120px]">
                                    {s.schoolName}:
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      s.avgScore >= 75
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : s.avgScore >= 50
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-destructive"
                                    }`}
                                  >
                                    {s.avgScore.toFixed(0)}%
                                  </span>
                                  <span className="text-muted-foreground text-[10px]">
                                    ({s.studentsCount} al.)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Botones de Accion Rapida */}
                        <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenExamStats(exam)}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                            title="Abrir KPIs, preguntas y dificultad"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver KPIs y Dificultad
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                            title="Ir al análisis detallado con gráficos"
                          >
                            <Link href={`/dashboard/analisis?exam=${encodeURIComponent(exam.name)}`}>
                              <BarChart2 className="h-3.5 w-3.5" />
                              Gráficos
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Aún no hay exámenes ni estadísticas cargadas en este ciclo.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Resultados Recientes</CardTitle>
                <CardDescription>
                  Últimos resultados cargados en el ciclo actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8">
                {recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <div className="flex items-center gap-4" key={result.id}>
                      <div className="hidden h-9 w-9 sm:flex items-center justify-center">
                        <RoleIcon role="Docente" />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          {result.studentName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.examName}
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-sm text-right">
                        <div>{result.school}</div>
                        <Badge variant={result.status === "Aprobado" ? "default" : "destructive"}>
                          {(result.score / 10).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    Aún no hay resultados cargados en este ciclo.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modal con KPIs, metricas generales y dificultad de preguntas */}
      <ViewExamDialog
        exam={viewingExam}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        results={viewingExam ? filteredData.results.filter((r) => r.examId === viewingExam.id) : []}
      />
    </div>
  );
}
