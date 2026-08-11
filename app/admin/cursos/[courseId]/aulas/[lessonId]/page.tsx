import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { updateLesson } from "../../../actions";

export const dynamic = "force-dynamic";

const statusLabel = { draft: "Rascunho", published: "Publicado", unpublished: "Despublicado", scheduled: "Agendado" } as const;

function localDateTime(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function LessonEditorPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const [course, lesson] = await Promise.all([contentRepository.getCourse(courseId), contentRepository.getLesson(lessonId)]);
  if (!course || !lesson || lesson.courseId !== courseId) notFound();
  const modules = await contentRepository.listModules(courseId);

  return (
    <div className="admin-page content-admin-page lesson-editor-page">
      <Link href={`/admin/cursos/${course.id}`} className="back-link"><ArrowLeft size={16} />{course.title}</Link>
      <header className="page-heading"><div><span className="kicker">Editor de aula</span><h1>{lesson.title}</h1><p>Alterações permanecem privadas até a publicação.</p></div><span className={`status large-status ${lesson.status === "published" ? "" : "warning"}`}>{statusLabel[lesson.status]}</span></header>

      <form className="panel cms-form lesson-form form-grid" action={updateLesson}>
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="courseId" value={course.id} />
        <label>Título<input name="title" defaultValue={lesson.title} required minLength={3} maxLength={160} /></label>
        <label>Subtítulo<input name="subtitle" defaultValue={lesson.subtitle} maxLength={200} /></label>
        <label>Slug<input name="slug" defaultValue={lesson.slug} maxLength={180} /></label>
        <label>Módulo<select name="moduleId" defaultValue={lesson.moduleId}>{modules.map((module) => <option key={module.id} value={module.id}>{module.order}. {module.title}</option>)}</select></label>
        <label className="full-field">Descrição<textarea name="description" defaultValue={lesson.description} rows={5} maxLength={8000} /></label>
        <label>Vimeo ID ou URL<input name="vimeoId" defaultValue={lesson.vimeoId} maxLength={500} /></label>
        <label>Duração em minutos<input name="durationMinutes" type="number" defaultValue={lesson.durationMinutes} min={0} max={1440} /></label>
        <label className="full-field">Thumbnail URL<input name="thumbnailUrl" type="url" defaultValue={lesson.thumbnailUrl} maxLength={1000} /></label>
        <label className="full-field">Tags, separadas por vírgula<input name="tags" defaultValue={lesson.tags.join(", ")} maxLength={1000} /></label>
        <label className="full-field">Transcrição<textarea name="transcript" defaultValue={lesson.transcript} rows={14} maxLength={200000} /></label>
        <label>Status<select name="status" defaultValue={lesson.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
        <label>Publicação agendada<input name="scheduledAt" type="datetime-local" defaultValue={localDateTime(lesson.scheduledAt)} /></label>
        <div className="form-actions full-field"><button className="primary-button" type="submit"><Save size={16} />Salvar aula</button></div>
      </form>
    </div>
  );
}
