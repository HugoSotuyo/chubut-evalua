
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useExams } from "@/context/exams-context";
import { useResults } from "@/context/results-context";
import { useSettings } from "@/context/settings-context";
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
    const { settings } = useSettings();
    const { toast } = useToast();

    const [selectedExamId, setSelectedExamId] = useState<string>("");
    const [scores, setScores] = useState<Record<number, number>>({});
    const [displayScores, setDisplayScores] = useState<Record<number, string>>({});
    const [availableExams, setAvailableExams] = useState<Exam[]>([]);
    const [isLoadingExams, setIsLoadingExams] = useState(true);

    useEffect(() => {
        const fetchAndFilterExams = async () => {
            if (!user || !student) return;

            setIsLoadingExams(true);
            let filtered = [];
            if (user?.role === 'Docente') {
                filtered = exams.filter(e => e.status === 'Cerrado' && e.grade === user.grade);
            } else {
                filtered = exams.filter(e => e.status === 'Abierto');
            }

            const studentHasTakenPromises = filtered.map(exam => resultExists(student.id, exam.id));
            const hasTakenResults = await Promise.all(studentHasTakenPromises);
            
            const finalAvailableExams = filtered.filter((_, index) => !hasTakenResults[index]);

            setAvailableExams(finalAvailableExams);
            setIsLoadingExams(false);
        };

        if (isOpen) {
            fetchAndFilterExams();
        }
    }, [user, exams, student, resultExists, isOpen]);

    const selectedExam = useMemo(() => {
        return exams.find(e => e.id === selectedExamId);
    }, [selectedExamId, exams]);
    
    useEffect(() => {
        setScores({});
        setDisplayScores({});
    }, [selectedExamId])

    const totalScore = useMemo(() => {
        if (!selectedExam) return 0;
        return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
    }, [scores, selectedExam]);

    const maxScore = useMemo(() => {
        if (!selectedExam) return 0;
        return selectedExam?.questions.reduce((sum, q) => sum + q.puntaje, 0) ?? 0;
    }, [selectedExam]);

    const handleScoreChange = (questionIndex: number, value: string) => {
        setDisplayScores(prev => ({ ...prev, [questionIndex]: value }));
    
        const sanitizedValue = value.replace(',', '.');
        const maxPuntaje = selectedExam?.questions[questionIndex]?.puntaje ?? 0;
    
        if (sanitizedValue === '' || sanitizedValue === '.') {
            setScores(prev => ({ ...prev, [questionIndex]: 0 }));
            return;
        }
    
        const parsedScore = parseFloat(sanitizedValue);
    
        if (!isNaN(parsedScore) && parsedScore >= 0) {
            if (parsedScore > maxPuntaje) {
                setScores(prev => ({ ...prev, [questionIndex]: maxPuntaje }));
            } else {
                setScores(prev => ({ ...prev, [questionIndex]: parsedScore }));
            }
        }
    };
    
    const handleScoreBlur = (questionIndex: number) => {
        const score = scores[questionIndex] || 0;
        const maxPuntaje = selectedExam?.questions[questionIndex]?.puntaje ?? 0;
        if (score > maxPuntaje) {
            setDisplayScores(prev => ({ ...prev, [questionIndex]: maxPuntaje.toString() }));
            toast({
                variant: "destructive",
                title: "Puntaje Inválido",
                description: `El puntaje no puede ser mayor a ${maxPuntaje}. Se ha establecido el máximo.`,
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam) {
            toast({ variant: "destructive", title: "Error", description: "Por favor, selecciona un examen." });
            return;
        }

        const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        
        await addResult({
            studentId: student.id,
            studentName: student.name,
            examId: selectedExam.id,
            examName: selectedExam.name,
            school: student.school,
            grade: student.grade,
            course: student.course,
            status: percentageScore >= settings.approvalThreshold ? "Aprobado" : "Desaprobado",
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
                                <Select onValueChange={setSelectedExamId} value={selectedExamId} required disabled={isLoadingExams}>
                                    <SelectTrigger id="examen">
                                        <SelectValue placeholder={isLoadingExams ? "Cargando exámenes..." : "Elige una evaluación"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!isLoadingExams && availableExams.length > 0 ? availableExams.map(exam => (
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
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="-"
                                                        value={displayScores[index] ?? ""}
                                                        onChange={(e) => handleScoreChange(index, e.target.value)}
                                                        onBlur={() => handleScoreBlur(index)}
                                                        className="text-center"
                                                        step={settings.scoreStep}
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
                                Puntaje Total: {totalScore.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {maxScore.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
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
