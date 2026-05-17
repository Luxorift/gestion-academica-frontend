/**
 * Servicio de API para cursos del estudiante
 * Consume los endpoints del backend
 */

import { apiClient } from '../api-client';

export interface Curso {
  id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  ciclo: number;
  modalidad: string;
  zoom_link?: string;
  createdAt: string;
}

export interface CursoConDetalles extends Curso {
  docentes?: any[];
  tareas?: any[];
  contenidos?: any[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class CursosStudentService {
  /**
   * TAREA 1: Obtiene todos los cursos asignados al estudiante autenticado
   */
  async obtenerMisCursos(): Promise<Curso[]> {
    try {
      const cursos = await apiClient.get<Curso[]>('/api/estudiante/cursos');
      return cursos || [];
    } catch (error) {
      console.error('Error al obtener mis cursos:', error);
      throw error;
    }
  }

  /**
   * TAREA 2: Obtiene el detalle de un curso específico
   */
  async obtenerDetalleCurso(cursoId: string): Promise<CursoConDetalles> {
    try {
      const curso = await apiClient.get<CursoConDetalles>(
        `/api/estudiante/cursos/${cursoId}`
      );
      return curso;
    } catch (error) {
      console.error(`Error al obtener detalle del curso ${cursoId}:`, error);
      throw error;
    }
  }
}

export const cursosStudentService = new CursosStudentService();
