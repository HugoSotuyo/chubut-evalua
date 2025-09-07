
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useExams } from "@/context/exams-context";
import { useResults } from "@/context/results-context";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Student, Exam } from "@/lib/types";

interface CargarResultadosDialogProps {
    student: Student;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function CargarResultadosDialog({ student, isOpen, onOpenChange }: CargarResultadosDialogProps) {
    const { user } = useAuth();
    const { exams } = useExams();
    const { addResult, resultExists } = useResults();
    const { toast } = useToast();

    const [selectedExamId, setSelectedExamId] = useState<string>("");
    const [scores, setScores] = useState<Record<number, number>>({});

    const availableExams = useMemo(() => {
        if (!user) return [];
        let filtered = [];
         if (user?.role === 'Docente') {
            filtered = exams.filter(e => e.status === 'Cerrado' && e.grade === user.grade);
        } else {
             filtered = exams.filter(e => e.status === 'Abierto');
        }
        // Filter out exams the student has already taken
        return filtered.filter(exam => !resultExists(student.id, exam.id));
    }, [user, exams, student, resultExists]);

    const selectedExam = useMemo(() => {
        return exams.find(e => e.id === selectedExamId);
    }, [selectedExamId, exams]);
    
    // Reset scores when exam changes
    useEffect(() => {
        setScores({});
    }, [selectedExamId])

    const totalScore = useMemo(() => {
        if (!selectedExam) return 0;
        return selectedExam.questions.reduce((sum, _, index) => sum + (scores[index] || 0), 0);
    }, [scores, selectedExam]);

    const maxScore = useMemo(() => {
        if (!selectedExam) return 0;
        return selectedExam?.questions.reduce((sum, q) => sum + q.puntaje, 0) ?? 0;
    }, [selectedExam]);

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
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) {
            toast({ variant: "destructive", title: "Error", description: "Por favor, selecciona un examen." });
            return;
        }

        const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const approvalThreshold = 60; // As defined in admin page

        addResult({
            studentId: student.id,
            studentName: student.name,
            examId: selectedExam.id,
            examName: selectedExam.name,
            school: student.school,
            grade: student.grade,
            course: student.course,
            status: percentageScore >= approvalThreshold ? "Aprobado" : "Desaprobado",
            score: percentageScore,
            scores: scores,
            totalScore: totalScore,
            maxScore: maxScore
        });

        toast({
            title: "Resultados Guardados",
            description: `La calificación de ${student.name} para "${selectedExam.name}" ha sido guardada.`,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Cargar Resultados de Examen</DialogTitle>
                        <DialogDescription>
                            Calificando a <span className="font-semibold">{student.name}</span> ({student.dni})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4 max-h-[65vh] overflow-y-auto pr-2">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="examen">Seleccionar Examen</Label>
                                <Select onValueChange={setSelectedExamId} value={selectedExamId} required>
                                    <SelectTrigger id="examen">
                                        <SelectValue placeholder="Elige una evaluación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableExams.length > 0 ? availableExams.map(exam => (
                                            <SelectItem key={exam.id} value={exam.id}>
                                                {exam.name}
                                            </SelectItem>
                                        )) : <SelectItem value="none" disabled>No hay exámenes disponibles para cargar</SelectItem>}
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
                                                        required
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 flex-col sm:flex-row sm:justify-between items-center">
                        {selectedExam && (
                             <div className="text-2xl font-bold">
                                Puntaje Total: {totalScore} / {maxScore}
                            </div>
                        )}
                        <div className="flex gap-2">
                             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={!selectedExamId}>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Resultados
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
