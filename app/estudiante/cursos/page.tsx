'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Estudiante } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CursosPage() {
  const { user } = useAuth();
  const { getMatriculasByEstudiante, getCursoById, getMatriculasByCurso } = useAppData();
  
  const estudiante = user as Estudiante | null;
  const matriculas = estudiante ? getMatriculasByEstudiante(estudiante.id) : [];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-500 mt-1">Cursos en los que estás matriculado</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matriculas.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">No tienes cursos matriculados</p>
              </CardContent>
            </Card>
          ) : (
            matriculas.map(mat => {
              const curso = getCursoById(mat.curso_id);
              const estudiantes = getMatriculasByCurso(mat.curso_id);

              return (
                <Link href={`/estudiante/cursos/${curso?.id}`} key={mat.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {curso?.nombre}
                      </CardTitle>
                      <CardDescription>{curso?.codigo}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{estudiantes.length} estudiantes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{curso?.creditos} créditos</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <Badge variant="outline">Ciclo {curso?.ciclo}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
