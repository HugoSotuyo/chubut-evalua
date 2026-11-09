"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  Settings,
  SlidersHorizontal,
  History,
  CalendarPlus,
  Users,
  School as SchoolIcon,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Info,
  Calendar,
  Trash2,
  AlertTriangle,
  Eraser,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/context/audit-log-context";
import { useSettings } from "@/context/settings-context";
import { useUsers } from "@/context/users-context";
import { useSchools } from "@/context/schools-context";
import { useExams } from "@/context/exams-context";
import { useStudents } from "@/context/students-context";
import { useResults } from "@/context/results-context";
import { cloneUsersToNewSchoolYear, deleteUsersByRoleAndYear } from "@/lib/userService";
import { deleteStudentsByYear } from "@/lib/studentsService";
import { deleteResultsByYear } from "@/lib/resultsService";
import { deleteExamsByYear } from "@/lib/examsService";
import { clearAllSchools, clearAllRegions } from "@/lib/schoolsService";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";
import type { SystemSettings, UserRole } from "@/lib/types";

type PurgeType = 
  | "docentes"
  | "directores"
  | "referentes"
  | "administradores"
  | "evaluadores"
  | "todos_usuarios"
  | "alumnos"
  | "examenes"
  | "resultados"
  | "escuelas"
  | "regiones";

export default function AdminPage() {
  const { user } = useAuth();
  const { auditLogs, addAuditLog, loading: auditLoading } = useAuditLogs();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { users, refreshUsers, loading: usersLoading } = useUsers();
  const { schools, regions, refreshSchools, loading: schoolsLoading } = useSchools();
  const { exams, refreshExams, loading: examsLoading } = useExams();
  const { students, refreshStudents, loading: studentsLoading } = useStudents();
  const { results, refreshResults, loading: resultsLoading } = useResults();
  const { toast } = useToast();

  const [approvalThreshold, setApprovalThreshold] = useState(settings.approvalThreshold);
  const [schoolYear, setSchoolYear] = useState(settings.currentSchoolYear);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialogo de creacion de nuevo ciclo lectivo
  const [isCreateYearDialogOpen, setIsCreateYearDialogOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [setAsActiveImmediately, setSetAsActiveImmediately] = useState(true);
  const [isCreatingYear, setIsCreatingYear] = useState(false);

  // Seccion de Depuracion / Vaciado de Registros por Tipo
  const [purgeSchoolYear, setPurgeSchoolYear] = useState(settings.currentSchoolYear || "2024");
  const [purgeType, setPurgeType] = useState<PurgeType>("docentes");
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    if (!settingsLoading) {
      setApprovalThreshold(settings.approvalThreshold);
      setSchoolYear(settings.currentSchoolYear);
      if (!purgeSchoolYear) {
        setPurgeSchoolYear(settings.currentSchoolYear);
      }
    }
  }, [settings, settingsLoading, purgeSchoolYear]);

  // Lista dinamica de todos los ciclos lectivos disponibles
  const availableSchoolYears = useMemo(() => {
    const configured = settings.schoolYears || ["2024", "2025", "2026"];
    const current = settings.currentSchoolYear ? [settings.currentSchoolYear] : [];
    const fromUsers = users.map(u => u.schoolYear).filter(Boolean);
    return [...new Set([...configured, ...current, ...fromUsers])].sort((a, b) => b.localeCompare(a));
  }, [settings.schoolYears, settings.currentSchoolYear, users]);

  // Metricas de estructura educativa actual a preservar
  const structureCounts = useMemo(() => {
    const activeUsers = users.filter(u => u.status === "Activo");
    const uniqueEmails = new Set(activeUsers.map(u => u.email.toLowerCase().trim())).size;
    const activeSchools = schools.filter(s => s.status === "Activa").length;
    const totalRegions = regions.length;

    return {
      activeUsersCount: uniqueEmails,
      activeSchoolsCount: activeSchools,
      regionsCount: totalRegions,
    };
  }, [users, schools, regions]);

  // Calculo en tiempo real de registros afectados por la depuracion seleccionada
  const purgeCount = useMemo(() => {
    switch (purgeType) {
      case "docentes":
        return users.filter(u => u.role === "Docente" && (u.schoolYear || '') === purgeSchoolYear).length;
      case "directores":
        return users.filter(u => u.role === "Director" && (u.schoolYear || '') === purgeSchoolYear).length;
      case "referentes":
        return users.filter(u => u.role === "Referente" && (u.schoolYear || '') === purgeSchoolYear).length;
      case "administradores":
        return users.filter(u => u.role === "Administrador" && (u.schoolYear || '') === purgeSchoolYear).length;
      case "evaluadores":
        // Excluir al usuario actualmente logueado para nunca autoeliminarse
        return users.filter(u => u.role === "Evaluador" && (u.schoolYear || '') === purgeSchoolYear && u.id !== user?.id).length;
      case "todos_usuarios":
        // Excluir al usuario actualmente logueado
        return users.filter(u => (u.schoolYear || '') === purgeSchoolYear && u.id !== user?.id).length;
      case "alumnos":
        return students.filter(s => (s.schoolYear || '') === purgeSchoolYear).length;
      case "examenes": {
        const getExamYear = (e: any) => e.schoolYear || e.created?.slice(0, 4) || "2024";
        return exams.filter(e => getExamYear(e) === purgeSchoolYear).length;
      }
      case "resultados":
        return results.filter(r => (r.schoolYear || '') === purgeSchoolYear).length;
      case "escuelas":
        return schools.length;
      case "regiones":
        return regions.length;
      default:
        return 0;
    }
  }, [purgeType, purgeSchoolYear, users, students, exams, results, schools, regions, user?.id]);

  const purgeTypeLabels: Record<PurgeType, { title: string; subtitle: string; isGlobal?: boolean }> = {
    docentes: { title: "Docentes", subtitle: `Elimina todos los docentes registrados para el ciclo ${purgeSchoolYear}.` },
    directores: { title: "Directores", subtitle: `Elimina todos los directores registrados para el ciclo ${purgeSchoolYear}.` },
    referentes: { title: "Referentes", subtitle: `Elimina todos los referentes registrados para el ciclo ${purgeSchoolYear}.` },
    administradores: { title: "Administradores", subtitle: `Elimina administradores asignados al ciclo ${purgeSchoolYear}.` },
    evaluadores: { title: "Evaluadores auxiliares", subtitle: `Elimina evaluadores del ciclo ${purgeSchoolYear} (tu cuenta activa queda protegida).` },
    todos_usuarios: { title: "Todos los Usuarios del ciclo", subtitle: `Elimina todos los usuarios del ciclo ${purgeSchoolYear} excepto tu cuenta activa de Evaluador General.` },
    alumnos: { title: "Alumnos y sus Resultados", subtitle: `Elimina todos los estudiantes matriculados y sus notas en el ciclo ${purgeSchoolYear}.` },
    examenes: { title: "Exámenes del ciclo", subtitle: `Elimina los exámenes creados para el ciclo ${purgeSchoolYear} y sus notas vinculadas.` },
    resultados: { title: "Resultados / Calificaciones", subtitle: `Vacía las notas cargadas a los alumnos en el ciclo ${purgeSchoolYear}, conservando los alumnos y exámenes.` },
    escuelas: { title: "Todas las Escuelas", subtitle: "Vacía todas las escuelas registradas en la base de datos institucional.", isGlobal: true },
    regiones: { title: "Todas las Regiones", subtitle: "Vacía todas las regiones registradas en la base de datos institucional.", isGlobal: true },
  };

  const handleOpenCreateYearDialog = () => {
    // Sugerir el proximo anio correlativo
    const numericYears = availableSchoolYears.map(y => parseInt(y, 10)).filter(n => !isNaN(n));
    const nextYear = numericYears.length > 0 ? Math.max(...numericYears) + 1 : new Date().getFullYear() + 1;
    setNewYearInput(String(nextYear));
    setSetAsActiveImmediately(true);
    setIsCreateYearDialogOpen(true);
  };

  const handleConfirmCreateSchoolYear = async () => {
    const trimmedYear = newYearInput.trim();
    if (!trimmedYear) {
      toast({
        title: "Año requerido",
        description: "Por favor ingresa un año para el ciclo lectivo.",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4}$/.test(trimmedYear)) {
      toast({
        title: "Año inválido",
        description: "El ciclo lectivo debe ser un año válido de 4 dígitos (ej: 2026).",
        variant: "destructive",
      });
      return;
    }

    if (availableSchoolYears.includes(trimmedYear)) {
      toast({
        title: "Ciclo lectivo ya existente",
        description: `El ciclo lectivo ${trimmedYear} ya se encuentra registrado en el sistema.`,
        variant: "destructive",
      });
      return;
    }

    setIsCreatingYear(true);
    try {
      // 1. Traspasar y preservar los usuarios activos para el nuevo ciclo lectivo
      const { clonedCount } = await cloneUsersToNewSchoolYear(trimmedYear);

      // 2. Actualizar la configuracion del sistema con la nueva lista de ciclos
      const updatedSchoolYears = [...new Set([...(settings.schoolYears || []), trimmedYear])];
      const newSettings: Partial<SystemSettings> = {
        schoolYears: updatedSchoolYears,
      };

      if (setAsActiveImmediately) {
        newSettings.currentSchoolYear = trimmedYear;
        setSchoolYear(trimmedYear);
      }

      await updateSettings(newSettings);

      // 3. Refrescar usuarios en el contexto global
      await refreshUsers();

      // 4. Registrar la accion en la auditoria
      await addAuditLog({
        action: "CREAR_CICLO_LECTIVO",
        details: `Se creó el nuevo ciclo lectivo ${trimmedYear}. Se transfirieron y preservaron ${clonedCount} usuarios activos conservando la estructura educativa (roles, escuelas, regiones, cursos y grados). Sin exámenes ni alumnos cargados.`,
      });

      toast({
        title: "Nuevo Ciclo Lectivo Creado",
        description: `El ciclo lectivo ${trimmedYear} ha sido configurado con éxito. Se preservaron ${clonedCount} usuarios activos y toda la estructura educativa. Inicia limpio, sin exámenes ni alumnos.`,
      });

      setIsCreateYearDialogOpen(false);
    } catch (error) {
      console.error("Error al crear nuevo ciclo lectivo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el ciclo lectivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsCreatingYear(false);
    }
  };

  const handleExecutePurge = async () => {
    setIsPurging(true);
    try {
      let deletedCount = 0;
      let actionDetails = "";

      switch (purgeType) {
        case "docentes": {
          const res = await deleteUsersByRoleAndYear("Docente", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} docentes del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshUsers();
          break;
        }
        case "directores": {
          const res = await deleteUsersByRoleAndYear("Director", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} directores del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshUsers();
          break;
        }
        case "referentes": {
          const res = await deleteUsersByRoleAndYear("Referente", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} referentes del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshUsers();
          break;
        }
        case "administradores": {
          const res = await deleteUsersByRoleAndYear("Administrador", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} administradores del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshUsers();
          break;
        }
        case "evaluadores": {
          const res = await deleteUsersByRoleAndYear("Evaluador", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} evaluadores del ciclo lectivo ${purgeSchoolYear} (cuenta activa protegida).`;
          await refreshUsers();
          break;
        }
        case "todos_usuarios": {
          const res = await deleteUsersByRoleAndYear("all", purgeSchoolYear, user?.id);
          deletedCount = res.deletedCount;
          actionDetails = `Se eliminaron ${deletedCount} usuarios del ciclo lectivo ${purgeSchoolYear} (cuenta activa protegida).`;
          await refreshUsers();
          break;
        }
        case "alumnos": {
          const res = await deleteStudentsByYear(purgeSchoolYear);
          deletedCount = res.deletedCount;
          actionDetails = `Se vaciaron ${deletedCount} alumnos y sus calificaciones del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshStudents();
          await refreshResults();
          break;
        }
        case "examenes": {
          const res = await deleteExamsByYear(purgeSchoolYear);
          deletedCount = res.deletedCount;
          actionDetails = `Se vaciaron ${deletedCount} exámenes del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshExams();
          await refreshResults();
          break;
        }
        case "resultados": {
          const res = await deleteResultsByYear(purgeSchoolYear);
          deletedCount = res.deletedCount;
          actionDetails = `Se vaciaron ${deletedCount} calificaciones del ciclo lectivo ${purgeSchoolYear}.`;
          await refreshResults();
          break;
        }
        case "escuelas": {
          const res = await clearAllSchools();
          deletedCount = res.deletedCount;
          actionDetails = `Se vaciaron ${deletedCount} escuelas de la base de datos institucional.`;
          await refreshSchools();
          break;
        }
        case "regiones": {
          const res = await clearAllRegions();
          deletedCount = res.deletedCount;
          actionDetails = `Se vaciaron ${deletedCount} regiones de la base de datos institucional.`;
          await refreshSchools();
          break;
        }
      }

      await addAuditLog({
        action: "DEPURAR_DATOS",
        details: actionDetails,
      });

      toast({
        title: "Registros Vaciados Correctamente",
        description: actionDetails,
      });

      setIsConfirmPurgeOpen(false);
    } catch (error) {
      console.error("Error al vaciar registros:", error);
      toast({
        variant: "destructive",
        title: "Error en la limpieza",
        description: "No se pudieron vaciar los registros seleccionados. Intenta nuevamente.",
      });
    } finally {
      setIsPurging(false);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const newSettings = { 
        approvalThreshold: Number(approvalThreshold),
        currentSchoolYear: schoolYear,
      };
      await updateSettings(newSettings);
      
      const details = [
        `Nota mínima de aprobación a ${approvalThreshold}%`,
        `Ciclo lectivo a ${schoolYear}`
      ].join('. ');

      await addAuditLog({
        action: "ACTUALIZAR_PARAMETROS",
        details: `Se actualizaron los parámetros: ${details}.`
      });
      toast({
        title: "Parámetros Actualizados",
        description: "Los cambios se han guardado correctamente.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (auditLoading || settingsLoading || usersLoading || schoolsLoading || examsLoading || studentsLoading || resultsLoading || !user) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Administración General</h1>
          <p className="text-muted-foreground">Panel de control del Evaluador General para tareas administrativas, gestión de ciclos y depuración del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreateYearDialog} variant="outline" className="gap-2">
            <CalendarPlus className="h-4 w-4 text-primary" />
            Crear Nuevo Ciclo Lectivo
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              <CardTitle>Parámetros de Evaluación</CardTitle>
            </div>
            <CardDescription>Define los valores por defecto para las evaluaciones del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nota-aprobacion">Nota Mínima de Aprobación (%)</Label>
              <Input 
                id="nota-aprobacion" 
                type="number" 
                placeholder="Ej: 60" 
                value={approvalThreshold}
                onChange={(e) => setApprovalThreshold(Number(e.target.value))}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Puntaje mínimo para que un alumno sea considerado "Aprobado".</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Configuración de Ciclo Lectivo</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Activo: {settings.currentSchoolYear}
              </Badge>
            </div>
            <CardDescription>Ajustes del año escolar activo y plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="ciclo-lectivo">Ciclo Lectivo Actual del Sistema</Label>
                <button
                  type="button"
                  onClick={handleOpenCreateYearDialog}
                  className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  + Crear Nuevo Ciclo
                </button>
              </div>
              <Select onValueChange={setSchoolYear} value={schoolYear} disabled={isSubmitting}>
                <SelectTrigger id="ciclo-lectivo">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchoolYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year} {year === settings.currentSchoolYear ? "(Activo)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Establece el año escolar activo que rige las cargas de alumnos, exámenes y filtros predeterminados.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="modo-mantenimiento" className="text-base">Modo Mantenimiento</Label>
                <p className="text-xs text-muted-foreground">
                  Desactiva el acceso a la plataforma para roles no administrativos.
                </p>
              </div>
              <Switch id="modo-mantenimiento" disabled={isSubmitting} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCION NUEVA: Depuracion y Vaciado de Registros por Tipo */}
      <Card className="border-destructive/30 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <Eraser className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Depuración y Vaciado de Registros (Modo Pruebas / Puesta a Cero)</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Herramienta exclusiva del Evaluador General para eliminar masivamente registros de prueba por categoría y ciclo lectivo.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-destructive text-destructive shrink-0 text-xs">
              Acción Permanente
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purge-year" className="text-xs font-semibold">
                1. Ciclo Lectivo a Intervenir
              </Label>
              <Select value={purgeSchoolYear} onValueChange={setPurgeSchoolYear} disabled={isPurging}>
                <SelectTrigger id="purge-year">
                  <SelectValue placeholder="Seleccionar ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchoolYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      Ciclo {year} {year === settings.currentSchoolYear ? "(Activo)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Las eliminaciones de usuarios, alumnos, exámenes y resultados aplicarán solo al año elegido.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purge-type" className="text-xs font-semibold">
                2. Tipo de Registro a Vaciar
              </Label>
              <Select value={purgeType} onValueChange={(val) => setPurgeType(val as PurgeType)} disabled={isPurging}>
                <SelectTrigger id="purge-type">
                  <SelectValue placeholder="Selecciona qué deseas vaciar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docentes">👨‍🏫 Docentes (del ciclo)</SelectItem>
                  <SelectItem value="directores">👔 Directores (del ciclo)</SelectItem>
                  <SelectItem value="referentes">🗺️ Referentes (del ciclo)</SelectItem>
                  <SelectItem value="administradores">🛡️ Administradores (del ciclo)</SelectItem>
                  <SelectItem value="evaluadores">🔍 Evaluadores auxiliares (del ciclo)</SelectItem>
                  <SelectItem value="todos_usuarios">👥 Todos los Usuarios (del ciclo)</SelectItem>
                  <SelectItem value="alumnos">🎒 Alumnos y Calificaciones (del ciclo)</SelectItem>
                  <SelectItem value="examenes">📝 Exámenes (del ciclo)</SelectItem>
                  <SelectItem value="resultados">📊 Resultados / Notas cargadas (del ciclo)</SelectItem>
                  <SelectItem value="escuelas">🏫 Todas las Escuelas (Global)</SelectItem>
                  <SelectItem value="regiones">📍 Todas las Regiones (Global)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {purgeTypeLabels[purgeType].subtitle}
              </p>
            </div>
          </div>

          {/* Panel con Conteo Dinamico en Vivo y Boton Destructivo */}
          <div className="rounded-lg border p-4 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Impacto estimado:
                </span>
                <Badge variant={purgeCount > 0 ? "destructive" : "secondary"} className="text-xs">
                  {purgeCount} {purgeCount === 1 ? "registro encontrado" : "registros encontrados"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {purgeCount > 0 ? (
                  <>
                    Se eliminarán <strong className="text-foreground">{purgeCount}</strong> registro(s) correspondiente(s) a <strong>{purgeTypeLabels[purgeType].title}</strong> {purgeTypeLabels[purgeType].isGlobal ? "en todo el sistema" : `en el ciclo ${purgeSchoolYear}`}.
                  </>
                ) : (
                  <>
                    No hay registros de tipo <strong>{purgeTypeLabels[purgeType].title}</strong> para eliminar en este alcance. La sección ya está limpia.
                  </>
                )}
              </p>
              {purgeType === "evaluadores" || purgeType === "todos_usuarios" ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Tu cuenta activa de Evaluador General ({user.email}) está protegida y no será eliminada.
                </p>
              ) : null}
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsConfirmPurgeOpen(true)}
              disabled={purgeCount === 0 || isPurging}
              className="shrink-0 gap-2 self-end sm:self-center"
            >
              <Trash2 className="h-4 w-4" />
              Vaciar {purgeTypeLabels[purgeType].title}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AlertDialog de Confirmacion Destructiva de Vaciado */}
      <AlertDialog open={isConfirmPurgeOpen} onOpenChange={setIsConfirmPurgeOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2.5 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle className="text-xl">¿Confirmar vaciado de registros?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs space-y-3 pt-2 text-foreground/80">
              <p>
                Esta acción eliminará de forma <strong>permanente e irreversible</strong> los registros seleccionados:
              </p>
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs space-y-1.5 text-foreground">
                <div>• Tipo de registro: <strong>{purgeTypeLabels[purgeType].title}</strong></div>
                <div>• Alcance: <strong>{purgeTypeLabels[purgeType].isGlobal ? "Global (Base institucional)" : `Ciclo Lectivo ${purgeSchoolYear}`}</strong></div>
                <div>• Cantidad a eliminar: <strong className="text-destructive font-bold">{purgeCount} registro(s)</strong></div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Diseñado para entrega limpia del sistema post-pruebas. No se podrá recuperar la información una vez confirmada.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurging}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecutePurge}
              disabled={isPurging}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPurging ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Vaciando...
                </>
              ) : (
                "Sí, Vaciar Permanentemente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Dialog: Crear Nuevo Ciclo Lectivo */}
      <Dialog open={isCreateYearDialogOpen} onOpenChange={setIsCreateYearDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarPlus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl">Crear Nuevo Ciclo Lectivo</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Inicia un nuevo período lectivo limpio sin exámenes ni alumnos, preservando toda la estructura educativa.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-3">
            <div className="space-y-2">
              <Label htmlFor="new-year-input" className="text-sm font-semibold">
                Año del Nuevo Ciclo Lectivo
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-year-input"
                  type="text"
                  placeholder="Ej: 2026"
                  maxLength={4}
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value.replace(/\D/g, ""))}
                  disabled={isCreatingYear}
                  className="pl-9 font-mono text-base font-semibold"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ciclos ya existentes: {availableSchoolYears.join(", ")}
              </p>
            </div>

            {/* Panel Informativo de Estructura Preservada vs Datos Limpios */}
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>¿Qué sucederá al crear este ciclo lectivo?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-2 p-3 rounded-md bg-background border">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Estructura Preservada
                  </div>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-primary shrink-0" />
                      <span><strong>{structureCounts.activeUsersCount} usuarios activos</strong> mantendrán sus cargos, escuelas, cursos y accesos.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <SchoolIcon className="h-3 w-3 text-primary shrink-0" />
                      <span><strong>{structureCounts.activeSchoolsCount} escuelas</strong> y <strong>{structureCounts.regionsCount} regiones</strong> intactas.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <GraduationCap className="h-3 w-3 text-primary shrink-0" />
                      <span>Estructura de grados (1° a 6°) y divisiones (A, B, C...) vigentes.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 p-3 rounded-md bg-background border">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    Inicio Limpio de Ciclo
                  </div>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span><strong>0 Exámenes cargados:</strong> el nuevo ciclo comienza libre de evaluaciones anteriores.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span><strong>0 Alumnos cargados:</strong> los docentes podrán matricular a sus nuevos estudiantes.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span><strong>Histórico seguro:</strong> las notas y exámenes de años previos no se borran; quedan archivados para consulta.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="set-active-toggle" className="text-xs font-semibold cursor-pointer">
                    Establecer como Ciclo Lectivo Activo inmediatamente
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    El sistema comenzará a operar automáticamente bajo este nuevo año escolar.
                  </p>
                </div>
                <Switch
                  id="set-active-toggle"
                  checked={setAsActiveImmediately}
                  onCheckedChange={setSetAsActiveImmediately}
                  disabled={isCreatingYear}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateYearDialogOpen(false)}
              disabled={isCreatingYear}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCreateSchoolYear}
              disabled={isCreatingYear || !newYearInput.trim()}
            >
              {isCreatingYear ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Creando e Inicializando...
                </>
              ) : (
                <>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Crear Ciclo Lectivo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Auditoría y Registros del Sistema</CardTitle>
          </div>
          <CardDescription>Registro de acciones importantes realizadas en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Fecha y Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant={log.action === "CREAR_CICLO_LECTIVO" || log.action === "DEPURAR_DATOS" ? "default" : "secondary"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
