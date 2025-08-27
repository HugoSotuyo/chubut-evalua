import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const users = [
    { id: "usr-001", name: "Ana Gomez", role: "Docente", school: "Escuela N° 101", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user1" },
    { id: "usr-002", name: "Carlos Diaz", role: "Director", school: "Escuela N° 789", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user2" },
    { id: "usr-003", name: "Lucia Fernandez", role: "Referente", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user3" },
    { id: "usr-004", name: "Marcos Torres", role: "Docente", school: "Escuela N° 101", status: "Pendiente", avatar: "https://i.pravatar.cc/150?u=user4" },
    { id: "usr-005", name: "Sofia Reyes", role: "Administrador", school: "N/A", status: "Activo", avatar: "https://i.pravatar.cc/150?u=user5" },
]

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Administra los roles y permisos de los usuarios del sistema.</p>
            </div>
            <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Usuario
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>Lista de todos los usuarios con acceso a la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Escuela</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.school}</TableCell>
                             <TableCell>
                                <Badge variant={user.status === "Pendiente" ? "secondary" : "default"}>{user.status}</Badge>
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
                                        {user.status === "Pendiente" && <DropdownMenuItem>Habilitar Usuario</DropdownMenuItem>}
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Cambiar Contraseña</DropdownMenuItem>
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
