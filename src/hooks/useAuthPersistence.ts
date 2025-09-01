'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function useAuthPersistence() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Verificar autenticação quando a aba ganha foco
    const handleFocus = () => {
      checkAuth();
    };

    // Verificar autenticação quando a página fica visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // Adicionar event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth]);
}