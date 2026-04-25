'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Docente, Asistencia } from '@/lib/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { validateAttendance } from '@/lib/validation';
import { useValidationModal } from '@/components/ui/validation-modal';

export default function AsistenciaPage() {
  const { user } = useAuth();
  const { getCursosByDocente, getMatriculasByCurso, appState, getAsistenciasByCurso, addAsistencia } = useAppData();
  const { showValidation, validationModal } = useValidationModal();
  
  const [selectedCurso, setSelectedCurso] = useState<string>('');
  const [selectedFecha, setSelectedFecha] = useState(new Date().toISOString().split('T')[0]);
  const [asistencia, setAsistencia] = useState<Record<string, 'presente' | 'ausente' | 'tardanza' | null>>({});

  const docente = user as Docente | null;
  const cursos = docente ? getCursosByDocente(docente.id) : [];

  const getEstudianteById = (id: string) => {
    return appState.usuarios.find(u => u.id === id);
  };

  const selectedCursoData = cursos.find(c => c.id === selectedCurso);
  const matriculas = selectedCurso ? getMatriculasByCurso(selectedCurso) : [];

  const handleGuardarAsistencia = () => {
    const markedCount = Object.values(asistencia).filter(Boolean).length;
    if (showValidation(validateAttendance(selectedCurso, selectedFecha, markedCount))) return;

    let count = 0;
    matriculas.forEach(mat => {
      const estado = asistencia[mat.estudiante_id];
      if (estado) {
        const newAsistencia: Asistencia = {
          id: `asi-${Date.now()}-${count}`,
          curso_id: selectedCurso,
          estudiante_id: mat.estudiante_id,
          fecha: selectedFecha,
          estado,
        };
        addAsistencia(newAsistencia);
        count++;
      }
    });

    if (count > 0) {
      toast.success(`Asistencia registrada para ${count} estudiantes`);
      setAsistencia({});
    } else {
      toast.error('Marca la asistencia de al menos un estudiante');
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Asistencia</h1>
          <p className="text-gray-500 mt-1">Marca la asistencia de tus estudiantes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Curso</label>
                <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un curso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map(curso => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre} ({curso.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  value={selectedFecha}
                  onChange={(e) => setSelectedFecha(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCurso && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedCursoData?.nombre}</CardTitle>
              <CardDescription>{selectedFecha}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {matriculas.length === 0 ? (
                <p className="text-gray-500 text-sm">Sin estudiantes en este curso</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {matriculas.map(mat => {
                      const estudiante = getEstudianteById(mat.estudiante_id);
                      const estado = asistencia[mat.estudiante_id];

                      return (
                        <div key={mat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {estudiante?.nombre} {estudiante?.apellido}
                            </p>
                            <p className="text-sm text-gray-500">{(estudiante as any)?.codigo}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={estado === 'presente' ? 'default' : 'outline'}
                              className={estado === 'presente' ? 'bg-green-600' : ''}
                              onClick={() => setAsistencia({ ...asistencia, [mat.estudiante_id]: 'presente' })}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Presente
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === 'tardanza' ? 'default' : 'outline'}
                              className={estado === 'tardanza' ? 'bg-yellow-600' : ''}
                              onClick={() => setAsistencia({ ...asistencia, [mat.estudiante_id]: 'tardanza' })}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Tardanza
                            </Button>
                            <Button
                              size="sm"
                              variant={estado === 'ausente' ? 'default' : 'outline'}
                              className={estado === 'ausente' ? 'bg-red-600' : ''}
                              onClick={() => setAsistencia({ ...asistencia, [mat.estudiante_id]: 'ausente' })}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Ausente
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={handleGuardarAsistencia} className="w-full bg-blue-900 mt-4">
                    Guardar Asistencia
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {validationModal}
    </MainLayout>
  );
}
