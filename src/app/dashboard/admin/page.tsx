import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Administración General</h1>
        <p className="text-muted-foreground">Panel de control para tareas administrativas avanzadas.</p>
      </div>
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Panel de Administrador</CardTitle>
            </div>
          <CardDescription>Aquí se encontrarán las configuraciones y herramientas para el rol de Evaluador.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Próximamente: Herramientas de configuración global, gestión de parámetros del sistema y más.</p>
        </CardContent>
      </Card>
    </div>
  );
}
