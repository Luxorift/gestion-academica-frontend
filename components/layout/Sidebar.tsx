'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/lib/types';
import {
  BarChart3,
  Users,
  BookOpen,
  FileText,
  CheckSquare,
  BarChart,
  Settings,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
    roles: [UserRole.ADMIN, UserRole.DOCENTE, UserRole.ESTUDIANTE],
  },
  {
    label: 'Mis Notas',
    href: '/estudiante/notas',
    icon: <FileText className="h-5 w-5" />,
    roles: [UserRole.ESTUDIANTE],
  },
  {
    label: 'Mis Cursos',
    href: '/estudiante/cursos',
    icon: <BookOpen className="h-5 w-5" />,
    roles: [UserRole.ESTUDIANTE],
  },
  {
    label: 'Mis Tareas',
    href: '/estudiante/tareas',
    icon: <CheckSquare className="h-5 w-5" />,
    roles: [UserRole.ESTUDIANTE],
  },
  {
    label: 'Asistencia',
    href: '/estudiante/asistencia',
    icon: <BarChart className="h-5 w-5" />,
    roles: [UserRole.ESTUDIANTE],
  },
  {
    label: 'Mis Estudiantes',
    href: '/docente/estudiantes',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.DOCENTE],
  },
  {
    label: 'Calificar',
    href: '/docente/calificar',
    icon: <FileText className="h-5 w-5" />,
    roles: [UserRole.DOCENTE],
  },
  {
    label: 'Tareas',
    href: '/docente/tareas',
    icon: <CheckSquare className="h-5 w-5" />,
    roles: [UserRole.DOCENTE],
  },
  {
    label: 'Asistencia',
    href: '/docente/asistencia',
    icon: <BarChart className="h-5 w-5" />,
    roles: [UserRole.DOCENTE],
  },
  {
    label: 'Gestión de Usuarios',
    href: '/admin/usuarios',
    icon: <Users className="h-5 w-5" />,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Cursos',
    href: '/admin/cursos',
    icon: <BookOpen className="h-5 w-5" />,
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Reportes',
    href: '/admin/reportes',
    icon: <BarChart className="h-5 w-5" />,
    roles: [UserRole.ADMIN],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const visibleItems = menuItems.filter(item => user?.rol && item.roles.includes(user.rol));

  return (
    <aside className="bg-blue-900 text-white w-64 min-h-screen p-4 space-y-4">
      <div className="space-y-1">
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
};
