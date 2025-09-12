
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, Settings, SlidersHorizontal, Shield, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "@/context/audit-log-context";
import { useSettings } from "@/context/settings-context";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminPage() {
  const { auditLogs, addAuditLog, loading: auditLoading } = useAuditLogs();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { toast } = useToast();

  const [approvalThreshold, setApprovalThreshold] = useState(settings.approvalThreshold);
  const [schoolYear, setSchoolYear] = useState(settings.currentSchoolYear);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!settingsLoading) {
        setApprovalThreshold(settings.approvalThreshold);
        setSchoolYear(settings.currentSchoolYear);
    }
  }, [settings, settingsLoading]);


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


  if (auditLoading || settingsLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Administración General</h1>
          <p className="text-muted-foreground">Panel de control para tareas administrativas avanzadas.</p>
        </div>
        <div className="flex justify-end">
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
              />
              <p className="text-xs text-muted-foreground">Puntaje mínimo para que un alumno sea considerado "Aprobado".</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Configuración General</CardTitle>
              </div>
            <CardDescription>Ajustes globales de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ciclo-lectivo">Ciclo Lectivo Actual</Label>
              <Select onValueChange={setSchoolYear} value={schoolYear}>
                  <SelectTrigger id="ciclo-lectivo">
                      <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground">Establece el año escolar activo para filtros y cargas.</p>
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="modo-mantenimiento" className="text-base">Modo Mantenimiento</Label>
                    <p className="text-xs text-muted-foreground">
                        Desactiva el acceso a la plataforma para roles no administrativos.
                    </p>
                </div>
                <Switch id="modo-mantenimiento" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                                <Badge variant="secondary">{log.action}</Badge>
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
