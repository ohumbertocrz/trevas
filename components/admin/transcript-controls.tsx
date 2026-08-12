"use client";

import { Check, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TranscriptControls({ lessonId, status, hasMedia, draft }: { lessonId: string; status: string; hasMedia: boolean; draft: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function call(action: "generate" | "approve" | "reject") {
    setPending(true); setMessage(null);
    const response = await fetch(`/api/admin/transcripts/${lessonId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? data.message ?? "Atualizado." : data.error ?? "Não foi possível concluir.");
    setPending(false); if (response.ok) router.refresh();
  }
  return <div className="transcript-controls full-field">
    <div><strong>Status da preparação:</strong> {status === "none" ? "Sem preparação" : status === "review" ? "Em revisão" : status === "approved" ? "Aprovada" : status === "rejected" ? "Rejeitada" : "Processando"}</div>
    <div className="form-actions">
      <button className="ghost-button" type="button" disabled={pending || !hasMedia} onClick={() => void call("generate")}><Sparkles size={16} />Gerar com IA</button>
      {status === "review" && <><button className="primary-button" type="button" disabled={pending || !draft} onClick={() => void call("approve")}><Check size={16} />Aprovar preparação</button><button className="ghost-button" type="button" disabled={pending} onClick={() => void call("reject")}><RotateCcw size={16} />Rejeitar</button></>}
    </div>
    {message && <small className="form-message">{message}</small>}
    {!hasMedia && <small className="form-hint">Salve uma mídia de áudio ou vídeo antes de gerar.</small>}
    {draft && <details className="transcript-draft-preview"><summary>Ver rascunho gerado</summary><pre>{draft}</pre></details>}
  </div>;
}
