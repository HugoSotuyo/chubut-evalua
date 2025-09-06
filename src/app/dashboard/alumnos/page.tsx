
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context"; 
import { useStudents } from "@/context/students-context";
import { useResults } from "@/context/results-context";
import { StudentActions } from "@/components/student-actions";

export default function AlumnosPage() {
  const { user } = useAuth(); 
  const { students: allStudents } = useStudents();
  const { results: allResults } = useResults();

  // Pre-process students to include their results for badge counting
  const studentsWithResults = useMemo(() => {
    return allStudents.map(student => ({
        ...student,
        results: allResults.filter(r => r.studentId === student.id)
    }));
  }, [allStudents, allResults]);


  const studentList = useMemo(() => {
    if (!user) return [];

    let filteredList = studentsWithResults;
  
    if (user.role === 'Docente') {
      filteredList = studentsWithResults.filter(student => 
          student.school === user.school && 
          student.grade === user.grade && 
          student.course === user.course
      );
    } else if (user.role === 'Director') {
      filteredList = studentsWithResults.filter(student => student.school === user.school);
    }

    return filteredList;

  }, [studentsWithResults, user]);


  const getCardTexts = () => {
    if (!user) {
        return {
            title: 'Alumnos',
            description: 'Lista de alumnos del sistema.'
        };
    }
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

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Alumnos</h1>
          <p className="text-muted-foreground">Administra los alumnos de tu escuela.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* This button will now open a dialog managed within StudentActions */}
          <StudentActions /> 
           <Button variant="outline" disabled> {/* Export would be a server action */}
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Alumnos
          </Button>
        </div>
      </div>

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
                    <TableCell>
                      {student.results && student.results.length > 0 ? (
                        <Badge variant="secondary">{student.results.length} cargado(s)</Badge>
                      ) : (
                        <Badge variant="outline">Ninguno</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                        <StudentActions student={student} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">
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
