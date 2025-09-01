"use client";

import { useAuthPersistence } from "@/hooks/useAuthPersistence";
import { AuthHydration } from "./AuthHydration";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthPersistence();

  return (
    <AuthHydration>
      {children}
    </AuthHydration>
  );
}
