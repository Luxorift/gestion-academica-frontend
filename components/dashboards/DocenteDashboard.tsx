'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Docente } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export const DocenteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getCursosByDocente, getMatriculasByCurso, getTareasByCurso } = useAppData();
  
  const docente = user as Docente;
  const cursos = getCursosByDocente(docente.id);

  // Calculate stats
  const totalEstudiantes = cursos.reduce((acc, curso) => {
    return acc + getMatriculasByCurso(curso.id).length;
  }, 0);

  const totalTareas = cursos.reduce((acc, curso) => {
    return acc + getTareasByCurso(curso.id).length;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, Prof. {docente.nombre}
        </h1>
        <p className="text-gray-500 mt-1">
          {docente.especialidad} • {docente.departamento}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cursos.length}</div>
            <p className="text-xs text-gray-500">asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEstudiantes}</div>
            <p className="text-xs text-gray-500">matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-orange-600" />
              Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTareas}</div>
            <p className="text-xs text-gray-500">creadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-gray-500">por calificar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
          <CardDescription>Cursos asignados este ciclo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cursos.length === 0 ? (
              <p className="text-gray-500">No tienes cursos asignados</p>
            ) : (
              cursos.map(curso => {
                const estudiantes = getMatriculasByCurso(curso.id);
                return (
                  <Link href={`/docente/cursos/${curso.id}`} key={curso.id} className="block mb-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-900">{curso.nombre}</h3>
                        <p className="text-sm text-gray-500">{curso.codigo} • Ciclo {curso.ciclo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">{estudiantes.length}</p>
                        <p className="text-xs text-gray-500">estudiantes</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
