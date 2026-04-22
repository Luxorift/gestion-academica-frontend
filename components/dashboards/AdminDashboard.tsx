'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Admin } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, UserCheck, BarChart3 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { appState } = useAppData();
  
  const admin = user as Admin;
  
  // Calculate stats
  const totalEstudiantes = (appState.usuarios || []).filter(u => u.rol === 'ESTUDIANTE').length;
  const totalDocentes = (appState.usuarios || []).filter(u => u.rol === 'DOCENTE').length;
  const totalCursos = (appState.cursos || []).length;
  const totalMatriculas = (appState.matriculas || []).filter(m => m.estado === 'activo').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenido, {admin.nombre}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEstudiantes}</div>
            <p className="text-xs text-gray-500">activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              Docentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDocentes}</div>
            <p className="text-xs text-gray-500">en planta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-600" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCursos}</div>
            <p className="text-xs text-gray-500">disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Matrículas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMatriculas}</div>
            <p className="text-xs text-gray-500">activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes por Carrera</CardTitle>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(
              (appState.usuarios || [])
                .filter(u => u.rol === 'ESTUDIANTE')
                .reduce((acc: Record<string, number>, curr: any) => {
                  const carrera = curr.carrera || 'Sin especialidad';
                  acc[carrera] = (acc[carrera] || 0) + 1;
                  return acc;
                }, {})
            ).map(([carrera, count]) => (
              <div key={carrera} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{carrera}</span>
                <span className="text-lg font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especialidades Docentes</CardTitle>
            <CardDescription>Por departamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(
              (appState.usuarios || [])
                .filter(u => u.rol === 'DOCENTE')
                .reduce((acc: Record<string, number>, curr: any) => {
                  const especialidad = curr.especialidad || 'General';
                  acc[especialidad] = (acc[especialidad] || 0) + 1;
                  return acc;
                }, {})
            ).map(([esp, count]) => (
              <div key={esp} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{esp}</span>
                <span className="text-lg font-bold text-green-600">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
