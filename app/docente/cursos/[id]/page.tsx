'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { invalid, validateContentForm } from '@/lib/validation';
import { useValidationModal } from '@/components/ui/validation-modal';

export default function DocenteCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const { getCursoById, getContenidosByCurso, addContenido, updateContenido, deleteContenido } = useAppData();
  const { showValidation, validationModal } = useValidationModal();
  
  const resolvedParams = React.use(params);
  const cursoId = resolvedParams.id;
  
  const curso = getCursoById(cursoId);
  const contenidos = getContenidosByCurso(cursoId);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    semana_numero: '',
    titulo: '',
    descripcion: '',
    archivo: '',
    nombre_archivo: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showValidation(invalid('Archivo demasiado grande', ['El material complementario no debe superar los 5 MB.']));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        archivo: event.target?.result as string,
        nombre_archivo: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const editingWeek = editingId ? contenidos.find((contenido) => contenido.id === editingId)?.semana_numero : undefined;
    if (showValidation(validateContentForm(
      formData,
      contenidos.map((contenido) => contenido.semana_numero),
      editingWeek,
    ))) return;

    if (!formData.semana_numero || !formData.titulo) {
      toast.error('Número de semana y título son obligatorios');
      return;
    }

    try {
      if (editingId) {
        updateContenido(editingId, {
          semana_numero: parseInt(formData.semana_numero),
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          archivo: formData.archivo || undefined,
          nombre_archivo: formData.nombre_archivo || undefined,
        });
        toast.success('Semana actualizada con éxito');
      } else {
        // Prevent duplicate week number to some extent, optional
        addContenido({
          id: `sem-${Date.now()}`,
          curso_id: cursoId,
          semana_numero: parseInt(formData.semana_numero),
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          archivo: formData.archivo || undefined,
          nombre_archivo: formData.nombre_archivo || undefined,
          createdAt: new Date().toISOString()
        });
        toast.success('Semana agregada con éxito');
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Oops, límite de almacenamiento local excedido para ese archivo');
    }
  };

  const resetForm = () => {
    setFormData({semana_numero: '', titulo: '', descripcion: '', archivo: '', nombre_archivo: ''});
    setEditingId(null);
  };

  const handleEdit = (contenido: any) => {
    setFormData({
      semana_numero: contenido.semana_numero.toString(),
      titulo: contenido.titulo,
      descripcion: contenido.descripcion,
      archivo: contenido.archivo || '',
      nombre_archivo: contenido.nombre_archivo || ''
    });
    setEditingId(contenido.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm('¿Eliminar esta semana de contenido?')) {
      deleteContenido(id);
      toast.success('Contenido eliminado');
    }
  };

  if (!curso) {
    return (
      <MainLayout>
        <div className="p-6">
          Curso no encontrado
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{curso.nombre}</h1>
            <p className="text-gray-500 mt-1">Gestión del Temario del Curso • Código: {curso.codigo}</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if(!open) resetForm();
        }}>
          <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <div>
              <h2 className="font-semibold text-blue-900">Programa Académico (18 Semanas)</h2>
              <p className="text-sm text-blue-700">Asegúrate de tener material subido clase a clase.</p>
            </div>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Semana
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Contenido de Semana' : 'Nueva Semana de Clases'}</DialogTitle>
              <DialogDescription>
                Define el tema de la semana y adjunta sus PDF para los estudiantes.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-sm font-medium">No. Semana</label>
                  <Input 
                    type="number" min="1" max="18" required
                    value={formData.semana_numero}
                    onChange={e => setFormData({...formData, semana_numero: e.target.value})}
                    placeholder="Ej. 1" className="mt-1"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-sm font-medium">Título del Tema</label>
                  <Input 
                    required
                    value={formData.titulo}
                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ej. Introducción a POO" className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción y Puntos Clave</label>
                <Textarea 
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Detalla lo que se aprenderá en esta semana..." className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Material Complementario (opcional, PDF/Word)</label>
                <div className="mt-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <Input 
                      type="file" 
                      onChange={handleFileUpload}
                      className="max-w-xs cursor-pointer"
                    />
                    {formData.nombre_archivo && (
                      <p className="mt-2 text-sm text-green-600 font-medium break-all text-center">
                        ✓ Archivo listo: {formData.nombre_archivo}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-blue-900">{editingId ? 'Actualizar Semana' : 'Guardar y Publicar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
           {contenidos.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
               <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
               <h3 className="text-lg font-medium text-gray-900">Temario Vacío</h3>
               <p className="text-gray-500">Agrega las semanas del curso (Semana 1 a la 18) usando el botón Añadir Semana.</p>
             </div>
           ) : (
             contenidos.map((contenido) => (
               <Card key={contenido.id} className="relative overflow-hidden group">
                 <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600"></div>
                 <CardHeader className="pl-6 pb-2">
                   <div className="flex justify-between items-start">
                     <div>
                       <CardDescription className="font-bold text-blue-600 tracking-wider uppercase text-xs mb-1">
                         Semana {contenido.semana_numero}
                       </CardDescription>
                       <CardTitle className="text-xl text-gray-800">{contenido.titulo}</CardTitle>
                     </div>
                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" onClick={() => handleEdit(contenido)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100" onClick={() => handleDelete(contenido.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="pl-6 pt-2">
                   <p className="text-gray-600 text-sm whitespace-pre-line mb-4 border-l-2 border-gray-200 pl-4 py-1 italic">
                     {contenido.descripcion}
                   </p>
                   {contenido.archivo && (
                     <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md w-fit border border-gray-100">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{contenido.nombre_archivo || 'Documento adjunto'}</span>
                        <a href={contenido.archivo} download={contenido.nombre_archivo || "material"} className="ml-4 text-xs font-bold text-blue-600 hover:underline">
                          Decargar a PC
                        </a>
                     </div>
                   )}
                 </CardContent>
               </Card>
             ))
           )}
        </div>
      </div>
      {validationModal}
    </MainLayout>
  );
}
