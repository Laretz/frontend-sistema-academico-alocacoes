"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { notificacoesService } from "@/services/notificacoes";

export function NotificationBell() {
  const router = useRouter();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCount = async () => {
    setLoading(true);
    try {
      const { notificacoes } = await notificacoesService.listar("PENDENTE");
      setCount(notificacoes.length);
    } catch (e) {
      // silencioso para não poluir header
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000); // atualizar a cada 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <Button
      variant="ghost"
      className="relative"
      onClick={() => router.push("/notificacoes")}
      aria-label="Notificações"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1">
          <Badge variant="destructive" className="px-1 py-0 text-[10px]">
            {count}
          </Badge>
        </span>
      )}
    </Button>
  );
}