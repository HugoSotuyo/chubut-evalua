
"use client"

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, User, Users, FileSignature, BarChart2, Building, Shield, KeyRound, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AyudaDocente = () => (
    <Card>
        <CardHeader>
            <CardTitle>Guía para Docentes</CardTitle>
            <CardDescription>Aquí encontrarás cómo utilizar las herramientas disponibles para tu rol.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="alumnos">
                    <AccordionTrigger>¿Cómo gestiono mis alumnos?</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="text-sm">La sección <Badge variant="secondary">Alumnos</Badge> te permite administrar la lista de estudiantes de tu curso.</div>
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Agregar un nuevo alumno</AlertTitle>
                                <AlertDescription>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Ve al menú de navegación y haz clic en <span className="font-semibold">Alumnos</span>.</li>
                                        <li>En la parte superior derecha de la pantalla, haz clic en el botón <Badge>+ Agregar Alumno</Badge>.</li>
                                        <li>Completa el nombre y DNI del alumno en el formulario que aparece.</li>
                                        <li>Haz clic en <span className="font-semibold">Guardar</span>. El alumno se asignará automáticamente a tu escuela, grado y curso.</li>
                                    </ol>
                                </AlertDescription>
                            </Alert>
                             <Alert variant="destructive">
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Importante</AlertTitle>
                                <AlertDescription>
                                   No podrás editar el DNI de un alumno una vez que ha sido creado. Si cometes un error, deberás eliminar al alumno y volver a crearlo.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="resultados">
                    <AccordionTrigger>¿Cómo cargo los resultados de un examen?</AccordionTrigger>
                    <AccordionContent>
                         <div className="space-y-4">
                            <div className="text-sm">Puedes cargar los resultados de un examen para cada alumno de forma individual.</div>
                            <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Cargar un examen</AlertTitle>
                                <AlertDescription>
                                     <ol className="list-decimal list-inside space-y-2">
                                        <li>Ve a la sección de <span className="font-semibold">Alumnos</span>.</li>
                                        <li>Busca al alumno que deseas calificar y haz clic en el menú de acciones (los tres puntos verticales) a la derecha.</li>
                                        <li>Selecciona la opción <Badge variant="secondary">Cargar Examen</Badge>.</li>
                                        <li>En el diálogo, elige el examen que corresponde y completa el puntaje para cada pregunta.</li>
                                        <li>Una vez completado, haz clic en <span className="font-semibold">Guardar Resultados</span>.</li>
                                    </ol>
                                </AlertDescription>
                            </Alert>
                            <div className="text-sm">Solo podrás cargar exámenes que estén en estado <Badge variant="destructive">Cerrado</Badge> y que correspondan a tu grado. Además, no podrás cargar un examen que el alumno ya tenga calificado.</div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="analisis">
                    <AccordionTrigger>¿Cómo veo el rendimiento de mi curso?</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">La sección de <Badge variant="secondary">Análisis</Badge> te muestra gráficos y tablas sobre el rendimiento de tus alumnos. Como docente, los datos que verás estarán automáticamente filtrados para mostrar solo los resultados de tu curso en el ciclo lectivo actual.</div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const AyudaDirector = () => (
     <Card>
        <CardHeader>
            <CardTitle>Guía para Directores</CardTitle>
            <CardDescription>Instrucciones para administrar tu escuela y supervisar los resultados.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="usuarios">
                    <AccordionTrigger>¿Cómo habilito a un nuevo docente?</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="text-sm">Cuando un docente se registra en la plataforma y selecciona tu escuela, aparecerá en la sección <Badge variant="secondary">Usuarios</Badge> con estado <Badge>Pendiente</Badge>.</div>
                             <Alert>
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Habilitar un docente</AlertTitle>
                                <AlertDescription>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Ve a la sección de <span className="font-semibold">Usuarios</span>.</li>
                                        <li>Busca al docente pendiente y haz clic en el menú de acciones a la derecha.</li>
                                        <li>Selecciona la opción <span className="font-semibold">Habilitar Docente</span>.</li>
                                        <li>El docente recibirá una notificación y podrá acceder a la plataforma.</li>
                                    </ol>
                                </AlertDescription>
                            </Alert>
                             <div className="text-sm">Recibirás una notificación push en tu dispositivo cada vez que un nuevo docente se registre en tu escuela.</div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="alumnos">
                    <AccordionTrigger>¿Puedo gestionar los alumnos de mi escuela?</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">Sí, en la sección <Badge variant="secondary">Alumnos</Badge>, puedes ver a todos los estudiantes de tu escuela, sin importar el curso. Los docentes solo pueden ver a los alumnos de su propio curso.</div>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="analisis">
                    <AccordionTrigger>¿Cómo analizo los datos de mi escuela?</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">La sección de <Badge variant="secondary">Análisis</Badge> te permite ver el rendimiento general de tu escuela. Puedes utilizar los filtros por <span className="font-semibold">Grado</span> y <span className="font-semibold">Curso</span> para desglosar los datos y obtener una visión más detallada. También puedes filtrar por <span className="font-semibold">Ciclo Lectivo</span> para comparar el rendimiento a lo largo del tiempo.</div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const AyudaAdministrador = () => (
    <Card>
        <CardHeader>
            <CardTitle>Guía para Administradores</CardTitle>
            <CardDescription>Instrucciones para gestionar usuarios y escuelas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="usuarios">
                    <AccordionTrigger>Gestión de Usuarios</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">Puedes habilitar y eliminar cualquier usuario del sistema desde la sección <Badge variant="secondary">Usuarios</Badge>. Este rol está pensado para mantener la base de datos de usuarios, pero no interviene en la creación de contenido pedagógico.</div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="escuelas">
                    <AccordionTrigger>Gestión de Escuelas y Regiones</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">En <Badge variant="secondary">Escuelas</Badge>, puedes crear nuevas regiones y escuelas. También puedes activar o desactivar escuelas. Una escuela inactiva no aparecerá en los formularios de registro para nuevos usuarios.</div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="analisis">
                    <AccordionTrigger>Visualización de Datos</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">Aunque no gestionas exámenes ni resultados, tienes acceso a la sección de <Badge variant="secondary">Análisis</Badge> para poder supervisar los datos a nivel global.</div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);


const AyudaEvaluador = () => (
     <Card>
        <CardHeader>
            <CardTitle>Guía para Evaluadores</CardTitle>
            <CardDescription>Como superusuario, tienes acceso a todas las funcionalidades del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="examenes">
                    <AccordionTrigger>Gestión de Exámenes</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">Puedes crear, editar y eliminar exámenes desde la sección <Badge variant="secondary">Exámenes</Badge>. Es crucial que gestiones el estado de un examen: <Badge>Abierto</Badge> o <Badge variant="destructive">Cerrado</Badge>.</div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="escuelas">
                    <AccordionTrigger>Gestión de Escuelas y Regiones</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">En <Badge variant="secondary">Escuelas</Badge>, puedes crear nuevas regiones y escuelas. También puedes activar o desactivar escuelas. Una escuela inactiva no aparecerá en los formularios de registro.</div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="admin">
                    <AccordionTrigger>Panel de Administración General</AccordionTrigger>
                    <AccordionContent>
                        <div className="text-sm">En <Badge variant="secondary">Admin General</Badge>, puedes configurar parámetros clave del sistema, como la <span className="font-semibold">Nota Mínima de Aprobación</span> y el <span className="font-semibold">Ciclo Lectivo Actual</span>. También tienes acceso a un registro de auditoría de todas las acciones importantes realizadas en la plataforma.</div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const AyudaDefault = () => (
     <Card>
        <CardHeader>
            <CardTitle>Guía de Ayuda</CardTitle>
            <CardDescription>Aquí encontrarás instrucciones sobre cómo utilizar la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Selecciona un tema del menú para ver la ayuda correspondiente. Si tienes dudas, contacta al administrador.</p>
        </CardContent>
    </Card>
);


export default function AyudaPage() {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
    }

    const renderHelpContent = () => {
        switch (user.role) {
            case "Docente":
                return <AyudaDocente />;
            case "Director":
                return <AyudaDirector />;
            case "Evaluador":
                return <AyudaEvaluador />;
            case "Administrador":
                 return <AyudaAdministrador />;
            case "Referente":
                 return <AyudaEvaluador />; // Referente has similar permissions to Evaluador for exams
            default:
                return <AyudaDefault />;
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Centro de Ayuda</h1>
                    <p className="text-muted-foreground">Guías y tutoriales para sacar el máximo provecho a la plataforma.</p>
                </div>
            </div>
            {renderHelpContent()}
        </div>
    );
}

    

    