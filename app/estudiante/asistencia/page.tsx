'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Estudiante } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AsistenciaPage() {
  const { user } = useAuth();
  const { getAsistenciasByEstudiante, getCursoById, appState, getMatriculasByEstudiante } = useAppData();
  
  const estudiante = user as Estudiante | null;
  const asistencias = estudiante ? getAsistenciasByEstudiante(estudiante.id) : [];

  const matriculas = estudiante ? getMatriculasByEstudiante(estudiante.id) : [];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800';
      case 'tardanza':
        return 'bg-yellow-100 text-yellow-800';
      case 'ausente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularAsistencia = (registros: any[]) => {
    if (registros.length === 0) return 0;
    const presentes = registros.filter(r => r.estado === 'presente' || r.estado === 'tardanza').length;
    return Math.round((presentes / registros.length) * 100);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Asistencia</h1>
          <p className="text-gray-500 mt-1">Consulta tu registro de asistencia por curso</p>
        </div>

        <div className="space-y-4">
          {matriculas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No tienes cursos matriculados</p>
              </CardContent>
            </Card>
          ) : (
            matriculas.map((mat) => {
              const cursoId = mat.curso_id;
              const curso = getCursoById(cursoId);
              const registros = asistencias.filter(a => a.curso_id === cursoId);
              const porcentaje = calcularAsistencia(registros);

              return (
                <Card key={cursoId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{curso?.nombre}</CardTitle>
                        <CardDescription>{curso?.codigo}</CardDescription>
                      </div>
                      {registros.length > 0 ? (
                        <Badge className={porcentaje >= 85 ? 'bg-green-600' : 'bg-orange-600'}>
                          {porcentaje}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 pr-2">
                          Sin registros
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {registros.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-4 border border-dashed rounded-lg">El docente aún no ha registrado asistencia.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {registros.map(asi => (
                          <div key={asi.id} className={`p-3 rounded-lg ${getEstadoColor(asi.estado)} flex items-center justify-between`}>
                            <div>
                              <p className="text-xs font-semibold">{asi.fecha}</p>
                              <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">{asi.estado}</p>
                            </div>
                            {asi.estado === 'presente' && <CheckCircle2 className="h-4 w-4" />}
                            {asi.estado === 'ausente' && <XCircle className="h-4 w-4" />}
                            {asi.estado === 'tardanza' && <Clock className="h-4 w-4" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
