'use client';

import React from 'react';
import { useStudentCursoDetalle } from '@/hooks/useStudentCursos';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialAttachment } from '@/components/material/MaterialAttachment';
import { ArrowLeft, FileText, DownloadCloud, BookOpen, AlertCircle, Video, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

export default function EstudianteCursoPage({ params }: { params: { id: string } }) {
  const cursoId = params.id;
  
  const { curso, loading, error } = useStudentCursoDetalle(cursoId);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </MainLayout>
    );
  }

  if (error || !curso) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <Link href="/estudiante/cursos" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            Volver a mis cursos
          </Link>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error al cargar el curso</p>
                <p className="text-sm text-red-700">{error?.message || 'Curso no encontrado'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/estudiante/cursos" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{curso.nombre}</h1>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Ciclo {curso.ciclo}</Badge>
            </div>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> 
              Temario Oficial del Curso • Código: {curso.codigo}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="z-10 relative">
            <h2 className="text-2xl font-bold mb-2">Contenido por Semanas</h2>
            <p className="text-blue-100 max-w-xl">
              Aquí encontrarás todo el material impartido a lo largo del ciclo. Asegúrate de descargar los archivos y repasar cada sesión.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <BookOpen className="w-64 h-64" />
          </div>
        </div>

        <div className="space-y-6 max-w-4xl pt-4">
          {!curso.contenidos || curso.contenidos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Aún no hay contenido público</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Tu docente no ha subido el material para las semanas de este curso. Vuelve pronto.</p>
            </div>
          ) : (
            <div className="relative border-l-4 border-blue-100 ml-4 space-y-8">
              {curso.contenidos.map((contenido) => (
                <div key={contenido.id} className="relative pl-6">
                  <div className="absolute -left-[14px] top-6 w-6 h-6 bg-white border-4 border-blue-600 rounded-full"></div>
                  
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 border-b border-gray-50">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div>
                          <Badge className="bg-blue-600 text-white hover:bg-blue-700 uppercase tracking-widest text-[10px] mb-2 font-bold px-2 py-0.5">
                            Semana {contenido.semana_numero}
                          </Badge>
                          <CardTitle className="text-xl text-gray-800 leading-tight">{contenido.titulo}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                        {contenido.descripcion}
                      </p>
                       
                      {contenido.archivo && (
                        <MaterialAttachment
                          contentId={contenido.id}
                          fileName={contenido.nombre_archivo}
                          fileData={contenido.archivo}
                          downloadName={contenido.nombre_archivo || "material_semana_" + contenido.semana_numero}
                        />
                      )}

                      {curso.modalidad === 'virtual' && contenido.zoom_link && (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                               <Video className="h-6 w-6" />
                             </div>
                             <div>
                               <p className="text-sm font-semibold text-emerald-950">Clase virtual de la semana</p>
                               <p className="text-xs text-emerald-700">Enlace registrado por el docente</p>
                             </div>
                           </div>
                           <Button className="bg-emerald-700 hover:bg-emerald-800 whitespace-nowrap" asChild>
                             <a href={contenido.zoom_link} target="_blank" rel="noopener noreferrer">
                               <ExternalLink className="h-4 w-4 mr-2" />
                               Acceder a clase
                             </a>
                           </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
