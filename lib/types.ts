// Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
  ESTUDIANTE = 'ESTUDIANTE',
}

// Base User
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  createdAt: string;
}

// Estudiante
export interface Estudiante extends User {
  codigo: string;
  carrera: string;
  ciclo: number;
  estado: 'activo' | 'inactivo';
}

// Docente
export interface Docente extends User {
  especialidad: string;
  departamento: string;
  estado: 'activo' | 'inactivo';
}

// Admin
export interface Admin extends User {
  nivel_acceso: 'super' | 'moderador';
  estado: 'activo' | 'inactivo';
}

// Curso
export interface Curso {
  id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  docente_id: string;
  ciclo: number;
  createdAt: string;
}

// Matrícula
export interface Matricula {
  id: string;
  estudiante_id: string;
  curso_id: string;
  fecha_matricula: string;
  estado: 'activo' | 'retirado';
}

// Nota
export interface Nota {
  id: string;
  matricula_id: string;
  tipo: 'PC1' | 'PC2' | 'PC3' | 'parcial' | 'final' | 'practica'; // keep practica for backward compatibility
  calificacion: number;
  peso: number;
  fecha: string;
}

// Tarea
export interface Tarea {
  id: string;
  curso_id: string;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  puntaje_total: number;
  archivo_referencia?: string;
  createdAt: string;
}

// Entrega
export interface Entrega {
  id: string;
  tarea_id: string;
  estudiante_id: string;
  archivo: string;
  fecha_entrega: string;
  calificacion: number | null;
  comentarios: string;
}

// Asistencia
export interface Asistencia {
  id: string;
  curso_id: string;
  estudiante_id: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tardanza';
}

// Horario
export interface Horario {
  id: string;
  curso_id: string;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
}

// Temario/Semanas
export interface ContenidoSemana {
  id: string;
  curso_id: string;
  semana_numero: number;
  titulo: string;
  descripcion: string;
  archivo?: string;  // Base64 material
  nombre_archivo?: string;
  createdAt: string;
}

// Auth Response
export interface AuthResponse {
  user: User | Estudiante | Docente | Admin | null;
  token: string | null;
  error?: string;
}

// Context State
export interface AuthContextType {
  user: User | Estudiante | Docente | Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
}

// App State
export interface AppState {
  usuarios: (User | Estudiante | Docente | Admin)[];
  cursos: Curso[];
  matriculas: Matricula[];
  notas: Nota[];
  tareas: Tarea[];
  entregas: Entrega[];
  asistencias: Asistencia[];
  horarios: Horario[];
  contenidos: ContenidoSemana[];
}
