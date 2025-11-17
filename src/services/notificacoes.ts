import api from "@/lib/api";
import {
  Notificacao,
  NotificacaoStatus,
  ListarNotificacoesResponse,
  ResponderNotificacaoRequest,
  ResponderNotificacaoResponse,
  CriarNotificacaoRequest,
  CriarNotificacaoResponse,
} from "@/types/notificacao";

export const notificacoesService = {
  listar: async (status?: NotificacaoStatus): Promise<ListarNotificacoesResponse> => {
    const params = status ? { status } : undefined;
    const response = await api.get<ListarNotificacoesResponse>("/notificacoes", { params });
    return response.data;
  },

  marcarLida: async (id: string): Promise<{ notificacao: Notificacao | null }> => {
    const response = await api.patch<{ notificacao: Notificacao | null }>(`/notificacoes/${id}/read`);
    return response.data;
  },

  responder: async (id: string, data: ResponderNotificacaoRequest): Promise<ResponderNotificacaoResponse> => {
    const response = await api.post<ResponderNotificacaoResponse>(`/notificacoes/${id}/respond`, data);
    return response.data;
  },

  criar: async (data: CriarNotificacaoRequest): Promise<CriarNotificacaoResponse> => {
    const response = await api.post<CriarNotificacaoResponse>(`/notificacoes`, data);
    return response.data;
  },
};