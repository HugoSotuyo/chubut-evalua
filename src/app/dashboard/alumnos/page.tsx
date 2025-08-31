
"use client"

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, User, FileDown, Trash2, FileSignature } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/context/auth-context";
import { useStudents } from "@/context/students-context";
import { useResults } from "@/context/results-context";
import type { Student } from "@/context/students-context";

export default function AlumnosPage() {
  const { students, addStudent, deleteStudent } = useStudents();
  const { results } = useResults();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const { searchTerm } = useSearch();
  const { user } = useAuth();
  const router = useRouter();

  const filteredStudents = useMemo(() => {
    if (!user) return [];

    let studentList = students.map(student => ({
        ...student,
        results: results.filter(r => r.studentId === student.id)
    }));

    // 1. Filter by search term first
    if (searchTerm) {
      studentList = studentList.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.dni.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 2. Then, filter by role permissions
    if (user.role === 'Docente') {
      studentList = studentList.filter(student => 
          student.school === user.school && 
          student.grade === user.grade && 
          student.course === user.course
      );
    } else if (user.role === 'Director') {
      studentList = studentList.filter(student => student.school === user.school);
    }
    
    // For Evaluador, Admin, etc., no role-based filtering is applied, so they see all students.

    return studentList;
  }, [students, results, searchTerm, user]);


  const handleOpenForm = (student: Student | null = null) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingStudent(null);
    setIsFormOpen(false);
  };
  
  const handleDeleteStudent = (studentId: string) => {
    const studentToDelete = students.find(s => s.id === studentId);
    if (!studentToDelete) return;

    deleteStudent(studentId);
    toast({
      title: "Alumno Eliminado",
      description: `El alumno ${studentToDelete.name} ha sido eliminado.`,
    });
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentData = {
      name: formData.get("name") as string,
      dni: formData.get("dni") as string,
    };

    if (editingStudent) {
      // TODO: Implement updateStudent in context
       console.log("Updating student:", { ...editingStudent, ...studentData });
      toast({
        title: "Alumno Actualizado (Simulación)",
        description: `Los datos de ${studentData.name} han sido actualizados.`,
      });
    } else {
      if (!user) return;
      addStudent({
        name: studentData.name,
        dni: studentData.dni,
        school: user.school,
        grade: user.grade ?? "Sin Grado",
        course: user.course ?? "Sin Curso",
      });
      toast({
        title: "Alumno Agregado",
        description: `${studentData.name} ha sido agregado a la lista.`,
      });
    }

    handleCloseForm();
  };

  const handleExport = () => {
     toast({
        title: "Función no disponible",
        description: "La exportación de alumnos estará disponible próximamente.",
    });
  };

  const handleCargarExamen = (studentId: string) => {
    router.push(`/dashboard/resultados/cargar/${studentId}`);
  };

  if (!user) {
    return <div>Cargando...</div>;
  }
  
  const getCardTexts = () => {
    switch (user.role) {
      case 'Docente':
        return {
          title: `Alumnos de ${user.grade} ${user.course}`,
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
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Alumno
          </Button>
          <Button variant="outline" onClick={handleExport}>
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
              {filteredStudents.map((student) => (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleCargarExamen(student.id)}>
                            <FileSignature className="mr-2 h-4 w-4" />
                            Cargar Examen
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenForm(student)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveStudent}>
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Editar Alumno" : "Agregar Nuevo Alumno"}
              </DialogTitle>
              <DialogDescription>
                {editingStudent
                  ? "Modifica los datos del alumno."
                  : "Completa el formulario para agregar un nuevo alumno. La escuela, grado y curso se asignarán automáticamente."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingStudent?.name}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dni" className="text-right">
                  DNI
                </Label>
                <Input
                  id="dni"
                  name="dni"
                  defaultValue={editingStudent?.dni}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={handleCloseForm}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
