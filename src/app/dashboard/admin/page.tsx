
"use client"

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
import { format } from "date-fns";

export default function AdminPage() {
  const { auditLogs, loading } = useAuditLogs();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Cargando registros...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Administración General</h1>
        <p className="text-muted-foreground">Panel de control para tareas administrativas avanzadas.</p>
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
              <Input id="nota-aprobacion" type="number" placeholder="Ej: 60" defaultValue="60" />
              <p className="text-xs text-muted-foreground">Puntaje mínimo para que un alumno sea considerado "Aprobado".</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="puntaje-correcta">P. Correcta</Label>
                    <Input id="puntaje-correcta" type="number" step="0.5" defaultValue="1" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="puntaje-parcial">P. Parcial</Label>
                    <Input id="puntaje-parcial" type="number" step="0.5" defaultValue="0.5" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="puntaje-incorrecta">P. Incorrecta</Label>
                    <Input id="puntaje-incorrecta" type="number" step="0.5" defaultValue="0" />
                </div>
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
              <Select defaultValue="2024">
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

       <div className="flex justify-end">
          <Button>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
          </Button>
      </div>
    </div>
  );
}
