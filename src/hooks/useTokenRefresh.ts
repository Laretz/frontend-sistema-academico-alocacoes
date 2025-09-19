'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Token expira em 10 minutos, vamos renovar a cada 8 minutos (480 segundos)
const REFRESH_INTERVAL = 8 * 60 * 1000; // 8 minutos em millisegundos
const TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutos em millisegundos

export function useTokenRefresh() {
  const { isAuthenticated, token, logout } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const { refreshToken: storeRefreshToken } = useAuthStore();

  const refreshToken = useCallback(async () => {
    try {
      console.log('🔄 Tentando renovar token...');
      
      const success = await storeRefreshToken();
      
      if (success) {
        lastRefreshRef.current = Date.now();
        console.log('✅ Token renovado com sucesso');
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
    // Limpar timer existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Iniciar novo timer
    intervalRef.current = setInterval(() => {
      if (isAuthenticated && token) {
        refreshToken();
      }
    }, REFRESH_INTERVAL);

    console.log('⏰ Timer de refresh iniciado (renovação a cada 8 minutos)');
  }, [isAuthenticated, token, refreshToken]);

  const stopRefreshTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Timer de refresh parado');
    }
  }, []);

  // Função para refresh manual (útil para interceptors)
  const manualRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshRef.current;
    
    // Evitar múltiplos refreshs muito próximos (menos de 30 segundos)
    if (timeSinceLastRefresh < 30000) {
      console.log('⚠️ Refresh muito recente, ignorando...');
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

    // Cleanup ao desmontar
    return () => {
      stopRefreshTimer();
    };
  }, [isAuthenticated, token, startRefreshTimer, stopRefreshTimer]);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      stopRefreshTimer();
    };
  }, [stopRefreshTimer]);

  return {
    refreshToken: manualRefresh,
    isRefreshActive: !!intervalRef.current
  };
}