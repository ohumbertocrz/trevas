import { ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/application/access/session";
import { ArchiveToggleButton } from "@/components/member/archive-toggle-button";
import { LessonNotes } from "@/components/member/lesson-notes";
import { VimeoProgressPlayer } from "@/components/member/vimeo-progress-player";
import { isVimeoEmbedUrl } from "@/domain/content/entities";
import { memberContentRepository } from "@/infrastructure/repositories/firebase-member-content-repository";
import { progressRepository } from "@/infrastructure/repositories/firebase-progress-repository";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";
import { lessonNoteRepository } from "@/infrastructure/repositories/firebase-lesson-note-repository";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ t?: string }> }) {
  const { slug } = await params;
  const timestamp = Number((await searchParams).t ?? 0);
  const context = await memberContentRepository.getPublishedLessonBySlug(slug);
  if (!context) notFound();
  const { course, module, lesson, materials, previous, next } = context;
  const user = await getAuthenticatedUser();
  const progress = user ? await progressRepository.getLessonProgress(user.id, lesson.id) : null;
  const archived = user ? await archiveRepository.getForUser(user.id, "lesson", lesson.id) : null;
  const notes = user ? await lessonNoteRepository.listForLesson(user.id, lesson.id) : [];

  return (
    <div className="page lesson-page">
      <Link className="back-link" href="/app/curso"><ArrowLeft size={14} />Voltar para o curso</Link>
      <header className="page-heading"><div><span className="kicker">Módulo {String(module.order).padStart(2, "0")} | {module.title}</span><h1>{lesson.title}</h1>{lesson.subtitle && <p>{lesson.subtitle}</p>}</div><ArchiveToggleButton lessonId={lesson.id} initialSaved={Boolean(archived)} /></header>
      {lesson.vimeoEmbedUrl && isVimeoEmbedUrl(lesson.vimeoEmbedUrl) ? (
        <VimeoProgressPlayer embedUrl={lesson.vimeoEmbedUrl} lessonId={lesson.id} title={lesson.title} initialPositionSeconds={timestamp > 0 ? timestamp : progress?.lastPositionSeconds ?? 0} initialPercent={progress?.percent ?? 0} initialCompleted={progress?.completed ?? false} />
      ) : (
        <section className="panel lesson-media-empty">Vídeo ainda não disponível.</section>
      )}
      {(lesson.description || lesson.tags.length > 0) && <section className="lesson-reading"><div><span className="kicker">{course.title}</span>{lesson.description && <p>{lesson.description}</p>}</div>{lesson.tags.length > 0 && <div className="lesson-tags">{lesson.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}</section>}
      {lesson.transcript && <details className="panel transcript-panel"><summary>Transcrição</summary><div>{lesson.transcript}</div></details>}
      {materials.length > 0 && <section className="lesson-materials"><span className="kicker">Materiais</span><div className="lesson-material-list">{materials.map((material) => <a className="lesson-material" href={material.sourceUrl} target="_blank" rel="noreferrer" key={material.id}><FileText size={17} /><span><strong>{material.title}</strong><small>{material.description || "Material complementar"}</small></span><ExternalLink size={15} /></a>)}</div></section>}
      {user && <LessonNotes lessonId={lesson.id} slug={lesson.slug} notes={notes.map((note) => ({ id: note.id, content: note.content, timestampSeconds: note.timestampSeconds, createdAt: note.createdAt?.toISOString() ?? null }))} />}
      <nav className="lesson-navigation" aria-label="Navegação entre aulas">
        {previous ? <Link className="ghost-button" href={`/app/aula/${previous.slug}`}><ArrowLeft size={15} />Aula anterior</Link> : <span />}
        {next ? <Link className="primary-button" href={`/app/aula/${next.slug}`}>Próxima aula<ArrowRight size={15} /></Link> : <Link className="primary-button" href="/app/curso">Voltar ao curso<ArrowRight size={15} /></Link>}
      </nav>
    </div>
  );
}
