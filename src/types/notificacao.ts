export type NotificacaoStatus = "PENDENTE" | "LIDA" | "RESPONDIDA";
export type NotificacaoType = "SOLICITACAO_TROCA_SALA" | "GENERICA";

export interface Notificacao {
  id: string;
  userId: string;
  type: NotificacaoType;
  title: string;
  message: string;
  status: NotificacaoStatus;
  replyMessage?: string | null;
  metadata?: any;
  created_at: string; // datas vêm como string no JSON
  read_at?: string | null;
  responded_at?: string | null;
}

export interface ListarNotificacoesResponse {
  notificacoes: Notificacao[];
}

export interface CriarNotificacaoRequest {
  userId: string;
  type: NotificacaoType;
  title: string;
  message: string;
  metadata?: any;
}

export interface CriarNotificacaoResponse {
  notificacao: Notificacao;
}

export interface ResponderNotificacaoRequest {
  replyMessage: string;
}

export interface ResponderNotificacaoResponse {
  notificacao: Notificacao;
}