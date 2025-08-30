
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle, Trash2, Save, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useExams } from "@/context/exams-context"
import { useEffect, useState } from "react"

const questionSchema = z.object({
  consigna: z.string().min(1, "La consigna es requerida."),
  respuesta: z.string().min(1, "La respuesta es requerida."),
  puntaje: z.coerce.number().min(0, "El puntaje no puede ser negativo.").default(0),
})

const examSchema = z.object({
  tema: z.string().min(1, "El tema es requerido."),
  titulo: z.string().min(1, "El título es requerido."),
  fechaCarga: z.date({
    required_error: "La fecha de carga es requerida.",
  }),
  questions: z.array(questionSchema).min(1, "Debes agregar al menos una pregunta."),
})

type ExamFormValues = z.infer<typeof examSchema>

// Helper para parsear la fecha sin problemas de timezone
const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export default function CrearExamenPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addExam, updateExam, exams } = useExams()

  const [examId, setExamId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      tema: "",
      titulo: "",
      fechaCarga: new Date(),
      questions: [{ consigna: "", respuesta: "", puntaje: 10 }],
    },
  })

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && exams.length > 0) {
      const examToEdit = exams.find(e => e.id === id);
      if (examToEdit) {
        setExamId(id);
        setIsEditMode(true);
        form.reset({
          titulo: examToEdit.name,
          tema: examToEdit.tema,
          fechaCarga: parseDate(examToEdit.created),
          questions: examToEdit.questions && examToEdit.questions.length > 0 ? examToEdit.questions : [{ consigna: "", respuesta: "", puntaje: 10 }],
        });
      }
    }
  }, [searchParams, exams]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  const onSubmit = (data: ExamFormValues) => {
    if (isEditMode && examId) {
       updateExam({
        id: examId,
        name: data.titulo,
        tema: data.tema,
        created: format(data.fechaCarga, "yyyy-MM-dd"),
        questions: data.questions,
      });
       toast({
        title: "Examen Actualizado",
        description: `El examen "${data.titulo}" ha sido actualizado exitosamente.`,
      })
    } else {
        addExam({
            name: data.titulo,
            tema: data.tema,
            created: format(data.fechaCarga, "yyyy-MM-dd"),
            questions: data.questions,
        });
        toast({
          title: "Examen Guardado",
          description: `El examen "${data.titulo}" ha sido guardado exitosamente.`,
        })
    }
    router.push("/dashboard/examenes")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {isEditMode ? "Editar Examen" : "Crear Nuevo Examen"}
                </h1>
                <p className="text-muted-foreground">
                    {isEditMode ? "Modifica los detalles de la evaluación." : "Completa los detalles para crear una nueva evaluación."}
                </p>
            </div>
             <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard/examenes')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Guardar Cambios" : "Guardar Examen"}
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Datos principales del examen.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="tema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema / Materia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Matemática" {...field} />
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
                    <Input placeholder="Ej: Diagnóstico de 1er Trimestre" {...field} />
                  </FormControl>
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
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                                    <FormItem className="md:col-span-8">
                                    <FormLabel>Consigna</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Escribe el enunciado de la pregunta..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <FormField
                                control={form.control}
                                name={`questions.${index}.respuesta`}
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                    <FormLabel>Respuesta Correcta</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 42" {...field} />
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
                                    <FormLabel>Puntaje</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
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
                    onClick={() => append({ consigna: "", respuesta: "", puntaje: 10 })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar otra Consigna
                </Button>
            </CardContent>
        </Card>
      </form>
    </Form>
  )
}
