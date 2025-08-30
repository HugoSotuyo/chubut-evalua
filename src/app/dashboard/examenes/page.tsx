
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useExams } from "@/context/exams-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Exam } from "@/context/exams-context";

export default function ExamenesPage() {
  const { exams, deleteExam, toggleExamStatus } = useExams();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleOpenDeleteDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setIsAlertOpen(true);
  };

  const handleDeleteExam = () => {
    if (!selectedExam) return;
    deleteExam(selectedExam.id);
    toast({
        title: "Examen Eliminado",
        description: `El examen "${selectedExam.name}" ha sido eliminado correctamente.`,
    });
    setIsAlertOpen(false);
    setSelectedExam(null);
  };

  const handleToggleStatus = (exam: Exam) => {
    toggleExamStatus(exam.id);
    toast({
      title: "Estado del Examen Actualizado",
      description: `El examen "${exam.name}" ahora está ${exam.status === "Abierto" ? "Cerrado" : "Abierto"}.`,
    });
  };
  
  const handleEditExam = (exam: Exam) => {
    router.push(`/dashboard/examenes/editar/${exam.id}`);
  };

  const handleViewResults = (exam: Exam) => {
    router.push(`/dashboard/resultados?exam=${encodeURIComponent(exam.name)}`);
  };


  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Exámenes</h1>
                <p className="text-muted-foreground">Crea, edita y administra las evaluaciones del sistema.</p>
            </div>
            <Button asChild>
                <Link href="/dashboard/examenes/crear">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Examen
                </Link>
            </Button>
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
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {exams.map((exam) => (
                        <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>{exam.tema}</TableCell>
                            <TableCell>
                                <Badge variant={exam.status === "Cerrado" ? "destructive" : "default"}>{exam.status}</Badge>
                            </TableCell>
                            <TableCell>{exam.created}</TableCell>
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
                                        <DropdownMenuItem onSelect={() => handleEditExam(exam)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleViewResults(exam)}>Ver Resultados</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleToggleStatus(exam)}>
                                            {exam.status === "Abierto" ? "Cerrar Examen" : "Abrir Examen"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onSelect={() => handleOpenDeleteDialog(exam)}>
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

         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro de que deseas eliminar este examen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el examen
                        <span className="font-bold"> {selectedExam?.name}</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedExam(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteExam}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
