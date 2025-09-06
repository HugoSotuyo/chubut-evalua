
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useExams } from "@/context/exams-context";
import { useStudents } from "@/context/students-context";
import { useResults } from "@/context/results-context";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CargarResultadosForm({ params }: { params: { studentId: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const { exams } = useExams();
    const { students } = useStudents();
    const { addResult, resultExists } = useResults();
    const { toast } = useToast();
    const { studentId } = params;

    const [selectedExamId, setSelectedExamId] = useState<string>("");
    const [scores, setScores] = useState<Record<number, number>>({});

    const student = useMemo(() => {
        return students.find(s => s.id === studentId);
    }, [students, studentId]);

    const availableExams = useMemo(() => {
        // Teachers can only see closed exams for their specific grade.
        if (user?.role === 'Docente') {
            return exams.filter(e => e.status === 'Cerrado' && e.grade === user.grade);
        }
        // Other roles (like evaluator) can see all open exams.
        return exams.filter(e => e.status === 'Abierto');
    }, [exams, user]);

    const selectedExam = useMemo(() => {
        return exams.find(e => e.id === selectedExamId);
    }, [selectedExamId, exams]);
    
    const totalScore = useMemo(() => {
        if (!selectedExam) return 0;
        return selectedExam.questions.reduce((sum, _, index) => sum + (scores[index] || 0), 0);
    }, [scores, selectedExam]);
    
    const maxScore = useMemo(() => {
        if (!selectedExam) return 0;
        return selectedExam?.questions.reduce((sum, q) => sum + q.puntaje, 0) ?? 0;
    }, [selectedExam]);


    if (!user || !student) {
        return <div>Cargando o alumno no encontrado...</div>;
    }

    const handleScoreChange = (questionIndex: number, value: string) => {
        const score = Number(value);
        const maxPuntaje = selectedExam?.questions[questionIndex]?.puntaje ?? 0;
        
        if (!isNaN(score) && score >= 0 && score <= maxPuntaje) {
            setScores(prev => ({ ...prev, [questionIndex]: score }));
        } else if (value === "") {
             setScores(prev => ({ ...prev, [questionIndex]: 0 }));
        } else {
             toast({
                variant: "destructive",
                title: "Puntaje Inválido",
                description: `El puntaje debe ser un número entre 0 y ${maxPuntaje}.`
            })
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) {
            toast({ variant: "destructive", title: "Error", description: "Por favor, selecciona un examen."});
            return;
        }

        if (resultExists(student.id, selectedExam.id)) {
            toast({ variant: "destructive", title: "Error", description: "Este alumno ya tiene un resultado cargado para este examen."});
            return;
        }

        const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        
        addResult({
            studentId: student.id,
            studentName: student.name,
            examId: selectedExam.id,
            examName: selectedExam.name,
            school: student.school,
            grade: student.grade,
            course: student.course,
            score: scorePercentage,
            status: scorePercentage >= 60 ? "Aprobado" : "Desaprobado", // Asumiendo 60 como nota de corte
            scores,
            totalScore,
            maxScore
        });

        toast({
            title: "Resultados Guardados",
            description: `Se han guardado las notas de ${student.name} para el examen ${selectedExam.name}.`
        })
        
        router.push("/dashboard/alumnos");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        Cargar Resultados de Examen
                    </h1>
                    <p className="text-muted-foreground">
                        Calificando a <span className="font-semibold">{student.name}</span> ({student.dni})
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
                    <CardTitle>Selección y Carga de Examen</CardTitle>
                    <CardDescription>Elige el examen a calificar y completa los puntajes obtenidos por el alumno.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="examen">Seleccionar Examen</Label>
                             <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                                <SelectTrigger id="examen">
                                    <SelectValue placeholder="Elige una evaluación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableExams.map(exam => {
                                        const isLoaded = resultExists(student.id, exam.id);
                                        return (
                                            <SelectItem key={exam.id} value={exam.id} disabled={isLoaded}>
                                                {exam.name} {isLoaded && "(Cargado)"}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedExam && (
                        <div>
                            <h3 className="text-lg font-medium mb-4">Preguntas de: {selectedExam.name}</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">Consigna</TableHead>
                                        <TableHead>Respuesta Correcta</TableHead>
                                        <TableHead className="text-center">Puntaje Máx.</TableHead>
                                        <TableHead className="w-[120px]">Puntaje Obtenido</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedExam.questions.map((q, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{q.consigna}</TableCell>
                                            <TableCell>{q.respuesta}</TableCell>
                                            <TableCell className="text-center">{q.puntaje}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    placeholder="-"
                                                    value={scores[index] ?? ""}
                                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                                    className="text-center"
                                                    max={q.puntaje}
                                                    min={0}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                {selectedExam && (
                    <CardFooter className="flex justify-end">
                        <div className="text-2xl font-bold">
                            Puntaje Total: {totalScore} / {maxScore}
                        </div>
                    </CardFooter>
                )}
            </Card>
        </form>
    );
}
