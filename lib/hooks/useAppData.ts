import { useCallback, useState } from 'react';
import { AppState, Nota, Tarea, Entrega, Asistencia, Matricula, Curso } from '@/lib/types';
import { getAppState, saveAppState } from '@/lib/seedData';

export const useAppData = () => {
  const [appState, setAppState] = useState<AppState>(() => getAppState());

  const updateAppState = useCallback((newState: Partial<AppState>) => {
    setAppState(prevState => {
      const mergedState = { ...prevState, ...newState } as AppState;
      saveAppState(mergedState);
      return mergedState;
    });
  }, []);

  // Notas
  const addNota = (nota: Nota) => {
    const newState = { ...appState, notas: [...appState.notas, nota] };
    updateAppState(newState);
  };

  const updateNota = (notaId: string, updates: Partial<Nota>) => {
    const newState = {
      ...appState,
      notas: appState.notas.map(n => (n.id === notaId ? { ...n, ...updates } : n)),
    };
    updateAppState(newState);
  };

  const getNotasByMatricula = (matriculaId: string) => {
    return appState.notas.filter(n => n.matricula_id === matriculaId);
  };

  const getNotasByCurso = (cursoId: string) => {
    const matriculas = appState.matriculas.filter(m => m.curso_id === cursoId);
    return appState.notas.filter(n => matriculas.some(m => m.id === n.matricula_id));
  };

  // Tareas
  const addTarea = (tarea: Tarea) => {
    const newState = { ...appState, tareas: [...appState.tareas, tarea] };
    updateAppState(newState);
  };

  const getTareasByCurso = (cursoId: string) => {
    return appState.tareas.filter(t => t.curso_id === cursoId);
  };

  const updateTarea = (tareaId: string, updates: Partial<Tarea>) => {
    const newState = {
      ...appState,
      tareas: appState.tareas.map(t => (t.id === tareaId ? { ...t, ...updates } : t)),
    };
    updateAppState(newState);
  };

  const deleteTarea = (tareaId: string) => {
    const newState = {
      ...appState,
      tareas: appState.tareas.filter(t => t.id !== tareaId),
      // También podríamos eliminar las entregas de esa tarea, pero por ahora simplificado
      entregas: appState.entregas.filter(e => e.tarea_id !== tareaId),
    };
    updateAppState(newState);
  };

  // Entregas
  const addEntrega = (entrega: Entrega) => {
    const newState = { ...appState, entregas: [...appState.entregas, entrega] };
    updateAppState(newState);
  };

  const updateEntrega = (entregaId: string, updates: Partial<Entrega>) => {
    const newState = {
      ...appState,
      entregas: appState.entregas.map(e => (e.id === entregaId ? { ...e, ...updates } : e)),
    };
    updateAppState(newState);
  };

  const getEntregasByTarea = (tareaId: string) => {
    return appState.entregas.filter(e => e.tarea_id === tareaId);
  };

  const getEntregasByEstudiante = (estudianteId: string) => {
    return appState.entregas.filter(e => e.estudiante_id === estudianteId);
  };

  // Asistencia
  const addAsistencia = (asistencia: Asistencia) => {
    const newState = { ...appState, asistencias: [...appState.asistencias, asistencia] };
    updateAppState(newState);
  };

  const updateAsistencia = (asistenciaId: string, updates: Partial<Asistencia>) => {
    const newState = {
      ...appState,
      asistencias: appState.asistencias.map(a => (a.id === asistenciaId ? { ...a, ...updates } : a)),
    };
    updateAppState(newState);
  };

  const getAsistenciasByCurso = (cursoId: string) => {
    return appState.asistencias.filter(a => a.curso_id === cursoId);
  };

  const getAsistenciasByEstudiante = (estudianteId: string, cursoId?: string) => {
    return appState.asistencias.filter(
      a => a.estudiante_id === estudianteId && (!cursoId || a.curso_id === cursoId)
    );
  };

  // Matrículas
  const getMatriculasByEstudiante = (estudianteId: string) => {
    return (appState.matriculas || []).filter(m => m.estudiante_id === estudianteId && m.estado === 'activo');
  };

  const getMatriculasByCurso = (cursoId: string) => {
    return (appState.matriculas || []).filter(m => m.curso_id === cursoId && m.estado === 'activo');
  };

  const addMatricula = (matricula: any) => {
    updateAppState({ matriculas: [...(appState.matriculas || []), matricula] });
  };

  const removeMatricula = (matriculaId: string) => {
    updateAppState({
      matriculas: (appState.matriculas || []).filter(m => m.id !== matriculaId)
    });
  };

  // Cursos
  const getCursosByDocente = (docenteId: string) => {
    return (appState.cursos || []).filter(c => c.docente_id === docenteId);
  };

  const getCursoById = (cursoId: string) => {
    return (appState.cursos || []).find(c => c.id === cursoId);
  };

  const addCurso = (curso: any) => {
    updateAppState({ cursos: [...(appState.cursos || []), curso] });
  };

  const updateCurso = (cursoId: string, updates: any) => {
    updateAppState({
      cursos: (appState.cursos || []).map(c => c.id === cursoId ? { ...c, ...updates } : c)
    });
  };

  const deleteCurso = (cursoId: string) => {
    updateAppState({
      cursos: (appState.cursos || []).filter(c => c.id !== cursoId)
    });
  };

  // Contenidos (Semanas)
  const getContenidosByCurso = (cursoId: string) => {
    return appState.contenidos?.filter(c => c.curso_id === cursoId).sort((a, b) => a.semana_numero - b.semana_numero) || [];
  };

  const addContenido = (contenido: any) => {
    updateAppState({ contenidos: [...(appState.contenidos || []), contenido] });
  };

  const updateContenido = (contenidoId: string, updates: any) => {
    updateAppState({
      contenidos: (appState.contenidos || []).map(c => 
        c.id === contenidoId ? { ...c, ...updates } : c
      )
    });
  };

  const deleteContenido = (contenidoId: string) => {
    updateAppState({
      contenidos: (appState.contenidos || []).filter(c => c.id !== contenidoId)
    });
  };

  return {
    appState,
    updateAppState,
    // Notas
    addNota,
    updateNota,
    getNotasByMatricula,
    getNotasByCurso,
    // Tareas
    addTarea,
    updateTarea,
    deleteTarea,
    getTareasByCurso,
    // Entregas
    addEntrega,
    updateEntrega,
    getEntregasByTarea,
    getEntregasByEstudiante,
    // Asistencia
    addAsistencia,
    updateAsistencia,
    getAsistenciasByCurso,
    getAsistenciasByEstudiante,
    // Matrículas
    getMatriculasByEstudiante,
    getMatriculasByCurso,
    addMatricula,
    removeMatricula,
    // Cursos
    getCursosByDocente,
    getCursoById,
    addCurso,
    updateCurso,
    deleteCurso,
    // Contenidos (Semanas)
    getContenidosByCurso,
    addContenido,
    updateContenido,
    deleteContenido,
  };
};
