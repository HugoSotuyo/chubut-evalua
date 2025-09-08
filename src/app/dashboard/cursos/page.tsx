
"use client"

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Library, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useCourses } from "@/context/courses-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Course } from "@/lib/types";

const courseFormSchema = z.object({
  grade: z.string().min(1, "El grado es requerido."),
  section: z.string().min(1, "La sección es requerida.").max(5, "Máximo 5 caracteres."),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CursosPage() {
  const { user } = useAuth();
  const { courses, addCourse, deleteCourse, loading: coursesLoading } = useCourses();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      grade: "",
      section: "",
    },
  });

  const schoolCourses = useMemo(() => {
    if (!user || !user.school) return [];
    return courses
      .filter(c => c.school === user.school)
      .sort((a, b) => a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section));
  }, [courses, user]);

  const onSubmit = async (data: CourseFormValues) => {
    if (!user || !user.school || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await addCourse({
        grade: data.grade,
        section: data.section.toUpperCase(),
        school: user.school,
      });

      if (result.success) {
        toast({
          title: "Curso Agregado",
          description: `El curso ${data.grade} "${data.section.toUpperCase()}" ha sido agregado.`,
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Error al Agregar",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Inesperado",
        description: "Ocurrió un error al guardar el curso.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCourse = async (course: Course) => {
    await deleteCourse(course.id);
    toast({
        title: "Curso Eliminado",
        description: `El curso ${course.grade} "${course.section}" fue eliminado.`
    })
  }

  if (!user || user.role !== 'Director') {
    return <div>Acceso denegado.</div>;
  }
  
  if (coursesLoading) {
      return <div>Cargando cursos...</div>
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Cursos</h1>
        <p className="text-muted-foreground">Crea y administra los grados y secciones de tu escuela.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <CardTitle>Agregar Nuevo Curso</CardTitle>
            </div>
            <CardDescription>Define un nuevo grado y sección.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sección / Curso</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: A" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Guardando..." : "Guardar Curso"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              <CardTitle>Cursos Existentes en {user.school}</CardTitle>
            </div>
            <CardDescription>Lista de todos los cursos disponibles en tu escuela.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grado</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolCourses.length > 0 ? (
                  schoolCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.grade}</TableCell>
                      <TableCell>{course.section}</TableCell>
                      <TableCell className="text-right">
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el curso 
                                <span className="font-bold"> {course.grade} "{course.section}"</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCourse(course)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay cursos creados para esta escuela.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
