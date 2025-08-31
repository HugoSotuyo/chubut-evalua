
"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Mock data - in a real app, you'd fetch this
const allStudents = [
    { id: "alu-001", name: "Juan Pérez", dni: "45.123.456", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-002", name: "María García", dni: "46.789.012", grade: "5to Grado", course: "A", school: "Escuela N° 101" },
    { id: "alu-003", name: "Pedro Rodríguez", dni: "44.555.666", grade: "4to Grado", course: "B", school: "Escuela N° 789" },
    { id: "alu-004", name: "Ana Martínez", dni: "45.987.654", grade: "6to Grado", course: "C", school: "Escuela N° 101" },
];


export default function CargarResultadosPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const studentId = params.studentId as string;

    // Find the student from mock data
    const student = allStudents.find(s => s.id === studentId);

    if (!user || !student) {
        return <div>Cargando o alumno no encontrado...</div>;
    }

    // Placeholder for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic to save the exam results will go here in the next step
        console.log("Formulario enviado");
        router.push("/dashboard/resultados");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Cargar Resultados de Examen
                    </h1>
                    <p className="text-muted-foreground">
                        Carga las notas para el alumno <span className="font-semibold">{student.name}</span>.
                    </p>
                </div>
                 <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Resultados
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Formulario de Carga</CardTitle>
                    <CardDescription>Este es el esqueleto del formulario. Lo completaremos en el siguiente paso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Aquí irá el listado de preguntas del examen seleccionado.</p>
                </CardContent>
            </Card>
        </form>
    );
}
