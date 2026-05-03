import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { userService } from "@/services/users";
import type { User as UserType } from "@/types/auth";
import { useAuthStore } from "@/store/auth";

type ProfileFormData = {
  nome: string;
  email: string;
  especializacao?: string;
};

export function usePerfil() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [userData, setUserData] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    nome: "",
    email: "",
    especializacao: "",
  });

  const carregar = useCallback(async () => {
    if (!userId) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await userService.getById(userId);
      setUserData(response);
      setFormData({
        nome: response.nome || "",
        email: response.email || "",
        especializacao: response.especializacao || "",
      });
    } catch {
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const iniciarEdicao = () => setIsEditing(true);

  const cancelarEdicao = () => {
    if (userData) {
      setFormData({
        nome: userData.nome || "",
        email: userData.email || "",
        especializacao: userData.especializacao || "",
      });
    }
    setIsEditing(false);
  };

  const salvar = useCallback(async () => {
    if (!userId) return;
    try {
      setSaving(true);
      await userService.update(userId, formData);
      await carregar();
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  }, [carregar, formData, userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return {
    user,
    userData,
    isEditing,
    loading,
    saving,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    salvar,
    formatDate,
  };
}

