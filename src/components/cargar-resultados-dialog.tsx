
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getExamsSync } from "@/data/exams";
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
    const { toast } = useToast();
    const [exams, setExams] = useState<Exam[]>([]);

    const [selectedExamId, setSelectedExamId] = useState<string>("");
    const [scores, setScores] = useState<Record<number, number>>({});

    useEffect(() => {
        const fetchExams = async () => {
            const allExams = getExamsSync();
            if (user?.role === 'Docente') {
                setExams(allExams.filter(e => e.status === 'Cerrado' && e.grade === user.grade));
            } else {
                 setExams(allExams.filter(e => e.status === 'Abierto'));
            }
        };
        fetchExams();
    }, [user]);

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

        toast({
            title: "Funcionalidad en Desarrollo",
            description: `El guardado de resultados estará disponible próximamente.`
        });

        onOpenChange(false); // Close dialog on success
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
                                <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                                    <SelectTrigger id="examen">
                                        <SelectValue placeholder="Elige una evaluación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exams.map(exam => {
                                            // Logic for isLoaded would need a new data source
                                            const isLoaded = false; // Placeholder
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
                            <Button type="submit">
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
