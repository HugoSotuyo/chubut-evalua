

"use client";

import { useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  BookUser,
  FileCheck2,
  Users,
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


export default function Dashboard() {
    const { user } = useAuth();
    const { users: allUsers } = useUsers();
    const { students: allStudents } = useStudents();
    const { exams: allExams } = useExams();
    const { results: allResults } = useResults();
    const { settings } = useSettings();

    const filteredData = useMemo(() => {
        if (!user || !settings.currentSchoolYear) return { users: [], students: [], exams: [], results: [] };

        // Start by filtering all data for the current school year
        const usersInYear = allUsers.filter(u => u.schoolYear === settings.currentSchoolYear);
        const studentsInYear = allStudents.filter(s => s.schoolYear === settings.currentSchoolYear);
        const resultsInYear = allResults.filter(r => r.schoolYear === settings.currentSchoolYear);
        
        // We can't filter exams by school year directly, so we'll derive them from results.
        const relevantExamIds = new Set(resultsInYear.map(r => r.examId));
        const examsInYear = allExams.filter(e => relevantExamIds.has(e.id));


        if (user.role === 'Director') {
            const schoolStudents = studentsInYear.filter(s => s.school === user.school);
            const schoolResults = resultsInYear.filter(r => r.school === user.school);
            const schoolRelevantExamIds = new Set(schoolResults.map(r => r.examId));
            const schoolExams = allExams.filter(e => schoolRelevantExamIds.has(e.id));
            const schoolTeachers = usersInYear.filter(u => u.school === user.school && u.role === 'Docente');
            return { users: schoolTeachers, students: schoolStudents, exams: schoolExams, results: schoolResults };
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
            const courseExams = allExams.filter(e => e.grade === user.grade); // For teachers, exams are by grade
             return { users: allUsers, students: courseStudents, exams: courseExams, results: courseResults };
        }

        // For Evaluador, Administrador, Referente, return all data from the current year
        return { users: usersInYear, students: studentsInYear, exams: examsInYear, results: resultsInYear };
    }, [user, allUsers, allStudents, allExams, allResults, settings.currentSchoolYear]);

    const stats = useMemo(() => {
        const activeTeachers = filteredData.users.filter(u => u.role === 'Docente' && u.status === 'Activo').length;
        const closedExams = filteredData.exams.filter(e => e.status === 'Cerrado').length;
        const pendingExams = filteredData.exams.filter(e => e.status === 'Abierto').length;

        return {
            totalStudents: filteredData.students.length,
            activeTeachers,
            closedExams,
            pendingExams,
        }
    }, [filteredData]);
    
    const recentResults = useMemo(() => {
        return [...filteredData.results].reverse().slice(0, 5);
    }, [filteredData.results]);

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
          <Card>
            <CardHeader>
              <CardTitle>Resultados Recientes</CardTitle>
              <CardDescription>
                Últimos resultados cargados en el ciclo actual.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
            {recentResults.length > 0 ? recentResults.map((result) => (
                <div className=" flex items-center gap-4" key={result.id}>
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
            )) : (
                <div className="text-center text-muted-foreground">
                    Aún no hay resultados cargados en este ciclo.
                </div>
            )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    

    

    