"use client"

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Download,
  BarChart2,
  ArrowUpDown,
  BookOpen,
  Award,
  Users,
  Percent,
} from "lucide-react";
import type { Exam, Result, Question } from "@/lib/types";

interface ViewExamDialogProps {
  exam: Exam | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  results: Result[];
}

export type QuestionStat = {
  index: number;
  questionNumber: number;
  consigna: string;
  respuesta: string;
  puntaje: number;
  allowedScores?: number[];
  totalScoreObtained: number;
  totalPossibleScore: number;
  avgScore: number;
  rendimiento: number;
  evaluatedStudentsCount: number;
  difficulty: "alta" | "media" | "baja" | "sin_datos";
};

export function ViewExamDialog({ exam, isOpen, onOpenChange, results }: ViewExamDialogProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"index" | "difficulty-desc" | "difficulty-asc">("index");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "alta" | "media" | "baja">("all");

  const questionsStats = useMemo<QuestionStat[]>(() => {
    if (!exam || !exam.questions) return [];

    return exam.questions.map((q, index) => {
      const maxScore = q.puntaje || 0;
      let totalObtained = 0;
      let evaluatedStudentsCount = 0;

      results.forEach((r) => {
        const score = r.scores ? (r.scores[index] ?? (r.scores as any)?.[String(index)]) : undefined;
        if (typeof score === "number" && !isNaN(score)) {
          totalObtained += score;
          evaluatedStudentsCount += 1;
        }
      });

      const totalPossibleScore = maxScore * evaluatedStudentsCount;
      const rendimiento = totalPossibleScore > 0 ? (totalObtained / totalPossibleScore) * 100 : 0;
      const avgScore = evaluatedStudentsCount > 0 ? totalObtained / evaluatedStudentsCount : 0;

      let difficulty: "alta" | "media" | "baja" | "sin_datos" = "sin_datos";
      if (evaluatedStudentsCount > 0) {
        if (rendimiento < 50) {
          difficulty = "alta";
        } else if (rendimiento < 75) {
          difficulty = "media";
        } else {
          difficulty = "baja";
        }
      }

      return {
        index,
        questionNumber: index + 1,
        consigna: q.consigna,
        respuesta: q.respuesta,
        puntaje: maxScore,
        allowedScores: q.allowedScores,
        totalScoreObtained: totalObtained,
        totalPossibleScore,
        avgScore,
        rendimiento,
        evaluatedStudentsCount,
        difficulty,
      };
    });
  }, [exam, results]);

  const sortedAndFilteredQuestions = useMemo(() => {
    let list = [...questionsStats];

    if (difficultyFilter !== "all") {
      list = list.filter((q) => q.difficulty === difficultyFilter);
    }

    if (sortBy === "difficulty-desc") {
      // Mayor dificultad primero: menor rendimiento primero
      list.sort((a, b) => a.rendimiento - b.rendimiento);
    } else if (sortBy === "difficulty-asc") {
      // Menor dificultad primero: mayor rendimiento primero
      list.sort((a, b) => b.rendimiento - a.rendimiento);
    } else {
      // Orden original
      list.sort((a, b) => a.index - b.index);
    }

    return list;
  }, [questionsStats, sortBy, difficultyFilter]);

  const examSummary = useMemo(() => {
    if (!exam) return null;
    const totalStudents = results.length;
    const totalMaxExamScore = exam.questions.reduce((sum, q) => sum + (q.puntaje || 0), 0);
    const totalScoreObtained = results.reduce((sum, r) => sum + (r.totalScore || 0), 0);
    const avgScore = totalStudents > 0 ? totalScoreObtained / totalStudents : 0;
    const avgScorePercent = totalMaxExamScore > 0 && totalStudents > 0 
      ? (totalScoreObtained / (totalMaxExamScore * totalStudents)) * 100 
      : 0;

    const evaluatedQuestions = questionsStats.filter((q) => q.evaluatedStudentsCount > 0);
    
    // Pregunta con mayor dificultad (menor rendimiento)
    const worstQuestion = evaluatedQuestions.length > 0
      ? [...evaluatedQuestions].sort((a, b) => a.rendimiento - b.rendimiento)[0]
      : null;

    // Pregunta con mayor dominio (mayor rendimiento)
    const bestQuestion = evaluatedQuestions.length > 0
      ? [...evaluatedQuestions].sort((a, b) => b.rendimiento - a.rendimiento)[0]
      : null;

    const highDifficultyCount = evaluatedQuestions.filter((q) => q.difficulty === "alta").length;
    const mediumDifficultyCount = evaluatedQuestions.filter((q) => q.difficulty === "media").length;
    const lowDifficultyCount = evaluatedQuestions.filter((q) => q.difficulty === "baja").length;

    return {
      totalStudents,
      totalMaxExamScore,
      avgScore,
      avgScorePercent,
      worstQuestion,
      bestQuestion,
      highDifficultyCount,
      mediumDifficultyCount,
      lowDifficultyCount,
    };
  }, [exam, results, questionsStats]);

  const handleDownloadFile = () => {
    if (!exam?.fileDataUrl || !exam?.fileName) return;
    const link = document.createElement("a");
    link.href = exam.fileDataUrl;
    link.download = exam.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoToAnalysis = () => {
    if (!exam) return;
    onOpenChange(false);
    router.push(`/dashboard/analisis?exam=${encodeURIComponent(exam.name)}`);
  };

  if (!exam) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header fijo */}
        <div className="p-6 border-b bg-muted/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-semibold">
                  {exam.tema}
                </Badge>
                <Badge variant="secondary">{exam.grade}</Badge>
                <Badge variant={exam.status === "Cerrado" ? "default" : "destructive"}>
                  {exam.status}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight mt-1">
                {exam.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Creado el {format(parseISO(exam.created), "dd 'de' MMMM 'de' yyyy", { locale: es })} • {exam.questions.length} preguntas en total
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {exam.fileDataUrl && (
                <Button size="sm" variant="outline" onClick={handleDownloadFile} title="Descargar examen original">
                  <Download className="mr-1.5 h-4 w-4" />
                  Descargar Archivo
                </Button>
              )}
              <Button size="sm" onClick={handleGoToAnalysis} title="Ver gráficos y comparativas completas">
                <BarChart2 className="mr-1.5 h-4 w-4" />
                Ver Análisis
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Panel Resumen de Dificultad */}
          {examSummary && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="bg-card/50">
                  <CardContent className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Alumnos Evaluados</span>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xl font-bold">{examSummary.totalStudents}</div>
                    <p className="text-[11px] text-muted-foreground">
                      {examSummary.totalStudents > 0 ? "En tu alcance asignado" : "Sin evaluaciones aún"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardContent className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Rendimiento Promedio</span>
                      <Percent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xl font-bold">
                      {examSummary.totalStudents > 0 ? `${examSummary.avgScorePercent.toFixed(1)}%` : "-"}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {examSummary.totalStudents > 0 
                        ? `${examSummary.avgScore.toFixed(1)} de ${examSummary.totalMaxExamScore} pts` 
                        : "Puntaje máximo: " + examSummary.totalMaxExamScore}
                    </p>
                  </CardContent>
                </Card>

                <Card className={examSummary.worstQuestion && examSummary.worstQuestion.difficulty === "alta" ? "border-destructive/40 bg-destructive/5" : "bg-card/50"}>
                  <CardContent className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Mayor Dificultad</span>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    {examSummary.worstQuestion ? (
                      <>
                        <div className="text-base font-bold text-destructive">
                          Pregunta N° {examSummary.worstQuestion.questionNumber}
                        </div>
                        <p className="text-[11px] font-semibold text-destructive/90">
                          {examSummary.worstQuestion.rendimiento.toFixed(1)}% de rendimiento
                        </p>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground pt-1">Sin datos</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/50">
                  <CardContent className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-medium">Mayor Dominio</span>
                      <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {examSummary.bestQuestion ? (
                      <>
                        <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          Pregunta N° {examSummary.bestQuestion.questionNumber}
                        </div>
                        <p className="text-[11px] font-semibold text-emerald-600/90 dark:text-emerald-400">
                          {examSummary.bestQuestion.rendimiento.toFixed(1)}% de rendimiento
                        </p>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground pt-1">Sin datos</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Alerta destacada sobre preguntas que ocasionaron mayor dificultad */}
              {examSummary.worstQuestion && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Preguntas con mayor dificultad identificadas:
                    </span>
                    <p className="text-amber-800 dark:text-amber-300">
                      Se detectaron <strong>{examSummary.highDifficultyCount} pregunta(s) con dificultad alta</strong> (&lt;50% de rendimiento) y <strong>{examSummary.mediumDifficultyCount} con dificultad media</strong> (50-75%). Revisa las consignas a continuación para evaluar contenidos a reforzar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Barra de Controles y Filtros de Preguntas */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-base">Preguntas del Examen</h3>
              <Badge variant="secondary" className="text-xs">
                {sortedAndFilteredQuestions.length} de {exam.questions.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Botón de Orden */}
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
                <span className="text-muted-foreground px-1.5 flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Ordenar:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy("index")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    sortBy === "index" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  N° Pregunta
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("difficulty-desc")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    sortBy === "difficulty-desc" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Muestra primero las preguntas con menor porcentaje de rendimiento"
                >
                  Mayor Dificultad
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("difficulty-asc")}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    sortBy === "difficulty-asc" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Muestra primero las preguntas con mayor rendimiento"
                >
                  Menor Dificultad
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Preguntas con Análisis de Dificultad */}
          <div className="space-y-4">
            {sortedAndFilteredQuestions.map((q) => {
              const hasResults = q.evaluatedStudentsCount > 0;
              const isWorst = examSummary?.worstQuestion?.index === q.index;

              return (
                <Card
                  key={q.index}
                  className={`transition-shadow hover:shadow-md ${
                    isWorst
                      ? "border-destructive/60 bg-destructive/5 ring-1 ring-destructive/30"
                      : q.difficulty === "alta"
                      ? "border-destructive/30 bg-card"
                      : "bg-card"
                  }`}
                >
                  <CardHeader className="p-4 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Pregunta {q.questionNumber}
                        </span>

                        {isWorst && (
                          <Badge variant="destructive" className="animate-pulse gap-1 text-[11px]">
                            <AlertTriangle className="h-3 w-3" /> Mayor Dificultad del Examen
                          </Badge>
                        )}

                        {hasResults ? (
                          q.difficulty === "alta" ? (
                            <Badge variant="destructive" className="text-[11px]">
                              🔴 Dificultad Alta (&lt;50%)
                            </Badge>
                          ) : q.difficulty === "media" ? (
                            <Badge variant="outline" className="text-[11px] border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/10">
                              🟡 Dificultad Media (50-75%)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[11px] border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10">
                              🟢 Buen Dominio (&gt;75%)
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-muted-foreground">
                            Sin evaluaciones cargadas
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span>Puntaje Máx: <strong className="text-foreground">{q.puntaje} pts</strong></span>
                        {q.allowedScores && q.allowedScores.length > 0 && (
                          <span className="hidden sm:inline">
                            Escalas: [{q.allowedScores.join(", ")}]
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Consigna */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Consigna:
                      </span>
                      <div className="bg-muted/40 p-3 rounded-md text-sm text-foreground whitespace-pre-wrap leading-relaxed border">
                        {q.consigna}
                      </div>
                    </div>

                    {/* Respuesta esperada */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Respuesta esperada / Criterio:
                      </span>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 p-2.5 rounded-md text-xs font-medium">
                        {q.respuesta}
                      </div>
                    </div>

                    {/* Barra de progreso de dificultad y acierto */}
                    {hasResults && (
                      <div className="space-y-1.5 pt-2 border-t mt-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                            Rendimiento en esta pregunta:
                            <strong className={`font-bold ${
                              q.difficulty === "alta" 
                                ? "text-destructive" 
                                : q.difficulty === "media" 
                                ? "text-amber-600 dark:text-amber-400" 
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}>
                              {q.rendimiento.toFixed(1)}%
                            </strong>
                          </span>
                          <span className="text-muted-foreground">
                            Promedio obtenido: <strong>{q.avgScore.toFixed(2)}</strong> / {q.puntaje} pts ({q.evaluatedStudentsCount} alumno{q.evaluatedStudentsCount !== 1 ? 's' : ''})
                          </span>
                        </div>

                        <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${
                              q.difficulty === "alta"
                                ? "bg-destructive"
                                : q.difficulty === "media"
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${Math.min(Math.max(q.rendimiento, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {results.length > 0 
              ? `Estadísticas calculadas en base a ${results.length} resultado(s) registrado(s).` 
              : "No se han cargado notas para este examen todavía."}
          </div>
          <DialogClose asChild>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

