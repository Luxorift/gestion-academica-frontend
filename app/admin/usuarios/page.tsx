'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';

export default function GestionUsuariosPage() {
  const { user } = useAuth();
  const { appState, updateAppState } = useAppData();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filter for tab-like toggle
  const [activeRole, setActiveRole] = useState<'ESTUDIANTE' | 'DOCENTE'>('ESTUDIANTE');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'ESTUDIANTE',
    // Estudiante specific
    carrera: '',
    ciclo: '1',
    codigo: '',
    // Docente specific
    especialidad: '',
    departamento: ''
  });

  const getFilteredUsers = () => {
    return (appState.usuarios || []).filter(u => u.rol === activeRole);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }

    const baseUser = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      rol: formData.rol,
      estado: 'activo',
    };

    let userObj: any = { ...baseUser };

    if (formData.rol === 'ESTUDIANTE') {
      userObj = { ...userObj, carrera: formData.carrera, ciclo: parseInt(formData.ciclo), codigo: formData.codigo };
    } else {
      userObj = { ...userObj, especialidad: formData.especialidad, departamento: formData.departamento };
    }

    if (editingId) {
       updateAppState({
         usuarios: (appState.usuarios || []).map(u => u.id === editingId ? { ...u, ...userObj } : u)
       });
       toast.success('Usuario actualizado');
    } else {
       if(!formData.password) {
         toast.error('La contraseña es obligatoria para usuarios nuevos');
         return;
       }
       userObj = { ...userObj, id: `${formData.rol.toLowerCase()}-${Date.now()}`, createdAt: new Date().toISOString() };
       updateAppState({
         usuarios: [...(appState.usuarios || []), userObj]
       });
       toast.success('Usuario creado con éxito');
    }

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({nombre: '', apellido: '', email: '', password: '', rol: activeRole, carrera: '', ciclo: '1', codigo: '', especialidad: '', departamento: ''});
    setEditingId(null);
  };

  const handleEdit = (user: any) => {
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: '',
      rol: user.rol,
      carrera: user.carrera || '',
      ciclo: user.ciclo?.toString() || '1',
      codigo: user.codigo || '',
      especialidad: user.especialidad || '',
      departamento: user.departamento || ''
    });
    setEditingId(user.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if(confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}?`)) {
      updateAppState({
         usuarios: (appState.usuarios || []).filter(u => u.id !== id)
      });
      toast.success('Usuario eliminado');
    }
  };

  if(user?.rol !== UserRole.ADMIN) {
    return <MainLayout><div className="p-6">Acceso Denegado</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Crea, edita o elimina cuentas de estudiantes y docentes.</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveRole('ESTUDIANTE')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeRole === 'ESTUDIANTE' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Estudiantes
                </button>
                <button 
                  onClick={() => setActiveRole('DOCENTE')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeRole === 'DOCENTE' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Docentes
                </button>
              </div>

              <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if(!open) resetForm();
                else setFormData({...formData, rol: activeRole});
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir {activeRole === 'ESTUDIANTE' ? 'Estudiante' : 'Docente'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>
                      Completa los detalles institucionales. Las credenciales de acceso servirán para el login.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <Input required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Apellido</label>
                        <Input required value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="mt-1" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Correo Electrónico (Login)</label>
                        <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1" />
                      </div>
                      {!editingId && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Contraseña Inicial</label>
                          <Input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1" />
                        </div>
                      )}
                    </div>

                    {formData.rol === 'ESTUDIANTE' && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="col-span-2 md:col-span-1">
                          <label className="text-sm font-medium">Código Universitario</label>
                          <Input required value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="mt-1" />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="text-sm font-medium">Ciclo Actual</label>
                          <Input required type="number" min="1" max="10" value={formData.ciclo} onChange={e => setFormData({...formData, ciclo: e.target.value})} className="mt-1" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Carrera</label>
                          <Input required value={formData.carrera} onChange={e => setFormData({...formData, carrera: e.target.value})} className="mt-1" />
                        </div>
                      </div>
                    )}

                    {formData.rol === 'DOCENTE' && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Departamento Académico</label>
                          <Input required value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} className="mt-1" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium">Especialidad</label>
                          <Input required value={formData.especialidad} onChange={e => setFormData({...formData, especialidad: e.target.value})} className="mt-1" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                      <Button type="submit" className="bg-blue-900">{editingId ? 'Actualizar' : 'Crear Usuario'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                     <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Nombre</th>
                        <th className="px-4 py-3">Email</th>
                        {activeRole === 'ESTUDIANTE' && <th className="px-4 py-3">Carrera</th>}
                        {activeRole === 'ESTUDIANTE' && <th className="px-4 py-3">Ciclo</th>}
                        {activeRole === 'DOCENTE' && <th className="px-4 py-3">Especialidad</th>}
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 rounded-tr-lg text-right">Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     {getFilteredUsers()?.length === 0 ? (
                       <tr><td colSpan={6} className="py-8 text-center text-gray-400">No se encontraron usuarios</td></tr>
                     ) : (
                       getFilteredUsers()?.map((u: any) => (
                         <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                           <td className="px-4 py-3 font-medium text-gray-900 border-l-4 border-transparent hover:border-blue-500">{u.nombre} {u.apellido}</td>
                           <td className="px-4 py-3 text-blue-600">{u.email}</td>
                           {activeRole === 'ESTUDIANTE' && <td className="px-4 py-3">{u.carrera}</td>}
                           {activeRole === 'ESTUDIANTE' && <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Ciclo {u.ciclo}</span></td>}
                           {activeRole === 'DOCENTE' && <td className="px-4 py-3">{u.especialidad}</td>}
                           <td className="px-4 py-3"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">{u.estado}</span></td>
                           <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                                <Edit2 className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id, u.nombre)}>
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                              </Button>
                           </td>
                         </tr>
                       ))
                     )}
                  </tbody>
                </table>
             </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
