"use client";

import { Clock3, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { createLessonNote, deleteLessonNote } from "@/app/app/aula/actions";
import { getCurrentVimeoTime } from "@/components/member/vimeo-progress-player";

function formatTime(seconds: number | null) {
  if (seconds === null) return "--:--";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function LessonNotes({ lessonId, slug, notes }: { lessonId: string; slug: string; notes: Array<{ id: string; content: string; timestampSeconds: number | null; createdAt: string | null }> }) {
  const [saveTimestamp, setSaveTimestamp] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const currentTime = saveTimestamp ? await getCurrentVimeoTime() : null;
      formData.set("timestampSeconds", currentTime === null ? "" : String(Math.floor(currentTime)));
      await createLessonNote(formData);
      form.reset();
      setSaveTimestamp(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar a anotação.");
    } finally {
      setPending(false);
    }
  }

  return <section className="lesson-notes"><div className="lesson-notes-heading"><div><span className="kicker">Caderno privado</span><h2>Anotações da aula</h2></div><small>Visíveis somente para você</small></div><form className="panel note-form" onSubmit={submit}><input type="hidden" name="lessonId" value={lessonId} /><input type="hidden" name="slug" value={slug} /><input type="hidden" name="timestampSeconds" value="" /><label>Anotação<textarea name="content" rows={4} required maxLength={5000} placeholder="Registre uma ideia, dúvida ou conexão..." /></label><label className="note-timecode-toggle"><input type="checkbox" checked={saveTimestamp} onChange={(event) => setSaveTimestamp(event.target.checked)} />Salvar o timecode atual do vídeo automaticamente</label><small className="note-timecode-hint">Se ativado, a posição será capturada no momento do salvamento.</small><button className="primary-button" type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar anotação"}</button>{message && <p className="form-error">{message}</p>}</form>{notes.length > 0 && <div className="notes-list">{notes.map((note) => <article className="panel note-item" key={note.id}><div>{note.timestampSeconds !== null && <a className="note-timestamp" href={`/app/aula/${slug}?t=${Math.floor(note.timestampSeconds)}`}><Clock3 size={14} />{formatTime(note.timestampSeconds)}</a>}<p>{note.content}</p><small>{note.createdAt ? new Date(note.createdAt).toLocaleDateString("pt-BR") : "Agora"}</small></div><form action={deleteLessonNote}><input type="hidden" name="noteId" value={note.id} /><input type="hidden" name="slug" value={slug} /><button className="icon-button" type="submit" aria-label="Excluir anotação"><Trash2 size={16} /></button></form></article>)}</div>}</section>;
}
