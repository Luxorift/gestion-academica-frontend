'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Users, Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { validateCourseForm } from '@/lib/validation';
import { useValidationModal } from '@/components/ui/validation-modal';

export default function CursosPage() {
  const { appState, addCurso, updateCurso, deleteCurso, addMatricula, removeMatricula } = useAppData();
  const { showValidation, validationModal } = useValidationModal();
  
  const [isCursoOpen, setIsCursoOpen] = useState(false);
  const [isMatriculaOpen, setIsMatriculaOpen] = useState(false);
  
  const [editingCursoId, setEditingCursoId] = useState<string | null>(null);
  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);

  const [cursoData, setCursoData] = useState({
    nombre: '',
    codigo: '',
    docente_id: '',
    creditos: '3',
    ciclo: '1'
  });

  const getDocenteById = (id: string) => {
    return (appState.usuarios || []).find(u => u.id === id);
  };

  const getEstudiantesCurso = (cursoId: string) => {
    return (appState.matriculas || []).filter(m => m.curso_id === cursoId && m.estado === 'activo');
  };

  const handleCursoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showValidation(validateCourseForm(cursoData, appState.cursos || [], editingCursoId))) return;

    if (!cursoData.nombre || !cursoData.codigo || !cursoData.docente_id) {
      toast.error('Nombre, código y docente son obligatorios');
      return;
    }

    if (editingCursoId) {
      updateCurso(editingCursoId, {
        nombre: cursoData.nombre.trim(),
        codigo: cursoData.codigo.trim().toUpperCase(),
        docente_id: cursoData.docente_id,
        creditos: parseInt(cursoData.creditos),
        ciclo: parseInt(cursoData.ciclo)
      });
      toast.success('Curso actualizado con éxito');
    } else {
      addCurso({
        id: `curso-${Date.now()}`,
        nombre: cursoData.nombre.trim(),
        codigo: cursoData.codigo.trim().toUpperCase(),
        docente_id: cursoData.docente_id,
        creditos: parseInt(cursoData.creditos),
        ciclo: parseInt(cursoData.ciclo),
        estado: 'activo',
        createdAt: new Date().toISOString()
      });
      toast.success('Curso creado con éxito');
    }

    setIsCursoOpen(false);
    resetCursoForm();
  };

  const resetCursoForm = () => {
    setCursoData({ nombre: '', codigo: '', docente_id: '', creditos: '3', ciclo: '1' });
    setEditingCursoId(null);
  };

  const handleEditCurso = (curso: any) => {
    setCursoData({
      nombre: curso.nombre,
      codigo: curso.codigo,
      docente_id: curso.docente_id,
      creditos: curso.creditos?.toString() || '3',
      ciclo: curso.ciclo?.toString() || '1'
    });
    setEditingCursoId(curso.id);
    setIsCursoOpen(true);
  };

  const handleDeleteCurso = (id: string) => {
    if(confirm('¿Seguro que deseas eliminar este curso de la currícula?')) {
      deleteCurso(id);
      toast.success('Curso eliminado permanentemente');
    }
  };

  const handleToggleMatricula = (estudianteId: string, isEnrolled: boolean, matriculaId?: string) => {
    if(!selectedCursoId) return;

    if(isEnrolled && matriculaId) {
      removeMatricula(matriculaId);
      toast.success('Estudiante removido del curso');
    } else {
      addMatricula({
        id: `mat-${Date.now()}`,
        estudiante_id: estudianteId,
        curso_id: selectedCursoId,
        fecha_matricula: new Date().toISOString().split('T')[0],
        estado: 'activo'
      });
      toast.success('Estudiante matriculado con éxito');
    }
  };

  const openMatriculaManager = (cursoId: string) => {
    setSelectedCursoId(cursoId);
    setIsMatriculaOpen(true);
  };

  // Lists for dropdowns
  const docentes = (appState.usuarios || []).filter(u => u.rol === 'DOCENTE');
  const todosLosEstudiantes = (appState.usuarios || []).filter(u => u.rol === 'ESTUDIANTE');

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Cursos</h1>
            <p className="text-gray-500 mt-1">Administra los cursos, asigna docentes y matricula estudiantes</p>
          </div>
          
          <Dialog open={isCursoOpen} onOpenChange={(o) => {
            setIsCursoOpen(o);
            if(!o) resetCursoForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900">
                <Plus className="w-4 h-4 mr-2" />
                Crear Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCursoId ? 'Editar Curso' : 'Crear Curso'}</DialogTitle>
                <DialogDescription>Define los parámetros del curso y asígnale un Docente titular.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCursoSubmit} className="space-y-4 pt-4">
                 <div>
                   <label className="text-sm font-medium">Nombre del Curso</label>
                   <Input required value={cursoData.nombre} onChange={e => setCursoData({...cursoData, nombre: e.target.value})} placeholder="Ej. Matemática Avanzada" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Código</label>
                     <Input required value={cursoData.codigo} onChange={e => setCursoData({...cursoData, codigo: e.target.value})} placeholder="Ej. MAT-301" />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Docente Titular</label>
                     <Select value={cursoData.docente_id} onValueChange={val => setCursoData({...cursoData, docente_id: val})}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar docente" /></SelectTrigger>
                        <SelectContent>
                          {docentes.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.nombre} {d.apellido}</SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <label className="text-sm font-medium">Créditos</label>
                     <Input required type="number" min="1" max="10" value={cursoData.creditos} onChange={e => setCursoData({...cursoData, creditos: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Ciclo</label>
                     <Input required type="number" min="1" max="10" value={cursoData.ciclo} onChange={e => setCursoData({...cursoData, ciclo: e.target.value})} />
                   </div>
                 </div>
                 <div className="flex justify-end pt-4">
                   <Button type="submit" className="bg-blue-900">{editingCursoId ? 'Guardar Cambios' : 'Crear Curso'}</Button>
                 </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isMatriculaOpen} onOpenChange={setIsMatriculaOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Gestión de Matrículas</DialogTitle>
              <DialogDescription>
                Habilita o deshabilita a los estudiantes para el curso actual.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto mt-4 border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-center">Matriculado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {todosLosEstudiantes.map(est => {
                    const matricula = (appState.matriculas || []).find(m => m.curso_id === selectedCursoId && m.estudiante_id === est.id && m.estado === 'activo');
                    const isEnrolled = !!matricula;

                    return (
                      <tr key={est.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{est.nombre} {est.apellido}</td>
                        <td className="px-4 py-3 text-gray-500">{est.email}</td>
                        <td className="px-4 py-3 text-center">
                           <Button 
                             variant={isEnrolled ? 'default' : 'outline'}
                             size="sm"
                             className={isEnrolled ? 'bg-green-600 hover:bg-green-700' : ''}
                             onClick={() => handleToggleMatricula(est.id, isEnrolled, matricula?.id)}
                           >
                             {isEnrolled ? 'Matriculado' : 'Añadir al curso'}
                           </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setIsMatriculaOpen(false)}>Cerrar Panel</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{(appState.cursos || []).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Cursos Disponibles
            </CardTitle>
            <CardDescription>Todos los cursos del ciclo actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(appState.cursos || []).map(curso => {
                const docente = getDocenteById(curso.docente_id);
                const estudiantes = getEstudiantesCurso(curso.id);

                return (
                  <div key={curso.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="pl-2">
                        <h3 className="font-bold text-lg text-gray-900">{curso.nombre}</h3>
                        <p className="text-sm font-medium text-blue-600">{curso.codigo}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-gray-50">Ciclo {curso.ciclo}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pl-2 text-sm border-t pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Docente</span>
                        <span className="font-medium text-gray-800">{docente ? `${docente.nombre} ${docente.apellido}` : 'Sin asignar'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Estudiantes</span>
                        <div className="flex items-center gap-2 text-gray-800 font-medium">
                          <Users className="h-4 w-4 text-blue-600" />
                          {estudiantes.length} alumnos
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => openMatriculaManager(curso.id)}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Matricular
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleEditCurso(curso)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDeleteCurso(curso.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!appState.cursos || appState.cursos.length === 0) && (
                <div className="text-center py-12 text-gray-500 border border-dashed rounded-lg">
                  No hay cursos en la currícula. Comienza agregando uno nuevo.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {validationModal}
    </MainLayout>
  );
}
