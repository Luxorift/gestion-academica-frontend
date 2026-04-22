# 📌 Módulos del Sistema Académico

## 1. Módulos de Autenticación y Seguridad
- **feature/login**: UI de Login y validación contra LocalStorage/IndexedDB.  
- **feature/password-recovery**: Flujo de recuperación (modal de 3 pasos).  
- **feature/auth-guard**: Protección de rutas y redirecciones según el rol.  

---

## 2. Módulos del Administrador (Gestión General)
- **feature/admin-dashboard**: Panel de estadísticas dinámicas.  
- **feature/gestion-usuarios**: CRUD de docentes y alumnos (misma vista/lógica).  
- **feature/gestion-cursos**: Crear, editar y eliminar cursos.  
- **feature/gestion-matriculas**: Asignación de alumnos a cursos y docentes.  

---

## 3. Módulos del Docente (Gestión de Clase)
- **feature/docente-asistencia**: Lógica para marcar presente/ausente.  
- **feature/docente-notas**: Ingreso de notas (PC1, Parcial, Final).  
- **feature/docente-tareas**: Creación de tareas y temario (18 semanas).  

---

## 4. Módulos del Estudiante (Vista Académica)
- **feature/estudiante-dashboard**: Resumen de cursos y promedios.  
- **feature/estudiante-entregas**: Subida de tareas (PDFs) y vista de temario.  
- **feature/estudiante-historial**: Vista detallada de notas y asistencia.  

---

## 5. Módulos Transversales (UI/UX)
- **feature/layout-base**: Sidebar, Header, estilos globales.  
- **feature/database-engine**: Lógica base de `useAppData` e IndexedDB.  

---