
"use client"

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, User, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context"; 
import { useStudents } from "@/context/students-context";
import { useResults } from "@/context/results-context";
import { StudentActionsClient } from "./student-actions-client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearch } from "@/context/search-context";
import { useSettings } from "@/context/settings-context";

export default function AlumnosPage() {
  const { user } = useAuth(); 
  const { students: allStudents } = useStudents();
  const { results: allResults } = useResults();
  const { searchTerm } = useSearch();
  const { settings } = useSettings();

  const [gradeFilter, setGradeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [schoolYearFilter, setSchoolYearFilter] = useState(settings.currentSchoolYear);

  if (!user) {
    return <div>Cargando...</div>
  }
  
  const studentsWithResults = useMemo(() => allStudents.map(student => ({
      ...student,
      results: allResults.filter(r => r.studentId === student.id)
  })), [allStudents, allResults]);

  const studentsInScope = useMemo(() => {
    let baseList = studentsWithResults;
    
    // Primero, filtrar por ciclo lectivo si no es "todos"
    if (schoolYearFilter !== "all" && user.role !== 'Docente') {
        baseList = baseList.filter(student => student.schoolYear === schoolYearFilter);
    }
      
    if (user.role === 'Docente') {
      if (user.school && user.grade && user.course) {
        return baseList.filter(student => 
            student.school === user.school && 
            student.grade === user.grade && 
            student.course === user.course &&
            student.schoolYear === settings.currentSchoolYear
        );
      }
      return [];
    } else if (user.role === 'Director') {
      if (user.school) {
        return baseList.filter(student => student.school === user.school);
      }
      return [];
    }
    return baseList;
  }, [studentsWithResults, user, schoolYearFilter, settings.currentSchoolYear]);
  
  const studentList = useMemo(() => {
    let filtered = studentsInScope;
    if (user.role === 'Director' || user.role === 'Evaluador' || user.role === 'Administrador' || user.role === 'Referente') {
      if (gradeFilter !== "all") {
        filtered = filtered.filter(student => student.grade === gradeFilter);
      }
      if (courseFilter !== "all") {
        filtered = filtered.filter(student => student.course === courseFilter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [studentsInScope, gradeFilter, courseFilter, user.role, searchTerm]);
  
  const availableGrades = useMemo(() => {
      const grades = studentsInScope.map(s => s.grade);
      return [...new Set(grades)].sort();
  }, [studentsInScope]);

  const availableCourses = useMemo(() => {
      const courses = studentsInScope.map(s => s.course);
      return [...new Set(courses)].sort();
  }, [studentsInScope]);
  
  const availableSchoolYears = useMemo(() => {
    return [...new Set(allStudents.map(s => s.schoolYear).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  }, [allStudents]);


  const getCardTexts = () => {
    switch (user.role) {
      case 'Docente':
        return {
          title: `Alumnos de ${user.grade || 'Grado sin asignar'} ${user.course || 'Curso sin asignar'}`,
          description: 'Lista de todos los alumnos registrados en tu curso.',
        };
      case 'Director':
        return {
          title: `Alumnos de ${user.school}`,
          description: 'Lista de todos los alumnos registrados en tu escuela.',
        };
      default:
        return {
          title: 'Alumnos Registrados',
          description: 'Lista de todos los alumnos del sistema.',
        };
    }
  };

  const { title: cardTitle, description: cardDescription } = getCardTexts();
  
  const showFilters = user.role === 'Director' || user.role === 'Evaluador' || user.role === 'Administrador' || user.role === 'Referente';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Alumnos</h1>
          <p className="text-muted-foreground">Administra los alumnos de tu escuela.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* This button will now open a dialog managed within StudentActions */}
          <StudentActionsClient studentList={studentList} /> 
        </div>
      </div>
      
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filtros</CardTitle>
            </div>
            <CardDescription>Filtra la lista de alumnos por grado y curso.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
             <div className="grid gap-2">
              <Label htmlFor="school-year-filter">Ciclo Lectivo</Label>
              <Select onValueChange={setSchoolYearFilter} value={schoolYearFilter}>
                <SelectTrigger id="school-year-filter">
                  <SelectValue placeholder="Seleccionar ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Ciclos</SelectItem>
                  {availableSchoolYears.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade-filter">Grado</Label>
              <Select onValueChange={setGradeFilter} value={gradeFilter}>
                <SelectTrigger id="grade-filter">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Grados</SelectItem>
                  {availableGrades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-filter">Curso</Label>
              <Select onValueChange={setCourseFilter} value={courseFilter}>
                <SelectTrigger id="course-filter">
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Cursos</SelectItem>
                  {availableCourses.map((course) => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>{cardTitle}</CardTitle>
          </div>
          <CardDescription>
            {cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Exámenes Cargados</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentList.length > 0 ? (
                studentList.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.dni}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>
                      {student.results && student.results.length > 0 ? (
                        <Badge variant="secondary">{student.results.length} cargado(s)</Badge>
                      ) : (
                        <Badge variant="outline">Ninguno</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                        <StudentActionsClient student={student} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                        No se encontraron alumnos que coincidan con los filtros.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
