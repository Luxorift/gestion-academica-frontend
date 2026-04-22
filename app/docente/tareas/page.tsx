'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Docente, Tarea } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TareasPage() {
  const { user } = useAuth();
  const { getCursosByDocente, getTareasByCurso, addTarea, updateTarea, deleteTarea } = useAppData();
  
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: '',
    puntaje_total: 10,
    archivo_referencia: '',
    nombre_archivo: '',
  });

  const openEditDialog = (tarea: Tarea) => {
    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha_entrega: tarea.fecha_entrega,
      puntaje_total: tarea.puntaje_total,
      archivo_referencia: tarea.archivo_referencia || '',
      nombre_archivo: '',
    });
    setEditingTaskId(tarea.id);
    setIsOpen(true);
  };
  
  const handleOpenNew = () => {
    if (!selectedCurso) {
      toast.error('Selecciona un curso primero');
      return;
    }
    setFormData({ titulo: '', descripcion: '', fecha_entrega: '', puntaje_total: 10, archivo_referencia: '', nombre_archivo: '' });
    setEditingTaskId(null);
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, archivo_referencia: reader.result as string, nombre_archivo: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const docente = user as Docente | null;
  const cursos = docente ? getCursosByDocente(docente.id) : [];

  const selectedCursoData = cursos.find(c => c.id === selectedCurso);
  const tareas = selectedCurso ? getTareasByCurso(selectedCurso) : [];

  const handleSubmit = () => {
    if (!formData.titulo || !formData.descripcion || !formData.fecha_entrega) {
      toast.error('Completa todos los campos');
      return;
    }

    if (editingTaskId) {
      updateTarea(editingTaskId, {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_entrega: formData.fecha_entrega,
        puntaje_total: formData.puntaje_total,
        archivo_referencia: formData.archivo_referencia || undefined,
      });
      toast.success('Tarea actualizada exitosamente');
    } else {
      const newTarea: Tarea = {
        id: `tarea-${Date.now()}`,
        curso_id: selectedCurso,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_entrega: formData.fecha_entrega,
        puntaje_total: formData.puntaje_total,
        archivo_referencia: formData.archivo_referencia || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };

      addTarea(newTarea);
      toast.success('Tarea creada exitosamente');
    }
    
    setFormData({ titulo: '', descripcion: '', fecha_entrega: '', puntaje_total: 10, archivo_referencia: '', nombre_archivo: '' });
    setIsOpen(false);
    setEditingTaskId(null);
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Tareas</h1>
            <p className="text-gray-500 mt-1">Crea y gestiona tareas para tus cursos</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setEditingTaskId(null);
              setFormData({ titulo: '', descripcion: '', fecha_entrega: '', puntaje_total: 10, archivo_referencia: '', nombre_archivo: '' });
            }
          }}>
            <Button className="bg-blue-900" onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTaskId ? 'Editar Tarea' : 'Crear Nueva Tarea'}</DialogTitle>
                <DialogDescription>
                  {editingTaskId ? 'Modifica los detalles de la tarea.' : 'Llena los detalles para crear una nueva tarea.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Curso</label>
                  <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona un curso..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map(curso => (
                        <SelectItem key={curso.id} value={curso.id}>
                          {curso.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    placeholder="Título de la tarea"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    placeholder="Describe la tarea..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Fecha de Entrega</label>
                    <Input
                      type="date"
                      value={formData.fecha_entrega}
                      onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Puntaje Total</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.puntaje_total}
                      onChange={(e) => setFormData({ ...formData, puntaje_total: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Archivo Adjunto (Opcional)</label>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 cursor-pointer"
                  />
                  {formData.nombre_archivo && <p className="text-xs text-gray-500 mt-1">Archivo: {formData.nombre_archivo}</p>}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} className="bg-blue-900">
                    {editingTaskId ? 'Guardar Cambios' : 'Crear Tarea'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecciona un curso</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un curso..." />
              </SelectTrigger>
              <SelectContent>
                {cursos.map(curso => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nombre} ({curso.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCurso && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedCursoData?.nombre}</CardTitle>
              <CardDescription>{selectedCursoData?.codigo}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tareas.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay tareas creadas. ¡Crea una nueva!</p>
                ) : (
                  tareas.map(tarea => (
                    <div key={tarea.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{tarea.titulo}</h3>
                          <p className="text-sm text-gray-600 mt-1">{tarea.descripcion}</p>
                          {tarea.archivo_referencia && (
                            <a href={tarea.archivo_referencia} download={tarea.titulo + " - Referencia"} className="text-xs text-blue-600 hover:underline mt-1 block">
                              📎 Descargar material adjunto
                            </a>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Fecha de entrega: {tarea.fecha_entrega} • Puntaje: {tarea.puntaje_total} pts
                          </p>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="sm" onClick={() => openEditDialog(tarea)}>
                             <Edit2 className="h-4 w-4 text-blue-600" />
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => {
                             if (confirm('¿Seguro que deseas eliminar esta tarea?')) {
                               deleteTarea(tarea.id);
                               toast.success('Tarea eliminada');
                             }
                           }}>
                             <Trash2 className="h-4 w-4 text-red-600" />
                           </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
