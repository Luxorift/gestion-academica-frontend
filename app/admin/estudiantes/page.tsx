'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Estudiante } from '@/lib/types';

export default function EstudiantesPage() {
  const { appState } = useAppData();
  
  const estudiantes = appState.usuarios.filter(u => u.rol === 'ESTUDIANTE') as Estudiante[];

  // Group by carrera
  const estudiantesPorCarrera = estudiantes.reduce((acc, est) => {
    if (!acc[est.carrera]) {
      acc[est.carrera] = [];
    }
    acc[est.carrera].push(est);
    return acc;
  }, {} as Record<string, Estudiante[]>);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionar Estudiantes</h1>
          <p className="text-gray-500 mt-1">Administra el registro de estudiantes de la institución</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(estudiantesPorCarrera).map(([carrera, ests]) => (
            <Card key={carrera}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{carrera}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{ests.length}</div>
                <p className="text-xs text-gray-500">estudiantes</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes por Carrera</CardTitle>
            <CardDescription>Total: {estudiantes.length} estudiantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(estudiantesPorCarrera).map(([carrera, ests]) => (
              <div key={carrera}>
                <h3 className="font-medium text-gray-900 mb-3">{carrera}</h3>
                <div className="space-y-2">
                  {ests.map(estudiante => (
                    <div key={estudiante.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{estudiante.nombre} {estudiante.apellido}</p>
                        <p className="text-sm text-gray-500">
                          {estudiante.codigo} • {estudiante.ciclo}° ciclo
                        </p>
                      </div>
                      <Badge className={estudiante.estado === 'activo' ? 'bg-green-600' : 'bg-red-600'}>
                        {estudiante.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
