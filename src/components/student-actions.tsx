
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, FileSignature } from "lucide-react";
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
import { useStudents } from "@/context/students-context";
import { useAuth } from "@/context/auth-context";
import type { Student } from "@/context/students-context";
import { CargarResultadosDialog } from "./cargar-resultados-dialog";

interface StudentActionsProps {
  student?: Student;
}

export function StudentActions({ student }: StudentActionsProps) {
  const { students, addStudent, deleteStudent } = useStudents();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCargarResultadosOpen, setIsCargarResultadosOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleOpenForm = (studentToEdit: Student | null = null) => {
    setEditingStudent(studentToEdit);
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
    if (!user) {
        toast({ title: "Error", description: "No se ha podido identificar al usuario.", variant: "destructive"});
        return;
    }

    const formData = new FormData(e.currentTarget);
    const studentData = {
      name: formData.get("name") as string,
      dni: formData.get("dni") as string,
    };
    
    if (!editingStudent && students.some(s => s.dni === studentData.dni)) {
      toast({
        title: "DNI Duplicado",
        description: `Ya existe un alumno con el DNI ${studentData.dni}.`,
        variant: "destructive",
      });
      return;
    }

    if (editingStudent) {
      // TODO: Implement updateStudent in context
      console.log("Updating student:", { ...editingStudent, ...studentData });
      toast({
        title: "Alumno Actualizado (Simulación)",
        description: `Los datos de ${studentData.name} han sido actualizados.`,
      });
    } else {
      addStudent({
        name: studentData.name,
        dni: studentData.dni,
        school: user.school,
        grade: user.grade || "Sin Grado",
        course: user.course || "Sin Curso",
      });
      toast({
        title: "Alumno Agregado",
        description: `${studentData.name} ha sido agregado a la lista.`,
      });
    }

    handleCloseForm();
  };

  // Render "Add Student" button if no student prop
  if (!student) {
    return (
      <>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Alumno
        </Button>
        <FormDialog isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveStudent} editingStudent={editingStudent} onClose={handleCloseForm} />
      </>
    );
  }

  // Render dropdown menu for a specific student
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setIsCargarResultadosOpen(true)}>
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
      <FormDialog isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSave={handleSaveStudent} editingStudent={editingStudent} onClose={handleCloseForm} />
      {isCargarResultadosOpen && (
        <CargarResultadosDialog
          student={student}
          isOpen={isCargarResultadosOpen}
          onOpenChange={setIsCargarResultadosOpen}
        />
      )}
    </>
  );
}

// Separate dialog component to keep the main component cleaner
function FormDialog({ isOpen, onOpenChange, onSave, editingStudent, onClose }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (e: React.FormEvent<HTMLFormElement>) => void, editingStudent: Student | null, onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSave}>
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
                readOnly={!!editingStudent}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
