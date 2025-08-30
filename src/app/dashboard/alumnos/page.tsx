
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, User, FileDown, Trash2 } from "lucide-react";
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

const initialStudents = [
    { id: "alu-001", name: "Juan Pérez", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-002", name: "María García", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-003", name: "Pedro Rodríguez", grade: "4to Grado", course: "B", school: "Escuela N° 789" },
    { id: "alu-004", name: "Ana Martínez", grade: "6to Grado", course: "C", school: "Escuela N° 101" },
];

type Student = typeof initialStudents[0];

export default function AlumnosPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const { searchTerm } = useSearch();
  const { user } = useAuth();

  const filteredStudents = useMemo(() => {
    if (!user) return [];
    let results = students.filter(student => student.school === user.school);
    
    if (searchTerm) {
      results = results.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return results;
  }, [students, searchTerm, user]);

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

    setStudents(students.filter(s => s.id !== studentId));
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
      grade: formData.get("grade") as string,
      course: formData.get("course") as string,
    };

    if (editingStudent) {
      // Update existing student
      const updatedStudents = students.map(s => 
        s.id === editingStudent.id ? { ...editingStudent, ...studentData } : s
      );
      setStudents(updatedStudents);
      toast({
        title: "Alumno Actualizado",
        description: `Los datos de ${studentData.name} han sido actualizados.`,
      });
    } else {
      // Add new student
      if (!user) return;
      const newStudent: Student = {
        id: `alu-${Date.now()}`,
        ...studentData,
        school: user.school,
      };
      setStudents([...students, newStudent]);
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

  if (!user) {
    return <div>Cargando...</div>;
  }

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
            <CardTitle>Alumnos de {user.school}</CardTitle>
          </div>
          <CardDescription>
            Lista de todos los alumnos registrados en tu escuela.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>"{student.course}"</TableCell>
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
                        <DropdownMenuItem onSelect={() => handleOpenForm(student)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDeleteStudent(student.id)}
                        >
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
                  : "Completa el formulario para agregar un nuevo alumno."}
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
                <Label htmlFor="grade" className="text-right">
                  Grado
                </Label>
                <Input
                  id="grade"
                  name="grade"
                  defaultValue={editingStudent?.grade}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  Curso
                </Label>
                <Input
                  id="course"
                  name="course"
                  defaultValue={editingStudent?.course}
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
