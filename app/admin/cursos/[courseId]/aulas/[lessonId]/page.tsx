import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { CONTENT_STATUSES, isVimeoEmbedUrl } from "@/domain/content/entities";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";
import { updateLesson } from "../../../actions";
import { TranscriptControls } from "@/components/admin/transcript-controls";
import { TranscriptMediaUpload } from "@/components/admin/transcript-media-upload";

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
  const [modules, materials, linkedMaterials] = await Promise.all([
    contentRepository.listModules(courseId),
    libraryRepository.listMaterials(),
    libraryRepository.listMaterialsForLesson(lesson.id),
  ]);
  const linkedIds = new Set(linkedMaterials.map((material) => material.id));

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
        <label className="full-field">Conteúdo da aula<textarea name="description" defaultValue={lesson.description} rows={8} maxLength={8000} placeholder="Escreva aqui o conteúdo que aparecerá na página da aula." /></label>
        <label>Embed do Vimeo<input name="vimeoEmbedUrl" type="text" defaultValue={lesson.vimeoEmbedUrl} maxLength={4000} placeholder="Cole o iframe ou a URL player.vimeo.com/video/..." /></label>
        <label>Duração em minutos<input name="durationMinutes" type="number" defaultValue={lesson.durationMinutes} min={0} max={1440} /></label>
        <input type="hidden" name="thumbnailPath" value={lesson.thumbnailPath} />
        <label className="full-field">Thumbnail (JPG, PNG ou WebP, até 2 MB)<input name="thumbnail" type="file" accept="image/jpeg,image/png,image/webp" /></label>
        {lesson.thumbnailPath && <div className="media-preview full-field"><img src={`/api/media/lesson-thumbnail/${lesson.id}`} alt={`Thumbnail de ${lesson.title}`} /></div>}
        {isVimeoEmbedUrl(lesson.vimeoEmbedUrl) && lesson.vimeoEmbedUrl && <div className="vimeo-preview full-field"><iframe src={lesson.vimeoEmbedUrl} title={`Prévia de ${lesson.title}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>}
        <label className="full-field">Tags, separadas por vírgula<input name="tags" defaultValue={lesson.tags.join(", ")} maxLength={1000} /></label>
        <fieldset className="material-picker full-field"><legend>Materiais vinculados</legend>{materials.length === 0 ? <p className="inline-empty">Nenhum material cadastrado na Biblioteca.</p> : materials.map((material) => <label className="material-option" key={material.id}><input type="checkbox" name="materialIds" value={material.id} defaultChecked={linkedIds.has(material.id)} /><span><strong>{material.title}</strong><small>{material.type} · {material.visibility === "published" ? "Publicado" : "Rascunho"}</small></span></label>)}</fieldset>
        <label className="full-field">Transcrição<textarea name="transcript" defaultValue={lesson.transcript} rows={14} maxLength={200000} /></label>
        <div className="full-field"><span className="field-label">Mídia para transcrição</span><TranscriptMediaUpload courseId={course.id} lessonId={lesson.id} initialPath={lesson.transcriptMediaPath} /></div>
        <TranscriptControls lessonId={lesson.id} status={lesson.transcriptStatus} hasMedia={Boolean(lesson.transcriptMediaPath)} draft={lesson.transcriptDraft} />
        <label>Status<select name="status" defaultValue={lesson.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
        <label>Publicação agendada<input name="scheduledAt" type="datetime-local" defaultValue={localDateTime(lesson.scheduledAt)} /></label>
        <div className="form-actions full-field"><button className="primary-button" type="submit"><Save size={16} />Salvar aula</button></div>
      </form>
    </div>
  );
}
