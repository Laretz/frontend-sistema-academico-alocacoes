import api from "@/lib/api";

export interface SubmitFeedbackPayload {
  npsScore: number; // 0..10
  comment: string;
  page?: string;
  feature?: string;
  metadata?: any;
}

export const feedbackService = {
  submit: async (payload: SubmitFeedbackPayload) => {
    const res = await api.post("/feedback", payload);
    return res.data;
  },
  list: async (params?: { page?: string; feature?: string; limit?: number }) => {
    const res = await api.get("/feedback", { params });
    return res.data as { feedbacks: Array<{ id: string; npsScore: number; comment: string; page?: string | null; feature?: string | null; created_at: string; user?: { id: string; nome: string; email: string; role: string } }> };
  },
  metrics: async (params?: { page?: string; feature?: string }) => {
    const res = await api.get("/feedback/metrics", { params });
    return res.data as { total: number; averageNps: number | null; promoters: number; passives: number; detractors: number; byFeature: Array<{ feature: string | null; count: number; avgNps: number | null }>; byPage: Array<{ page: string | null; count: number; avgNps: number | null }> };
  },
};