
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Download } from "lucide-react";
import { useExams } from "@/context/exams-context";
import { useToast } from "@/hooks/use-toast";
import type { Exam } from "@/context/exams-context";
import type { UserRole } from "@/lib/auth";

interface ExamActionsProps {
  exam: Exam;
  userRole: UserRole;
}

export function ExamActions({ exam, userRole }: ExamActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { deleteExam, toggleExamStatus } = useExams();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteExam(exam.id);
    toast({
        title: "Examen Eliminado",
        description: `El examen "${exam.name}" ha sido eliminado correctamente.`,
    });
    setIsAlertOpen(false);
  };

  const handleToggleStatus = () => {
    toggleExamStatus(exam.id);
    toast({
      title: "Estado del Examen Actualizado",
      description: `El examen "${exam.name}" ahora está ${exam.status === "Abierto" ? "Cerrado" : "Abierto"}.`,
    });
  };
  
  const handleEditExam = () => {
    router.push(`/dashboard/examenes/editar/${exam.id}`);
  };

  const handleViewAnalysis = () => {
    router.push(`/dashboard/analisis?exam=${encodeURIComponent(exam.name)}`);
  };

  const handleDownloadFile = () => {
    if (!exam.fileDataUrl || !exam.fileName) return;
    const link = document.createElement("a");
    link.href = exam.fileDataUrl;
    link.download = exam.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          {userRole === 'Director' || userRole === 'Docente' ? (
            <>
              <DropdownMenuItem onSelect={handleViewAnalysis}>Ver Análisis</DropdownMenuItem>
              {exam.fileDataUrl && (
                <DropdownMenuItem onSelect={handleDownloadFile}>
                  <Download className="mr-2 h-4 w-4"/>
                  Descargar Examen
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <>
              <DropdownMenuItem onSelect={handleEditExam}>Editar</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleViewAnalysis}>Ver Análisis</DropdownMenuItem>
              <DropdownMenuSeparator />
              {exam.fileDataUrl && (
                <DropdownMenuItem onSelect={handleDownloadFile}>
                  <Download className="mr-2 h-4 w-4"/>
                  Descargar Examen
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={handleToggleStatus}>
                {exam.status === "Abierto" ? "Cerrar Examen" : "Abrir Examen"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={handleDeleteClick}>
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que deseas eliminar este examen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el examen
              <span className="font-bold"> {exam.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
