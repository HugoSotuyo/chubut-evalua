
"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleIcon } from "@/components/role-icon";
import { User as UserIcon, KeyRound, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function PerfilPage() {
  const { user, updateUserPassword } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 3) { // Simple validation
        toast({ title: "Error", description: "La contraseña debe tener al menos 3 caracteres.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
        await updateUserPassword(newPassword);
        toast({ title: "Contraseña Actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
        setIsPasswordDialogOpen(false);
        setNewPassword("");
        setConfirmPassword("");
    } catch (error) {
        toast({ title: "Error", description: "No se pudo actualizar la contraseña.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const userInitials = user.name ? user.name.split(' ').map(n => n[0]).join('') : '';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Mi Perfil</h1>
        <p className="text-muted-foreground">Consulta tu información personal y de acceso.</p>
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
                {user.schoolYear && (user.role === 'Director' || user.role === 'Docente') && (
                    <div className="space-y-2">
                        <Label htmlFor="schoolYear">Ciclo Lectivo</Label>
                        <Input id="schoolYear" value={user.schoolYear} readOnly />
                    </div>
                )}
            </div>

             <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                </Button>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
            <form onSubmit={handlePasswordChange}>
                <DialogHeader>
                    <DialogTitle>Cambiar mi Contraseña</DialogTitle>
                    <DialogDescription>
                        Ingresa tu nueva contraseña. Se recomienda usar una combinación segura que puedas recordar.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input 
                            id="new-password" 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input 
                            id="confirm-password" 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isSubmitting}>Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Guardando..." : "Guardar Contraseña"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
