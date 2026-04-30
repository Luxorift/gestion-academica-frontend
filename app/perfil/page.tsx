'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { validatePasswordChange } from '@/lib/validation';
import { useValidationModal } from '@/components/ui/validation-modal';
import { Camera } from 'lucide-react';
import Image from 'next/image';

export default function MiPerfilPage() {
  const { user, updateUser } = useAuth();
  const { appState, updateAppState } = useAppData();
  const { showValidation, validationModal } = useValidationModal();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = user?.id;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        const updatedUsers = appState.usuarios.map(u => 
          u.id === userId ? { ...u, profilePicture: base64String } : u
        );
        updateAppState({ usuarios: updatedUsers });
        
        if (user) {
          updateUser({ ...user, profilePicture: base64String });
        }
        
        toast.success('Foto de perfil actualizada');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (showValidation(validatePasswordChange(newPassword, confirmPassword, currentPassword, true))) return;

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // In a real app we'd verify currentPassword. For local simulation, we just update it.
    // However, let's update it in appState:
    const updatedUsers = appState.usuarios.map(u => {
      // If we had a password field, we would update it here.
      // Usually auth ignores password for dummy data or stores it in seedData but we don't have password visible in `types.User`.
      // Let's pretend to save it:
      return u.id === userId ? { ...u, password: newPassword } : u;
    });

    updateAppState({ usuarios: updatedUsers });
    toast.success('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1">Administra tu cuenta y credenciales</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
            <CardDescription>Información básica de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-lg font-medium text-gray-900">{user.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Apellido</label>
                <p className="text-lg font-medium text-gray-900">{user.apellido}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                <p className="text-lg font-medium text-blue-600">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rol</label>
                <p className="text-lg font-medium text-gray-900 capitalize">{user.rol}</p>
              </div>
              {user.rol === 'ESTUDIANTE' && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ciclo</label>
                  <p className="text-lg font-medium text-gray-900">{(user as any).ciclo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Actualiza tu imagen de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera size={32} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500">
                  Sube una imagen (JPG, PNG) de máximo 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza la contraseña de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Contraseña Actual (Simulada)</label>
                <Input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nueva Contraseña</label>
                <Input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
                <Input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña" 
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-900">
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {validationModal}
    </MainLayout>
  );
}
