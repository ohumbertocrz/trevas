import { FlaskConical, Save } from "lucide-react";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { createLaboratory, updateLaboratory } from "./actions";

export const dynamic = "force-dynamic";

const statusLabel = { draft: "Rascunho", published: "Publicado", unpublished: "Despublicado", scheduled: "Agendado" } as const;

export default async function LaboratoryAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const laboratories = await laboratoryRepository.listLaboratories();
  const courses = await contentRepository.listCourses();
  const lessonOptions = (await Promise.all(courses.map(async (course) => {
    const modules = await contentRepository.listModules(course.id);
    return (await Promise.all(modules.map(async (module) => (await contentRepository.listLessons(module.id)).map((lesson) => ({ ...lesson, courseTitle: course.title, moduleTitle: module.title }))))).flat();
  }))).flat();
  const selected = edit ? laboratories.find((laboratory) => laboratory.id === edit) : null;
  return (
    <div className="admin-page content-admin-page">
      <header className="page-heading"><div><span className="kicker">Conteúdo expandido</span><h1>Laboratório</h1><p>Exercícios de análise para transformar aulas em prática.</p></div></header>
      <details className="panel cms-settings" open={!selected}><summary><FlaskConical size={17} />Novo laboratório</summary><form className="cms-form form-grid" action={createLaboratory}><label>Título<input name="title" required minLength={3} /></label><label>Slug<input name="slug" /></label><label className="full-field">Descrição<textarea name="description" rows={3} /></label><label className="full-field">Caso analisado<textarea name="caseText" rows={8} required /></label><label>Fonte<input name="source" /></label><label>Tags, separadas por vírgula<input name="tags" /></label><label className="full-field">Perguntas, uma por linha<textarea name="questions" rows={5} required placeholder="Qual é o enquadramento principal?&#10;O que está ausente?" /></label><label className="full-field">Análise oficial<textarea name="officialAnalysis" rows={8} required /></label><LessonPicker lessons={lessonOptions} /><div className="form-actions"><button className="primary-button" type="submit">Criar rascunho</button></div></form></details>
      <section className="laboratory-admin-list">{laboratories.length === 0 && <div className="panel empty-result">Nenhum laboratório cadastrado.</div>}{laboratories.map((laboratory) => <details className="panel laboratory-admin-card" open={selected?.id === laboratory.id} key={laboratory.id}><summary><span className="content-symbol"><FlaskConical size={19} /></span><span><strong>{laboratory.title}</strong><small>{laboratory.questions.length} perguntas · {statusLabel[laboratory.status]}</small></span></summary>{selected?.id === laboratory.id && <form className="cms-form form-grid" action={updateLaboratory}><input type="hidden" name="laboratoryId" value={laboratory.id} /><label>Título<input name="title" defaultValue={laboratory.title} required /></label><label>Slug<input name="slug" defaultValue={laboratory.slug} /></label><label className="full-field">Descrição<textarea name="description" defaultValue={laboratory.description} rows={3} /></label><label className="full-field">Caso analisado<textarea name="caseText" defaultValue={laboratory.caseText} rows={8} required /></label><label>Fonte<input name="source" defaultValue={laboratory.source} /></label><label>Tags, separadas por vírgula<input name="tags" defaultValue={laboratory.tags.join(", ")} /></label><label className="full-field">Perguntas, uma por linha<textarea name="questions" defaultValue={laboratory.questions.map((question) => question.prompt).join("\n")} rows={5} required /></label><label className="full-field">Análise oficial<textarea name="officialAnalysis" defaultValue={laboratory.officialAnalysis} rows={8} required /></label><LessonPicker lessons={lessonOptions} selectedIds={laboratory.lessonIds} /><label>Status<select name="status" defaultValue={laboratory.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label><div className="form-actions"><button className="primary-button" type="submit"><Save size={16} />Salvar laboratório</button></div></form>}</details>)}</section>
    </div>
  );
}

type LessonOption = { id: string; title: string; courseTitle: string; moduleTitle: string };

function LessonPicker({ lessons, selectedIds = [] }: { lessons: LessonOption[]; selectedIds?: string[] }) {
  return <fieldset className="material-picker full-field"><legend>Aulas relacionadas</legend>{lessons.length === 0 ? <p className="inline-empty">Nenhuma aula cadastrada.</p> : lessons.map((lesson) => <label className="material-option" key={lesson.id}><input type="checkbox" name="lessonIds" value={lesson.id} defaultChecked={selectedIds.includes(lesson.id)} /><span><strong>{lesson.title}</strong><small>{lesson.courseTitle} · {lesson.moduleTitle}</small></span></label>)}</fieldset>;
}
