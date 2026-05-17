/**
 * Hook personalizado para obtener cursos del estudiante
 * Maneja carga, errores y caché
 */

'use client';

import { useState, useEffect } from 'react';
import { cursosStudentService, Curso, CursoConDetalles } from '@/lib/services/cursos-student';

interface UseStudentCursosReturn {
  cursos: Curso[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseStudentCursoDetalleReturn {
  curso: CursoConDetalles | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener todos los cursos del estudiante
 * TAREA 1
 */
export function useStudentCursos(): UseStudentCursosReturn {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cursosStudentService.obtenerMisCursos();
      setCursos(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('Error en useStudentCursos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, []);

  const refetch = async () => {
    await fetchCursos();
  };

  return { cursos, loading, error, refetch };
}

/**
 * Hook para obtener el detalle de un curso específico
 * TAREA 2
 */
export function useStudentCursoDetalle(cursoId: string | null): UseStudentCursoDetalleReturn {
  const [curso, setCurso] = useState<CursoConDetalles | null>(null);
  const [loading, setLoading] = useState(!!cursoId);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetalle = async () => {
    if (!cursoId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await cursosStudentService.obtenerDetalleCurso(cursoId);
      setCurso(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      console.error('Error en useStudentCursoDetalle:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, [cursoId]);

  const refetch = async () => {
    await fetchDetalle();
  };

  return { curso, loading, error, refetch };
}
