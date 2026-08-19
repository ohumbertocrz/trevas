"use client";

import { Bookmark, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type ToggleAction = () => Promise<{ saved: boolean }>;
export function ArchiveContentToggle({ initialSaved, action, label }: { initialSaved: boolean; action: ToggleAction; label: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => { if (!feedback) return; const timeout = window.setTimeout(() => setFeedback(null), 4200); return () => window.clearTimeout(timeout); }, [feedback]);
  const actionLabel = saved ? `Remover ${label} do Meu Arquivo` : `Salvar ${label} no Meu Arquivo`;
  return <>
    <button className={`icon-button archive-toggle ${saved ? "is-saved" : ""}`} aria-label={actionLabel} aria-pressed={saved} data-tooltip={actionLabel} disabled={pending} onClick={() => startTransition(async () => { const result = await action(); setSaved(result.saved); setFeedback(result.saved ? "Você salvou esse conteúdo no Meu Arquivo para revisitar" : "Conteúdo removido do Meu Arquivo"); router.refresh(); })}><Bookmark fill={saved ? "currentColor" : "none"} /></button>
    {feedback && <div className="archive-feedback" role="status"><Check size={16} />{feedback}</div>}
  </>;
}
