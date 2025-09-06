
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getExams } from "@/data/exams";
import { getAuthUser } from "@/lib/auth";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { ExamActionsClient } from "./exam-actions-client";

export default async function ExamenesPage() {
  const user = await getAuthUser();
  const allExams = await getExams();

  if (!user) {
    return <div>Cargando...</div>;
  }
  
  const filteredExams = allExams.filter(exam => {
      if (!user) return false;
      if (user.role === 'Docente') {
          return exam.grade === user.grade && exam.status === 'Cerrado';
      }
      if (user.role === 'Director') {
          return exam.status === 'Cerrado';
      }
      return true;
  });

  const userCanCreateExams = !["Director", "Docente"].includes(user.role);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Exámenes</h1>
          <p className="text-muted-foreground">Crea, edita y administra las evaluaciones del sistema.</p>
        </div>
        {userCanCreateExams && (
          <Button asChild>
            <Link href="/dashboard/examenes/crear">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Examen
            </Link>
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Exámenes Existentes</CardTitle>
          <CardDescription>Lista de todos los exámenes cargados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título del Examen</TableHead>
                <TableHead>Tema/Materia</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{exam.tema}</TableCell>
                  <TableCell>{exam.grade}</TableCell>
                  <TableCell>
                    <Badge variant={exam.status === "Cerrado" ? "default" : "destructive"}>{exam.status}</Badge>
                  </TableCell>
                  <TableCell>{exam.created}</TableCell>
                  <TableCell>
                    <ExamActionsClient exam={exam} userRole={user.role} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
