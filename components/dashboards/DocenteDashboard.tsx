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
  const { getCursosByDocente, getMatriculasByCurso, getTareasByCurso, appState } = useAppData();
  
  const docente = user as Docente;
  const cursos = getCursosByDocente(docente.id);
  const tareas = cursos.flatMap(curso => getTareasByCurso(curso.id));
  const entregas = appState.entregas.filter(entrega => tareas.some(t => t.id === entrega.tarea_id));
  const entregasPendientes = entregas.filter(entrega => entrega.calificacion === null).length;
  const entregasTotales = entregas.length;
  const tareasSinEntregas = tareas.filter(tarea => !entregas.some(e => e.tarea_id === tarea.id)).length;
  const promedioGeneral = entregas.length > 0 ? entregas.reduce((sum, e) => sum + (e.calificacion || 0), 0) / entregas.length : 0;
  const proximaTarea = tareas
    .filter(t => new Date(t.fecha_entrega).getTime() > Date.now())
    .sort((a, b) => new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime())[0];
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
            <div className="text-3xl font-bold">{entregasPendientes}</div>
            <p className="text-xs text-gray-500">por calificar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{entregasTotales}</div>
            <p className="text-xs text-gray-500">registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Próxima entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold text-gray-900">
              {proximaTarea
                ? new Date(proximaTarea.fecha_entrega).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'Sin fechas'}
            </div>
            <p className="text-xs text-gray-500">
              {proximaTarea ? proximaTarea.titulo : 'No hay entregas próximas'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tareas sin entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tareasSinEntregas}</div>
            <p className="text-xs text-gray-500">pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promedio general</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{promedioGeneral.toFixed(1)}</div>
            <p className="text-xs text-gray-500">de calificaciones</p>
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
