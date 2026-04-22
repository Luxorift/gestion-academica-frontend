import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useAppData } from '@/lib/hooks/useAppData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { appState, updateAppState } = useAppData();
  const router = useRouter();

  // Reset Password State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resettingUser, setResettingUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    setIsLoading(true);
    try {
      const response = await login(email, password);
      if (response.error) {
        toast.error(response.error);
        setIsLoading(false);
        return;
      }
      toast.success('¡Bienvenido a NuevaSchool!');
      if (response.user) {
        setTimeout(() => { router.push('/dashboard'); }, 500);
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  const handleSendCode = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error('Por favor ingresa un formato de correo electrónico válido');
      return;
    }
    const user = (appState.usuarios || []).find(u => u.email === resetEmail);
    if (!user) {
      toast.error('El correo no se encuentra registrado en el sistema');
      return;
    }
    if (user.rol === 'ADMIN' && !resetEmail.endsWith('@nuevaschool.pe')) {
      toast.error('Solo el administrador principal puede usar el dominio @nuevaschool.pe');
      return;
    }
    setResettingUser(user);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedCode(code);
    toast.success(`Código de recuperación enviado a ${resetEmail} (CÓDIGO: ${code})`, { duration: 10000 });
    setResetStep(2);
  };

  const handleVerifyCode = () => {
    if (resetCode !== expectedCode) {
      toast.error('Código incorrecto');
      return;
    }
    toast.success('Código verificado correctamente');
    setResetStep(3);
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Update user password
    updateAppState({
      usuarios: (appState.usuarios || []).map(u =>
        u.id === resettingUser.id ? { ...u, password: newPassword } : u
      )
    });

    toast.success('¡Contraseña actualizada exitosamente!');
    setIsResetOpen(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResettingUser(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">NS</span>
          </div>
          <CardTitle className="text-2xl">NuevaSchool</CardTitle>
          <CardDescription>Ingresa a tu cuenta para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="correo@nuevaschool.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              {resetStep === 1 && "Ingresa tu correo institucional. Te enviaremos un código de seguridad para verificar tu identidad."}
              {resetStep === 2 && "Ingresa el código de 6 dígitos que enviamos a tu correo institucional."}
              {resetStep === 3 && "Crea una nueva contraseña segura para tu cuenta."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {resetStep === 1 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo Electrónico</label>
                  <Input
                    placeholder="ejemplo@gmail.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-blue-900" onClick={handleSendCode}>Enviar Código de Recuperación</Button>
              </>
            )}

            {resetStep === 2 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código de 6 dígitos</label>
                  <Input
                    placeholder="123456"
                    maxLength={6}
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    className="text-center tracking-[0.5em] font-bold text-lg"
                  />
                </div>
                <Button className="w-full bg-blue-900" onClick={handleVerifyCode}>Verificar Código</Button>
              </>
            )}

            {resetStep === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva Contraseña</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Repetir Nueva Contraseña</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-blue-900" onClick={handleResetPassword}>Actualizar Contraseña</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

