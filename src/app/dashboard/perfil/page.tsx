
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleIcon } from "@/components/role-icon";
import { User as UserIcon, KeyRound, Save, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/context/users-context";
import { requestPermissionAndToken } from "@/lib/firebase";

export default function PerfilPage() {
  const { user, updateUserPassword, updateUser, loading: authLoading } = useAuth();
  const { loading: usersLoading } = useUsers();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (authLoading || usersLoading || !user) {
    return <div>Cargando perfil...</div>;
  }
  
  const isProfileChanged = user.name !== name || user.email !== email;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 3) {
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
  
  const handleProfileUpdate = async () => {
    if (!isProfileChanged || !user) return;
    setIsSubmitting(true);
    try {
        await updateUser({ name, email });
        toast({ title: "Perfil Actualizado", description: "Tus datos han sido actualizados." });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const userInitials = name ? name.split(' ').map(n => n[0]).join('') : '';

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Mi Perfil</h1>
            <p className="text-muted-foreground">Consulta y edita tu información personal y de acceso.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)} disabled={isSubmitting}>
                <KeyRound className="mr-2 h-4 w-4" />
                Cambiar Contraseña
            </Button>
            <Button onClick={handleProfileUpdate} disabled={!isProfileChanged || isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting && !isPasswordDialogOpen ? "Guardando..." : "Guardar Cambios"}
            </Button>
        </div>
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
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="text-xl"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <RoleIcon role={user.role} className="h-4 w-4" />
                        <span>{user.role}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email / Usuario</Label>
                    <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        readOnly={user.role !== 'Evaluador'}
                        disabled={isSubmitting}
                    />
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
        </CardContent>
      </Card>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
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
