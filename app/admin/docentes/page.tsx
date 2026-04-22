'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Docente } from '@/lib/types';

export default function DocentesPage() {
  const { appState } = useAppData();
  
  const docentes = appState.usuarios.filter(u => u.rol === 'DOCENTE') as Docente[];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionar Docentes</h1>
          <p className="text-gray-500 mt-1">Administra el personal docente de la institución</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Docentes Registrados</CardTitle>
            <CardDescription>Total: {docentes.length} docentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docentes.map(docente => (
                <div key={docente.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-900">{docente.nombre} {docente.apellido}</h3>
                    <p className="text-sm text-gray-500">{docente.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {docente.especialidad} • {docente.departamento}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={docente.estado === 'activo' ? 'bg-green-600' : 'bg-red-600'}>
                      {docente.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
