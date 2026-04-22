'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      redirect('/dashboard');
    }
  }, [isAuthenticated]);

  return <LoginForm />;
}
