
"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleIcon } from "@/components/role-icon";
import { User as UserIcon, Edit } from "lucide-react";

export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando perfil...</div>;
  }
  
  const userInitials = user.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Mi Perfil</h1>
        <p className="text-muted-foreground">Consulta y edita tu información personal y de acceso.</p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                <CardTitle>Información de Usuario</CardTitle>
            </div>
          <CardDescription>Estos son los datos asociados a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {userInitials}
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RoleIcon role={user.role} className="h-4 w-4" />
                        <span>{user.role}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email / Usuario</Label>
                    <Input id="email" value={user.email} readOnly />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="escuela">Escuela</Label>
                    <Input id="escuela" value={user.school} readOnly />
                </div>
                {(user.role === 'Docente' && user.grade) && (
                    <div className="space-y-2">
                        <Label htmlFor="grado">Grado</Label>
                        <Input id="grado" value={user.grade} readOnly />
                    </div>
                )}
                 {(user.role === 'Docente' && user.course) && (
                    <div className="space-y-2">
                        <Label htmlFor="curso">Curso</Label>
                        <Input id="curso" value={user.course} readOnly />
                    </div>
                )}
            </div>

             <div className="flex justify-end">
                <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
