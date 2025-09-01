"use client";

import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export function AuthDebug() {
  const { user, token, isAuthenticated } = useAuthStore();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [cookieData, setCookieData] = useState<string>("");

  useEffect(() => {
    const updateDebugInfo = () => {
      if (typeof window !== "undefined") {
        setLocalStorageData({
          token: localStorage.getItem("token"),
          user: localStorage.getItem("user"),
        });
        setCookieData(document.cookie);
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug</h3>
      
      <div className="mb-2">
        <strong>Zustand State:</strong>
        <div>isAuthenticated: {isAuthenticated ? "✅" : "❌"}</div>
        <div>user: {user ? "✅ " + user.nome : "❌"}</div>
        <div>token: {token ? "✅ [PRESENTE]" : "❌"}</div>
      </div>

      <div className="mb-2">
        <strong>localStorage:</strong>
        <div>token: {localStorageData.token ? "✅ [PRESENTE]" : "❌"}</div>
        <div>user: {localStorageData.user ? "✅ [PRESENTE]" : "❌"}</div>
      </div>

      <div>
        <strong>Cookies:</strong>
        <div className="break-all">
          {cookieData.includes("token=") ? "✅ token encontrado" : "❌ token ausente"}
        </div>
      </div>
    </div>
  );
}