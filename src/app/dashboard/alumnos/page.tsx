
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAuthUser } from "@/lib/auth"; 
import { getStudents } from "@/data/students";
import { getResults } from "@/data/results";
import { StudentActions } from "@/components/student-actions";

export default async function AlumnosPage() {
  const user = await getAuthUser(); 
  const allStudents = await getStudents();
  const allResults = await getResults();

  if (!user) {
    return <div>Error: Usuario no autenticado. Por favor, inicie sesión.</div>;
  }
  
  // Pre-process students to include their results for badge counting
  const studentsWithResults = allStudents.map(student => ({
      ...student,
      results: allResults.filter(r => r.studentId === student.id)
  }));

  // Filter the processed list based on user role
  let studentList = studentsWithResults;
  
  if (user.role === 'Docente') {
    studentList = studentsWithResults.filter(student => 
        student.school === user.school && 
        student.grade === user.grade && 
        student.course === user.course
    );
  } else if (user.role === 'Director') {
    studentList = studentsWithResults.filter(student => student.school === user.school);
  }

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
