'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Estudiante } from '@/lib/types';

const COLORS = ['#0F3B82', '#E67E22', '#27AE60', '#E74C3C'];

type EstudiantesPorCiclo = {
  ciclo: number;
  cantidad: number;
};

type EstudiantesPorCarrera = {
  name: string;
  value: number;
};

export default function ReportesPage() {
  const { appState } = useAppData();
  
  // Estudiantes por ciclo
  const estudiantes = appState.usuarios.filter((u): u is Estudiante => u.rol === 'ESTUDIANTE');
  const estudiantesPorCiclo = estudiantes.reduce<EstudiantesPorCiclo[]>((acc, est) => {
    const ciclo = est.ciclo || 1;
    const existing = acc.find((e) => e.ciclo === ciclo);
    if (existing) {
      existing.cantidad += 1;
    } else {
      acc.push({ ciclo, cantidad: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.ciclo - b.ciclo);

  // Matrículas por curso
  const matriculasPorCurso = appState.cursos.map(curso => ({
    nombre: curso.nombre,
    estudiantes: appState.matriculas.filter(m => m.curso_id === curso.id).length,
  }));

  // Carrera distribution
  const estudiantesPorCarrera = estudiantes.reduce<EstudiantesPorCarrera[]>((acc, est) => {
    const carrera = est.carrera;
    const existing = acc.find((e) => e.name === carrera);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: carrera, value: 1 });
    }
    return acc;
  }, []);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Análisis y estadísticas de la institución</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{estudiantes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Docentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {appState.usuarios.filter(u => u.rol === 'DOCENTE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{appState.cursos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Matrículas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {appState.matriculas.filter(m => m.estado === 'activo').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estudiantes por Ciclo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estudiantesPorCiclo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ciclo" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#0F3B82" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Carrera</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estudiantesPorCarrera}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estudiantesPorCarrera.map((entry: EstudiantesPorCarrera, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Matrículas por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matriculasPorCurso}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="estudiantes" fill="#E67E22" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
