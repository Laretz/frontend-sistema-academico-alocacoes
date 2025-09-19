"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";

export function TokenRefreshDebug() {
  const { token, isAuthenticated, refreshToken } = useAuthStore();
  const { refreshToken: manualRefresh, isRefreshActive } = useTokenRefresh();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(0);

  // Calcular tempo até próximo refresh (8 minutos = 480 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastRefresh) {
        const elapsed = Date.now() - lastRefresh.getTime();
        const remaining = Math.max(0, 480000 - elapsed); // 8 minutos em ms
        setTimeUntilRefresh(Math.floor(remaining / 1000));
      } else {
        setTimeUntilRefresh(480); // 8 minutos iniciais
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Monitorar mudanças no token para detectar refreshs
  useEffect(() => {
    if (token && isAuthenticated) {
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);
    }
  }, [token, isAuthenticated]);

  const handleManualRefresh = async () => {
    const success = await manualRefresh();
    if (success) {
      setLastRefresh(new Date());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50 bg-white shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          🔄 Token Refresh Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Autenticado" : "Não autenticado"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Refresh Ativo:</span>
          <Badge variant={isRefreshActive ? "default" : "secondary"}>
            {isRefreshActive ? (
              <><CheckCircle className="h-3 w-3 mr-1" />Ativo</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" />Inativo</>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Token:</span>
          <Badge variant={token ? "default" : "destructive"}>
            {token ? "Presente" : "Ausente"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Refreshs:</span>
          <Badge variant="outline">{refreshCount}</Badge>
        </div>

        {lastRefresh && (
          <div className="flex items-center justify-between">
            <span>Último Refresh:</span>
            <span className="text-xs text-muted-foreground">
              {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Próximo em:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timeUntilRefresh)}
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <Button 
            onClick={handleManualRefresh} 
            size="sm" 
            className="w-full"
            disabled={!isAuthenticated}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Manual
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Refresh automático a cada 8 minutos</p>
          <p>• Token expira em 10 minutos</p>
          <p>• Interceptor ativo para 401s</p>
        </div>
      </CardContent>
    </Card>
  );
}