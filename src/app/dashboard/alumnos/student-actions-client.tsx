
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, FileSignature, FileDown } from "lucide-react";
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
import { useAuth } from "@/context/auth-context";
import { CargarResultadosDialog } from "@/components/cargar-resultados-dialog";
import type { Student } from "@/lib/types";

interface StudentActionsProps {
  student?: Student;
  studentList?: Student[];
}

export function StudentActionsClient({ student, studentList = [] }: StudentActionsProps) {
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
    toast({
      title: "Funcionalidad en Desarrollo",
      description: `La eliminación de alumnos estará disponible próximamente.`,
    });
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Error", description: "No se ha podido identificar al usuario.", variant: "destructive"});
        return;
    }
    toast({
      title: "Funcionalidad en Desarrollo",
      description: `El guardado de alumnos estará disponible próximamente.`,
    });
    handleCloseForm();
  };
  
  const handleExport = () => {
    if (!studentList || studentList.length === 0) {
        toast({ title: "No hay datos", description: "No hay alumnos para exportar."});
        return;
    }
    const headers = ["Nombre Completo", "DNI", "Grado", "Curso"];
    const rows = studentList.map(s => 
        [s.name, s.dni, s.grade, s.course].join(';')
    );
    
    const bom = "\uFEFF";
    const csvContent = bom + [headers.join(';'), ...rows].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "alumnos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Render "Add Student" and "Export" buttons if no student prop
  if (!student) {
    return (
      <>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Alumno
        </Button>
        <Button onClick={handleExport} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Alumnos
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
  const [name, setName] = useState(editingStudent?.name || "");
  const [dni, setDni] = useState(editingStudent?.dni || "");

  useEffect(() => {
    if (isOpen) {
      setName(editingStudent?.name || "");
      setDni(editingStudent?.dni || "");
    }
  }, [isOpen, editingStudent]);


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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={dni}
                onChange={(e) => setDni(e.target.value)}
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
