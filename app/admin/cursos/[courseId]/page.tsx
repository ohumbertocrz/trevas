import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, CirclePlus, Pencil, Settings2 } from "lucide-react";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { createLesson, createModule, moveLesson, moveModule, updateCourse, updateModule } from "../actions";

export const dynamic = "force-dynamic";

const statusLabel = { draft: "Rascunho", published: "Publicado", unpublished: "Despublicado", scheduled: "Agendado" } as const;

export default async function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const [course, modules] = await Promise.all([contentRepository.getCourse(courseId), contentRepository.listModules(courseId)]);
  if (!course) notFound();
  const lessonsByModule = new Map((await Promise.all(modules.map(async (module) => [module.id, await contentRepository.listLessons(module.id)] as const))));

  return (
    <div className="admin-page content-admin-page">
      <Link href="/admin/cursos" className="back-link"><ArrowLeft size={16} />Cursos</Link>
      <header className="page-heading">
        <div><span className="kicker">Editor de curso</span><h1>{course.title}</h1><p>{course.moduleCount} módulos · {course.lessonCount} aulas</p></div>
        <span className={`status large-status ${course.status === "published" ? "" : "warning"}`}>{statusLabel[course.status]}</span>
      </header>

      <details className="panel cms-settings">
        <summary><Settings2 size={17} /><span>Configurações do curso</span></summary>
        <form className="cms-form form-grid" action={updateCourse}>
          <input type="hidden" name="courseId" value={course.id} />
          <label>Nome<input name="title" defaultValue={course.title} required minLength={3} maxLength={120} /></label>
          <label>Slug<input name="slug" defaultValue={course.slug} maxLength={140} /></label>
          <label className="full-field">Descrição<textarea name="description" defaultValue={course.description} rows={4} maxLength={2000} /></label>
          <label>Status<select name="status" defaultValue={course.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>
          <div className="form-actions"><button className="primary-button" type="submit">Salvar curso</button></div>
        </form>
      </details>

      <section className="cms-section-heading"><div><span className="kicker">Estrutura</span><h2>Módulos e aulas</h2></div></section>
      <div className="module-admin-list">
        {modules.map((module, moduleIndex) => {
          const lessons = lessonsByModule.get(module.id) ?? [];
          return (
            <article className="panel module-admin-card" key={module.id}>
              <header className="module-admin-header">
                <span className="module-order">{String(moduleIndex + 1).padStart(2, "0")}</span>
                <span className="module-admin-title"><strong>{module.title}</strong><small>{module.lessonCount} aulas · {statusLabel[module.status]}</small></span>
                <div className="reorder-actions">
                  <form action={moveModule}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><input type="hidden" name="direction" value="up" /><button className="icon-button bordered" disabled={moduleIndex === 0} title="Mover módulo para cima" aria-label="Mover módulo para cima"><ArrowUp size={16} /></button></form>
                  <form action={moveModule}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><input type="hidden" name="direction" value="down" /><button className="icon-button bordered" disabled={moduleIndex === modules.length - 1} title="Mover módulo para baixo" aria-label="Mover módulo para baixo"><ArrowDown size={16} /></button></form>
                </div>
              </header>

              <div className="lesson-admin-list">
                {lessons.length === 0 && <p className="inline-empty">Nenhuma aula neste módulo.</p>}
                {lessons.map((lesson, lessonIndex) => (
                  <div className="lesson-admin-row" key={lesson.id}>
                    <span className="lesson-order">{lessonIndex + 1}</span>
                    <span className="lesson-admin-title"><strong>{lesson.title}</strong><small>{lesson.durationMinutes ? `${lesson.durationMinutes} min · ` : ""}{statusLabel[lesson.status]}</small></span>
                    <div className="reorder-actions">
                      <form action={moveLesson}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="direction" value="up" /><button className="icon-button" disabled={lessonIndex === 0} title="Mover aula para cima" aria-label="Mover aula para cima"><ArrowUp size={15} /></button></form>
                      <form action={moveLesson}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><input type="hidden" name="lessonId" value={lesson.id} /><input type="hidden" name="direction" value="down" /><button className="icon-button" disabled={lessonIndex === lessons.length - 1} title="Mover aula para baixo" aria-label="Mover aula para baixo"><ArrowDown size={15} /></button></form>
                      <Link className="icon-button" href={`/admin/cursos/${course.id}/aulas/${lesson.id}`} title="Editar aula" aria-label={`Editar ${lesson.title}`}><Pencil size={15} /></Link>
                    </div>
                  </div>
                ))}
              </div>

              <footer className="module-admin-footer">
                <details className="inline-editor"><summary className="text-link"><Pencil size={14} />Editar módulo</summary><form className="cms-form compact-form" action={updateModule}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><label>Título<input name="title" defaultValue={module.title} required /></label><label>Descrição<textarea name="description" defaultValue={module.description} rows={3} /></label><label>Status<select name="status" defaultValue={module.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label><button className="ghost-button" type="submit">Salvar módulo</button></form></details>
                <details className="inline-editor"><summary className="text-link"><CirclePlus size={14} />Nova aula</summary><form className="cms-form compact-form inline-create" action={createLesson}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><label>Título da aula<input name="title" required minLength={3} /></label><button className="primary-button" type="submit">Criar e editar</button></form></details>
              </footer>
            </article>
          );
        })}
      </div>

      <details className="panel add-module-panel" open={modules.length === 0}>
        <summary><CirclePlus size={17} />Adicionar módulo</summary>
        <form className="cms-form form-grid" action={createModule}>
          <input type="hidden" name="courseId" value={course.id} />
          <label>Título<input name="title" required minLength={3} maxLength={140} /></label>
          <label className="full-field">Descrição<textarea name="description" rows={3} maxLength={2000} /></label>
          <div className="form-actions"><button className="primary-button" type="submit"><BookOpen size={16} />Criar módulo</button></div>
        </form>
      </details>
    </div>
  );
}
