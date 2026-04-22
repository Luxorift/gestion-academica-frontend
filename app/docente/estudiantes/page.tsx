'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Docente } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';

export default function EstudiantesPage() {
  const { user } = useAuth();
  const { getCursosByDocente, getMatriculasByCurso, appState } = useAppData();
  
  const docente = user as Docente;
  const cursos = getCursosByDocente(docente.id);

  const getEstudianteById = (id: string) => {
    return appState.usuarios.find(u => u.id === id);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
          <p className="text-gray-500 mt-1">Estudiantes matriculados en tus cursos</p>
        </div>

        <div className="space-y-6">
          {cursos.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No tienes cursos asignados</p>
              </CardContent>
            </Card>
          ) : (
            cursos.map(curso => {
              const matriculas = getMatriculasByCurso(curso.id);

              return (
                <Card key={curso.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          {curso.nombre}
                        </CardTitle>
                        <CardDescription>{curso.codigo} • Ciclo {curso.ciclo}</CardDescription>
                      </div>
                      <Badge className="bg-blue-900">{matriculas.length} estudiantes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {matriculas.length === 0 ? (
                      <p className="text-gray-500 text-sm">Sin estudiantes matriculados</p>
                    ) : (
                      <div className="space-y-2">
                        {matriculas.map(mat => {
                          const estudiante = getEstudianteById(mat.estudiante_id);
                          return (
                            <div key={mat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {estudiante?.nombre} {estudiante?.apellido}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(estudiante as any)?.codigo} • {(estudiante as any)?.carrera}
                                </p>
                              </div>
                              <Badge variant="outline">{(estudiante as any)?.ciclo}° ciclo</Badge>
                            </div>
                          );
                        })}
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
