'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Estudiante } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, CheckSquare, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const EstudianteDashboard: React.FC = () => {

  const { user } = useAuth();
  const { getMatriculasByEstudiante, getTareasByCurso, getAsistenciasByEstudiante, getCursoById, getNotasByMatricula, appState } = useAppData();

  // Validación de usuario
  if (!user || (user as Estudiante).id === undefined) {
    return <div>No se encontró información del estudiante.</div>;
  }

  const estudiante = user as Estudiante;

  // Memoización de datos
  const matriculas = useMemo(() => getMatriculasByEstudiante(estudiante.id), [getMatriculasByEstudiante, estudiante.id]);
  const totalCursos = matriculas.length;
  const totalTareas = useMemo(() =>
    matriculas.reduce((acc, mat) => {
      const tareas = getTareasByCurso(mat.curso_id);
      return acc + tareas.length;
    }, 0), [matriculas, getTareasByCurso]
  );
  const totalAsistencias = useMemo(() => getAsistenciasByEstudiante(estudiante.id).length, [getAsistenciasByEstudiante, estudiante.id]);

  // Separar lógica de cálculo de promedio
  const getCourseAverage = React.useCallback((matriculaId: string, cursoId: string) => {
    const notas = getNotasByMatricula(matriculaId);
    const tareas = getTareasByCurso(cursoId);
    const entregasEstudiante = appState.entregas.filter(e => e.estudiante_id === estudiante.id && e.calificacion !== null && tareas.some(t => t.id === e.tarea_id));

    let puntajeObtenido = 0;
    let puntajePosible = 0;
    entregasEstudiante.forEach(e => {
      puntajeObtenido += e.calificacion || 0;
      const t = tareas.find(t => t.id === e.tarea_id);
      if (t) puntajePosible += t.puntaje_total;
    });
    const promedioTareas = puntajePosible > 0 ? (puntajeObtenido / puntajePosible) * 20 : 0;

    const pcs = notas.filter(n => ['PC1', 'PC2', 'PC3'].includes(n.tipo));
    const promedioPCs = pcs.length > 0 ? (pcs.reduce((s, n) => s + n.calificacion, 0) / pcs.length) : 0;
    const parcial = notas.find(n => n.tipo === 'parcial')?.calificacion || 0;
    const final = notas.find(n => n.tipo === 'final')?.calificacion || 0;

    return (promedioTareas * 0.20) + (promedioPCs * 0.30) + (parcial * 0.20) + (final * 0.30);
  }, [appState.entregas, estudiante.id, getNotasByMatricula, getTareasByCurso]);

  const promediosActuales = useMemo(() => matriculas.map(mat => getCourseAverage(mat.id, mat.curso_id)), [matriculas, getCourseAverage]);
  const generalAverage = promediosActuales.length > 0 ? (promediosActuales.reduce((s, p) => s + p, 0) / promediosActuales.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {estudiante.nombre}
        </h1>
        <p className="text-gray-500 mt-1">
          Ingeniería Informática - Ciclo {estudiante.ciclo}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Mis Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{totalCursos}</div>
            <p className="text-sm text-gray-500">cursos matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <CheckSquare className="h-6 w-6 text-green-600" />
              Mis Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{totalTareas}</div>
            <p className="text-sm text-gray-500">tareas pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{totalAsistencias}</div>
            <p className="text-sm text-gray-500">registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-600" />
              Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{generalAverage.toFixed(1)}</div>
            <p className="text-sm text-gray-500">promedio general actual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos Matriculados</CardTitle>
          <CardDescription>Tus cursos activos del ciclo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matriculas.length === 0 ? (
              <p className="text-gray-500">No tienes cursos matriculados</p>
            ) : (
              matriculas.map(mat => {
                const curso = getCursoById(mat.curso_id);
                const avg = getCourseAverage(mat.id, mat.curso_id);
                return (
                  <Link href={`/estudiante/cursos/${curso?.id}`} key={mat.id}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mb-4 transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-900">{curso?.nombre}</h3>
                        <p className="text-sm text-gray-500">{curso?.codigo} • {curso?.creditos} créditos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{avg.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">promedio</p>
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
