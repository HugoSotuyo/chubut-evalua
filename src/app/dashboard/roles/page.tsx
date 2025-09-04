
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, KeyRound } from "lucide-react"

const rolesData = [
    {
        role: "Evaluador",
        description: "Superusuario con acceso total al sistema. Responsable de la configuración inicial, gestión de datos maestros y supervisión general.",
        permissions: {
            usuarios: ["Habilitar", "Eliminar"],
            escuelas: ["Crear", "Editar", "Eliminar", "Activar/Desactivar"],
            examenes: ["Crear", "Editar", "Eliminar", "Abrir/Cerrar"],
            resultados: ["Ver", "Anular"],
            analisis: true,
            alumnos: false,
            admin: true
        }
    },
    {
        role: "Administrador",
        description: "Gestiona usuarios y escuelas a nivel sistema. No interviene en la parte pedagógica (exámenes, resultados).",
        permissions: {
            usuarios: ["Habilitar", "Eliminar"],
            escuelas: ["Crear", "Editar", "Eliminar", "Activar/Desactivar"],
            examenes: [],
            resultados: [],
            analisis: true,
            alumnos: false,
            admin: false
        }
    },
    {
        role: "Referente",
        description: "Rol de consulta y carga de datos a nivel distrital o regional. Puede crear exámenes y ver resultados y análisis.",
        permissions: {
            usuarios: [],
            escuelas: ["Ver"],
            examenes: ["Crear", "Editar", "Eliminar"],
            resultados: ["Ver"],
            analisis: true,
            alumnos: false,
            admin: false
        }
    },
    {
        role: "Director",
        description: "Gestiona los usuarios (docentes) y alumnos de su propia escuela. Visualiza los resultados y análisis correspondientes a su institución.",
        permissions: {
            usuarios: ["Habilitar Docentes", "Eliminar Docentes"],
            escuelas: [],
            examenes: ["Ver"],
            resultados: ["Ver"],
            analisis: true,
            alumnos: true,
            admin: false
        }
    },
    {
        role: "Docente",
        description: "Rol enfocado en la gestión de sus alumnos y la carga de resultados de los exámenes correspondientes a su grado.",
        permissions: {
            usuarios: [],
            escuelas: [],
            examenes: ["Ver"],
            resultados: ["Cargar"],
            analisis: true,
            alumnos: true,
            admin: false
        }
    }
];

const PermissionCheck = ({ hasPermission }: { hasPermission: boolean }) => (
    hasPermission 
        ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
        : <XCircle className="h-5 w-5 text-muted-foreground opacity-50" />
);


export default function RolesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Roles y Permisos</h1>
        <p className="text-muted-foreground">Descripción detallada de cada rol y sus funcionalidades en el sistema.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                <CardTitle>Matriz de Permisos</CardTitle>
            </div>
            <CardDescription>
                Esta tabla muestra qué acciones puede realizar cada rol dentro de la plataforma.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Rol</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Gestión de Usuarios</TableHead>
                            <TableHead>Gestión de Escuelas</TableHead>
                            <TableHead>Gestión de Exámenes</TableHead>
                            <TableHead>Gestión de Resultados</TableHead>
                            <TableHead className="text-center">Análisis</TableHead>
                            <TableHead className="text-center">Alumnos</TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rolesData.map((roleInfo) => (
                            <TableRow key={roleInfo.role}>
                                <TableCell className="font-bold">{roleInfo.role}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{roleInfo.description}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {roleInfo.permissions.usuarios.length > 0 
                                            ? roleInfo.permissions.usuarios.map(p => <Badge key={p} variant="secondary">{p}</Badge>)
                                            : <span className="text-muted-foreground">-</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col gap-1">
                                        {roleInfo.permissions.escuelas.length > 0 
                                            ? roleInfo.permissions.escuelas.map(p => <Badge key={p} variant="secondary">{p}</Badge>)
                                            : <span className="text-muted-foreground">-</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {roleInfo.permissions.examenes.length > 0 
                                            ? roleInfo.permissions.examenes.map(p => <Badge key={p} variant="secondary">{p}</Badge>)
                                            : <span className="text-muted-foreground">-</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <div className="flex flex-col gap-1">
                                        {roleInfo.permissions.resultados.length > 0 
                                            ? roleInfo.permissions.resultados.map(p => <Badge key={p} variant="secondary">{p}</Badge>)
                                            : <span className="text-muted-foreground">-</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell className="text-center"><PermissionCheck hasPermission={roleInfo.permissions.analisis} /></TableCell>
                                <TableCell className="text-center"><PermissionCheck hasPermission={roleInfo.permissions.alumnos} /></TableCell>
                                <TableCell className="text-center"><PermissionCheck hasPermission={roleInfo.permissions.admin} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

