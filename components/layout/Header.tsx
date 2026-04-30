'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-white">NS</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-blue-900">NuevaSchool</h1>
          <p className="text-xs text-gray-500">Sistema de Gestión Académica</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-900">{user?.nombre} {user?.apellido}</p>
          <p className="text-xs text-gray-500">{user?.rol}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden w-10 h-10 border border-gray-200">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/perfil')}>
              <Menu className="mr-2 h-4 w-4" /> {/* Just using Menu icon as placeholder for User icon */}
              Mi Perfil (Contraseña)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
