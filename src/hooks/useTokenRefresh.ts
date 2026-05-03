'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

const REFRESH_INTERVAL = 8 * 60 * 1000;

export function useTokenRefresh() {
  const { isAuthenticated, token } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const { refreshToken: storeRefreshToken } = useAuthStore();

  const refreshToken = useCallback(async () => {
    try {
      const success = await storeRefreshToken();
      
      if (success) {
        lastRefreshRef.current = Date.now();
        return true;
      } else {
        console.error('❌ Erro ao renovar token');
        toast.error('Sessão expirada. Faça login novamente.');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      toast.error('Sessão expirada. Faça login novamente.');
      return false;
    }
  }, [storeRefreshToken]);

  const startRefreshTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (isAuthenticated && token) {
        refreshToken();
      }
    }, REFRESH_INTERVAL);
  }, [isAuthenticated, token, refreshToken]);

  const stopRefreshTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const manualRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;
    
    if (timeSinceLastRefresh < 30000) {
      return false;
    }
    
    return await refreshToken();
  }, [refreshToken]);

  useEffect(() => {
    if (isAuthenticated && token) {
      startRefreshTimer();
      lastRefreshRef.current = Date.now();
    } else {
      stopRefreshTimer();
    }

    return () => {
      stopRefreshTimer();
    };
  }, [isAuthenticated, token, startRefreshTimer, stopRefreshTimer]);

  return {
    refreshToken: manualRefresh,
    isRefreshActive: !!intervalRef.current
  };
}
