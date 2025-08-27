import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const exams = [
    { id: "exm-001", name: "Matemática Diagnóstico 2024", created: "2024-03-15", status: "Abierto" },
    { id: "exm-002", name: "Lengua y Literatura 2024", created: "2024-04-01", status: "Abierto" },
    { id: "exm-003", name: "Ciencias Naturales 2023", created: "2023-09-10", status: "Cerrado" },
    { id: "exm-004", name: "Matemática Cierre 2023", created: "2023-11-20", status: "Cerrado" },
]

export default function ExamenesPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Exámenes</h1>
                <p className="text-muted-foreground">Crea, edita y administra las evaluaciones del sistema.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Examen
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Exámenes Existentes</CardTitle>
                <CardDescription>Lista de todos los exámenes cargados en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre del Examen</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de Creación</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {exams.map((exam) => (
                        <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>
                                <Badge variant={exam.status === "Cerrado" ? "destructive" : "default"}>{exam.status}</Badge>
                            </TableCell>
                            <TableCell>{exam.created}</TableCell>
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
                                        <DropdownMenuItem>Ver Resultados</DropdownMenuItem>
                                        {exam.status === "Abierto" && <DropdownMenuItem>Cerrar Examen</DropdownMenuItem>}
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
