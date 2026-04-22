'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Docente, Entrega } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CalificarPage() {
  const { user } = useAuth();
  const { getCursosByDocente, getMatriculasByCurso, getNotasByMatricula, getTareasByCurso, getEntregasByTarea, appState, updateNota, addNota, updateEntrega } = useAppData();
  
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [editingNota, setEditingNota] = useState<{matriculaId: string, tipo: string, nota?: any} | null>(null);
  const [newCalificacion, setNewCalificacion] = useState<string>('');

  const [editingEntrega, setEditingEntrega] = useState<Entrega | null>(null);
  const [newCalificacionTarea, setNewCalificacionTarea] = useState<string>('');

  const docente = user as Docente | null;
  const cursos = docente ? getCursosByDocente(docente.id) : [];

  const getEstudianteById = (id: string) => {
    return appState.usuarios.find(u => u.id === id);
  };

  const selectedCursoData = cursos.find(c => c.id === selectedCurso);
  const matriculas = selectedCurso ? getMatriculasByCurso(selectedCurso) : [];

  const handleSaveNota = () => {
    if (!newCalificacion || isNaN(parseFloat(newCalificacion))) {
      toast.error('Ingresa una calificación válida');
      return;
    }

    const calif = parseFloat(newCalificacion);
    if (calif < 0 || calif > 20) {
      toast.error('La calificación debe estar entre 0 y 20');
      return;
    }

    if (!editingNota) return;

    if (editingNota.nota) {
      updateNota(editingNota.nota.id, { calificacion: calif });
    } else {
      addNota({
        id: `nota-${Date.now()}`,
        matricula_id: editingNota.matriculaId,
        tipo: editingNota.tipo as any,
        calificacion: calif,
        peso: editingNota.tipo === 'parcial' ? 20 : editingNota.tipo === 'final' ? 30 : 0
      });
    }

    toast.success('Calificación actualizada');
    setEditingNota(null);
    setNewCalificacion('');
  };

  const handleSaveEntrega = () => {
    if (!newCalificacionTarea || isNaN(parseFloat(newCalificacionTarea))) {
      toast.error('Ingresa una calificación válida');
      return;
    }
    const calif = parseFloat(newCalificacionTarea);
    if (!editingEntrega) return;
    
    // Obtener puntaje max de la tarea
    const tarea = appState.tareas.find(t => t.id === editingEntrega.tarea_id);
    if (tarea && calif > tarea.puntaje_total) {
      toast.error(`La calificación no puede ser mayor al máximo de ${tarea.puntaje_total}`);
      return;
    }

    updateEntrega(editingEntrega.id, { calificacion: calif });
    toast.success('Entrega calificada');
    setEditingEntrega(null);
    setNewCalificacionTarea('');
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calificar Estudiantes</h1>
          <p className="text-gray-500 mt-1">Ingresa y actualiza las calificaciones de tus estudiantes</p>
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
          <Tabs defaultValue="notas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="notas">Promedios y Notas Gen.</TabsTrigger>
              <TabsTrigger value="tareas">Entregas de Tareas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notas">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCursoData?.nombre} - Promedios</CardTitle>
                  <CardDescription>{selectedCursoData?.codigo}</CardDescription>
                </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matriculas.length === 0 ? (
                  <p className="text-gray-500 text-sm">Sin estudiantes en este curso</p>
                ) : (
                  matriculas.map(mat => {
                    const estudiante = getEstudianteById(mat.estudiante_id);
                    const notas = getNotasByMatricula(mat.id);

                    return (
                      <div key={mat.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {estudiante?.nombre} {estudiante?.apellido}
                          </p>
                          <p className="text-sm text-gray-500">{(estudiante as any)?.codigo}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                          {['PC1', 'PC2', 'PC3', 'parcial', 'final'].map(tipo => {
                            const nota = notas.find(n => n.tipo === tipo);
                            return (
                              <Dialog key={tipo} open={editingNota?.matriculaId === mat.id && editingNota?.tipo === tipo} onOpenChange={(open) => {
                                if (!open) setEditingNota(null);
                              }}>
                                <DialogTrigger asChild>
                                  <div
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                      setEditingNota({ matriculaId: mat.id, tipo, nota });
                                      setNewCalificacion(nota?.calificacion?.toString() || '');
                                    }}
                                  >
                                    <p className="text-xs text-gray-600 capitalize font-medium">{tipo}</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                      {nota && nota.calificacion !== null && nota.calificacion !== undefined ? nota.calificacion : '—'}
                                    </p>
                                  </div>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Calificar {tipo}</DialogTitle>
                                    <DialogDescription>
                                      {estudiante?.nombre} {estudiante?.apellido} • {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Calificación (0-20)</label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="0.5"
                                        value={newCalificacion}
                                        onChange={(e) => setNewCalificacion(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex gap-3">
                                      <Button variant="outline" onClick={() => setEditingNota(null)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={handleSaveNota} className="bg-blue-900">
                                        Guardar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            );
                          })}
                        </div>
                        {/** Promedios **/}
                        {(() => {
                          // Promedio Tareas
                          const tareas = getTareasByCurso(selectedCurso);
                          const entregasEstudiante = appState.entregas.filter(e => e.estudiante_id === mat.estudiante_id);
                          const entregasDeTareas = entregasEstudiante.filter(e => tareas.some(t => t.id === e.tarea_id) && e.calificacion !== null);
                          const puntajeObtenido = entregasDeTareas.reduce((sum, e) => sum + (e.calificacion || 0), 0);
                          const puntajePosible = entregasDeTareas.reduce((sum, e) => {
                            const t = tareas.find(t => t.id === e.tarea_id);
                            return sum + (t ? t.puntaje_total : 0);
                          }, 0);
                          const promedioTareas = puntajePosible > 0 ? (puntajeObtenido / puntajePosible) * 20 : 0;

                          // Promedio PCs
                          const pcs = notas.filter(n => ['PC1', 'PC2', 'PC3'].includes(n.tipo));
                          const sumaPCs = pcs.reduce((sum, n) => sum + n.calificacion, 0);
                          const promedioPCs = pcs.length > 0 ? sumaPCs / pcs.length : 0;

                          // Parcial y Final
                          const parcial = notas.find(n => n.tipo === 'parcial')?.calificacion || 0;
                          const final = notas.find(n => n.tipo === 'final')?.calificacion || 0;

                          // Promedio Final
                          // Tareas: 20%, PCs: 30%, Parcial: 20%, Final: 30%
                          const promedioFinal = (promedioTareas * 0.20) + (promedioPCs * 0.30) + (parcial * 0.20) + (final * 0.30);

                          return (
                            <div className="flex gap-4 items-center bg-gray-100 p-3 rounded-lg mt-2 overflow-x-auto">
                              <span className="text-sm">Prom. Tareas: <strong>{promedioTareas.toFixed(1)}</strong></span>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm">Prom. PCs: <strong>{promedioPCs.toFixed(1)}</strong></span>
                              <span className="text-gray-400">|</span>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Promedio Final: <strong>{promedioFinal.toFixed(1)}</strong></span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })
                )}
              </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tareas">
              <Card>
                <CardHeader>
                  <CardTitle>Entregas del Curso: {selectedCursoData?.nombre}</CardTitle>
                  <CardDescription>Revisa y califica las tareas entregadas por tus alumnos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {getTareasByCurso(selectedCurso).length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay tareas creadas para este curso.</p>
                    ) : (
                      getTareasByCurso(selectedCurso).map(tarea => {
                        const entregas = getEntregasByTarea(tarea.id);
                        return (
                          <div key={tarea.id} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold text-lg">{tarea.titulo}</h3>
                            <p className="text-sm text-gray-500 mb-4">Puntaje máximo: {tarea.puntaje_total} pts • Entregas: {entregas.length}</p>
                            
                            <div className="space-y-3">
                               {entregas.length === 0 ? (
                                 <p className="text-xs text-gray-400">Nadie ha entregado esta tarea aún.</p>
                               ) : (
                                 entregas.map(entrega => {
                                    const estudiante = getEstudianteById(entrega.estudiante_id);
                                    return (
                                       <div key={entrega.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 p-4 rounded-lg gap-4">
                                         <div>
                                            <p className="font-medium text-sm">{estudiante?.nombre} {estudiante?.apellido}</p>
                                            <a href={entrega.archivo} download={estudiante?.nombre + "_" + tarea.titulo} className="text-blue-600 hover:underline text-xs flex items-center mt-1">
                                              📎 Descargar Archivo Entregado
                                            </a>
                                            {entrega.comentarios && <p className="text-xs text-gray-600 mt-2 italic">"{entrega.comentarios}"</p>}
                                         </div>
                                         <div className="flex flex-col items-end gap-2">
                                            {entrega.calificacion !== null ? (
                                                <span className="text-sm font-bold text-green-700">Calificada: {entrega.calificacion}/{tarea.puntaje_total}</span>
                                            ) : (
                                                <span className="text-sm font-bold text-yellow-600">Pendiente de revisión</span>
                                            )}
                                            
                                            <Dialog open={editingEntrega?.id === entrega.id} onOpenChange={(open) => {
                                              if (!open) setEditingEntrega(null);
                                            }}>
                                              <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setEditingEntrega(entrega);
                                                    setNewCalificacionTarea(entrega.calificacion?.toString() || '');
                                                }}>
                                                  {entrega.calificacion !== null ? 'Cambiar Nota' : 'Calificar'}
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                <DialogHeader>
                                                  <DialogTitle>Calificar Tarea: {tarea.titulo}</DialogTitle>
                                                  <DialogDescription>
                                                    Estudiante: {estudiante?.nombre} {estudiante?.apellido}
                                                  </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                  <div>
                                                    <label className="text-sm font-medium">Nota asignada (Máx {tarea.puntaje_total})</label>
                                                    <Input
                                                      type="number"
                                                      min="0"
                                                      max={tarea.puntaje_total}
                                                      step="1"
                                                      value={newCalificacionTarea}
                                                      onChange={(e) => setNewCalificacionTarea(e.target.value)}
                                                      className="mt-1"
                                                    />
                                                  </div>
                                                  <div className="flex gap-3">
                                                    <Button variant="outline" onClick={() => setEditingEntrega(null)}>
                                                      Cancelar
                                                    </Button>
                                                    <Button onClick={handleSaveEntrega} className="bg-blue-900">
                                                      Guardar Nota
                                                    </Button>
                                                  </div>
                                                </div>
                                              </DialogContent>
                                            </Dialog>

                                         </div>
                                       </div>
                                    )
                                 })
                               )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
}
