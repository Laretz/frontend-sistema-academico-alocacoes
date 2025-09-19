"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

interface AuthHydrationProps {
  children: React.ReactNode;
}

export function AuthHydration({ children }: AuthHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Garantir que estamos no cliente
    if (typeof window !== "undefined") {
      // Verificar autenticação após hidratação
      checkAuth();
      setIsHydrated(true);
    }
  }, [checkAuth]);

  // Mostrar loading durante hidratação
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}