"use client";

import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";

export default function FeedbackPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Envie seu feedback</h1>
      <p className="text-sm text-muted-foreground">
        Você pode usar o botão no cabeçalho a qualquer momento, ou enviar por aqui.
      </p>
      <FeedbackWidget />
    </div>
  );
}