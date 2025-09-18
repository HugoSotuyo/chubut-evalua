
"use client"

import { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from "date-fns"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExams } from "@/context/exams-context";
import { useAuth } from "@/context/auth-context";
import { useSearch } from "@/context/search-context";
import { PlusCircle, Trash2, Save, Filter, Paperclip, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { ExamActionsClient } from "./exam-actions-client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Exam } from "@/lib/types"
import { useSettings } from '@/context/settings-context';
import { useResults } from '@/context/results-context';


const questionSchema = z.object({
  consigna: z.string().min(1, "La consigna es requerida."),
  respuesta: z.string().min(1, "La respuesta es requerida."),
  puntaje: z.coerce.number().min(0, "El puntaje no puede ser negativo.").default(0),
  allowedScores: z.string().optional(),
})

const examSchema = z.object({
  tema: z.string().min(1, "El tema es requerido."),
  titulo: z.string().min(1, "El título es requerido."),
  grade: z.string().min(1, "El grado es requerido."),
  fechaCarga: z.date({
    required_error: "La fecha de carga es requerida.",
  }),
  questions: z.array(questionSchema).min(1, "Debes agregar al menos una pregunta."),
  file: z.instanceof(FileList).optional(),
})

type ExamFormValues = z.infer<typeof examSchema>

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const parseDate = (dateString: string | undefined): Date => {
    if (!dateString) return new Date();
    // Handles ISO strings like "2024-05-10" by parsing them as UTC
    return parseISO(dateString);
}


export default function ExamenesPage() {
  const { user } = useAuth();
  const { exams: allExams, updateExam } = useExams();
  const { results: allResults } = useResults();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { searchTerm } = useSearch();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [schoolYearFilter, setSchoolYearFilter] = useState(settings.currentSchoolYear || "all");

  const availableSchoolYears = useMemo(() => {
    return [...new Set(allResults.map(r => r.schoolYear).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  }, [allResults]);

  const filteredExams = useMemo(() => {
    if (!user) return [];
    let exams = allExams;
    
    if (user.role === 'Docente') {
        exams = exams.filter(exam => exam.grade === user.grade && exam.status === 'Cerrado');
    }
    if (user.role === 'Director') {
        exams = exams.filter(exam => exam.status === 'Cerrado');
        
        if (schoolYearFilter !== "all") {
            const resultsInYear = allResults.filter(r => r.schoolYear === schoolYearFilter && r.school === user.school);
            const examIdsInYear = new Set(resultsInYear.map(r => r.examId));
            exams = exams.filter(exam => examIdsInYear.has(exam.id));
        } else {
             // Show all exams that have results in the director's school across all years
            const resultsInSchool = allResults.filter(r => r.school === user.school);
            const examIdsInSchool = new Set(resultsInSchool.map(r => r.examId));
            exams = exams.filter(exam => examIdsInSchool.has(exam.id));
        }
    }
    
    if (searchTerm) {
        exams = exams.filter(exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return exams;
  }, [allExams, user, searchTerm, schoolYearFilter, allResults]);

  const handleOpenEditDialog = (exam: Exam) => {
    setEditingExam(exam);
    setIsEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditingExam(null);
    setIsEditDialogOpen(false);
  }

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      titulo: "",
      tema: "",
      grade: "",
      fechaCarga: new Date(),
      questions: [{ consigna: "", respuesta: "", puntaje: settings.defaultScore, allowedScores: "" }],
    },
  })

  useEffect(() => {
    if (editingExam) {
      form.reset({
        titulo: editingExam.name,
        tema: editingExam.tema,
        grade: editingExam.grade,
        fechaCarga: parseDate(editingExam.created),
        questions: (editingExam.questions && editingExam.questions.length > 0)
          ? editingExam.questions.map(q => ({
              ...q,
              allowedScores: q.allowedScores?.join(', ') || ''
            }))
          : [{ consigna: "", respuesta: "", puntaje: settings.defaultScore, allowedScores: "" }],
      })
    }
  }, [editingExam, form, settings.defaultScore])


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const onSubmit = async (data: ExamFormValues) => {
    if (!editingExam || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let fileDataUrl: string | undefined = editingExam.fileDataUrl;
      let fileName: string | undefined = editingExam.fileName;

      if (data.file && data.file.length > 0) {
          const file = data.file[0];
          fileDataUrl = await fileToDataUrl(file);
          fileName = file.name;
      }

      const questionsWithParsedScores = data.questions.map(q => {
          const { allowedScores, ...rest } = q;
          const scores = allowedScores
              ? allowedScores.split(',').map(s => parseFloat(s.trim())).filter(s => !isNaN(s))
              : [];
          return {
              ...rest,
              ...(scores.length > 0 && { allowedScores: scores }),
          };
      });

      await updateExam({
          id: editingExam.id,
          name: data.titulo,
          tema: data.tema,
          grade: data.grade,
          created: format(data.fechaCarga, "yyyy-MM-dd"),
          questions: questionsWithParsedScores,
          fileDataUrl,
          fileName,
      });

      toast({
        title: "Examen Actualizado",
        description: "Los cambios se han guardado correctamente.",
      })
      handleCloseEditDialog();
    } catch (error) {
       toast({ title: "Error", description: "No se pudo actualizar el examen.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }


  if (!user) {
    return <div>Cargando...</div>;
  }

  const userCanCreateExams = !["Director", "Docente"].includes(user.role);

  return (
    <>
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
        
        {user.role === 'Director' && (
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle>Filtros</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
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
                    </div>
                </CardContent>
            </Card>
        )}

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
                      <ExamActionsClient exam={exam} userRole={user.role} onEdit={handleOpenEditDialog} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <DialogHeader>
                  <DialogTitle>Editar Examen</DialogTitle>
                  <DialogDescription>Modifica los detalles de la evaluación.</DialogDescription>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Información General</CardTitle>
                    <CardDescription>Datos principales del examen y archivo adjunto.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="tema"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema / Materia</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Matemática" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del Examen</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Diagnóstico de 1er Trimestre" {...field} disabled={isSubmitting}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un grado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="1er Grado">1er Grado</SelectItem>
                                <SelectItem value="2do Grado">2do Grado</SelectItem>
                                <SelectItem value="3er Grado">3er Grado</SelectItem>
                                <SelectItem value="4to Grado">4to Grado</SelectItem>
                                <SelectItem value="5to Grado">5to Grado</SelectItem>
                                <SelectItem value="6to Grado">6to Grado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaCarga"
                      render={({ field }) => (
                        <FormItem className="flex flex-col pt-2.5">
                          <FormLabel>Fecha de Carga</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={isSubmitting}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adjuntar Archivo Nuevo</FormLabel>
                                 <FormControl>
                                    <Input type="file" {...form.register("file")} disabled={isSubmitting}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    {editingExam?.fileName && (
                        <div className="flex items-center space-x-2 text-sm col-span-full">
                            <Paperclip className="h-4 w-4" />
                            <span>Archivo actual: {editingExam.fileName}</span>
                        </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Consignas y Preguntas</CardTitle>
                        <CardDescription>Define las preguntas, sus respuestas correctas y el puntaje asignado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Label className="font-bold text-lg">Pregunta {index + 1}</Label>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.consigna`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-12">
                                            <FormLabel>Consigna</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Escribe el enunciado de la pregunta..." {...field} disabled={isSubmitting}/>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.respuesta`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-5">
                                            <FormLabel>Respuesta Correcta</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: 42" {...field} disabled={isSubmitting}/>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.puntaje`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                            <FormLabel>Puntaje Máx.</FormLabel>
                                            <FormControl>
                                                <Input
                                                  type="number"
                                                  step={settings.scoreStep}
                                                  {...field}
                                                  onChange={event => field.onChange(Number(event.target.value))}
                                                  disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`questions.${index}.allowedScores`}
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-5">
                                                <FormLabel>Calificaciones Posibles</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej: 0, 0.5, 1" {...field} disabled={isSubmitting}/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={() => remove(index)}
                                        disabled={isSubmitting}
                                        >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                 {index < fields.length - 1 && <Separator />}
                            </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ consigna: "", respuesta: "", puntaje: settings.defaultScore, allowedScores: "" })}
                            disabled={isSubmitting}
                            >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar otra Consigna
                        </Button>
                    </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={handleCloseEditDialog} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
