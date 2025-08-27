import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const schools = [
    { id: "esc-001", name: "Escuela N° 101", district: "Distrito I", status: "Activa" },
    { id: "esc-002", name: "Escuela N° 789", district: "Distrito II", status: "Activa" },
    { id: "esc-003", name: "Escuela N° 456", district: "Distrito I", status: "Activa" },
    { id: "esc-004", name: "Escuela N° 23", district: "Distrito III", status: "Inactiva" },
    { id: "esc-005", name: "Escuela N° 502", district: "Distrito II", status: "Activa" },
]

export default function EscuelasPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Escuelas</h1>
                <p className="text-muted-foreground">Administra las escuelas del sistema.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Escuela
            </Button>
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <CardTitle>Escuelas Registradas</CardTitle>
                </div>
                <CardDescription>Lista de todas las escuelas cargadas en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre de la Escuela</TableHead>
                            <TableHead>Distrito</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.map((school) => (
                        <TableRow key={school.id}>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell>{school.district}</TableCell>
                            <TableCell>
                                <Badge variant={school.status === "Inactiva" ? "secondary" : "default"}>{school.status}</Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        {school.status === "Activa" ? (
                                            <DropdownMenuItem>Desactivar</DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem>Activar</DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
