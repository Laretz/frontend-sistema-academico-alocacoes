'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

export function useAuthPersistence() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleFocus = () => {
      checkAuth();
    };

    // verificar autenticação quando a página fica visível
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    // adicionar event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth]);
}