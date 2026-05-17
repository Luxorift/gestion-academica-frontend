'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useStudentCursos } from '@/hooks/useStudentCursos';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CursosPage() {
  const { isAuthenticated } = useAuth();
  const { cursos, loading, error } = useStudentCursos();

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="p-6">
          <p className="text-center text-gray-500">Debes estar autenticado para ver tus cursos</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-500 mt-1">Cursos en los que estás matriculado</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error al cargar cursos</p>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No tienes cursos matriculados</p>
                </CardContent>
              </Card>
            ) : (
              cursos.map(curso => (
                <Link href={`/estudiante/cursos/${curso.id}`} key={curso.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {curso.nombre}
                      </CardTitle>
                      <CardDescription>{curso.codigo}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{curso.creditos} créditos</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Modalidad: {curso.modalidad}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <Badge variant="outline">Ciclo {curso.ciclo}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
