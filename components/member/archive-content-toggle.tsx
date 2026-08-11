"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ToggleAction = () => Promise<{ saved: boolean }>;
export function ArchiveContentToggle({ initialSaved, action, label }: { initialSaved: boolean; action: ToggleAction; label: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  return <button className={`icon-button archive-toggle ${saved ? "is-saved" : ""}`} aria-label={saved ? `Remover ${label} do Meu Arquivo` : `Salvar ${label} no Meu Arquivo`} aria-pressed={saved} disabled={pending} onClick={() => startTransition(async () => { const result = await action(); setSaved(result.saved); router.refresh(); })}><Bookmark fill={saved ? "currentColor" : "none"} /></button>;
}
