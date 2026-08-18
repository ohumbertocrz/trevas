import { Files, Save } from "lucide-react";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { CASE_TYPES } from "@/domain/archive/cases";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { ContentAttachmentsField } from "@/components/admin/content-attachments-field";
import { createCase, updateCase } from "./actions";

export const dynamic = "force-dynamic";
const statusLabel = { draft: "Rascunho", published: "Publicado", unpublished: "Despublicado", scheduled: "Agendado" } as const;
const typeLabel = { jornalismo: "Jornalismo", publicidade: "Publicidade", "política": "Política", cinema: "Cinema", "redes sociais": "Redes sociais", outro: "Outro" } as const;

export default async function ArchiveAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const cases = await caseRepository.listCases();
  const courses = await contentRepository.listCourses();
  const lessonOptions = (await Promise.all(courses.map(async (course) => {
    const modules = await contentRepository.listModules(course.id);
    return (await Promise.all(modules.map(async (module) => (await contentRepository.listLessons(module.id)).map((lesson) => ({ ...lesson, courseTitle: course.title, moduleTitle: module.title }))))).flat();
  }))).flat();
  const selected = edit ? cases.find((item) => item.id === edit) : null;
  const attachments = selected ? await contentAttachmentRepository.list("case", selected.id) : [];
  return <div className="admin-page content-admin-page"><header className="page-heading"><div><span className="kicker">Conteúdo expandido</span><h1>Arquivo Trevas</h1><p>Casos, documentos e análises para pesquisa.</p></div></header><details className="panel cms-settings" open={!selected}><summary><Files size={17} />Novo caso</summary><CaseForm action={createCase} lessons={lessonOptions} /></details><section className="case-admin-list">{cases.length === 0 && <div className="panel empty-result">Nenhum caso cadastrado.</div>}{cases.map((item) => <details className="panel case-admin-card" open={selected?.id === item.id} key={item.id}><summary><span className="content-symbol"><Files size={19} /></span><span><strong>{item.title}</strong><small>{typeLabel[item.type]} · {statusLabel[item.status]}</small></span></summary>{selected?.id === item.id && <CaseForm action={updateCase} item={item} lessons={lessonOptions} attachments={attachments} />}</details>)}</section></div>;
}

type LessonOption = { id: string; title: string; courseTitle: string; moduleTitle: string };
function CaseForm({ action, item, lessons, attachments }: { action: (formData: FormData) => void; item?: Awaited<ReturnType<typeof caseRepository.listCases>>[number]; lessons: LessonOption[]; attachments?: Awaited<ReturnType<typeof contentAttachmentRepository.list>> }) {
  return <form className="cms-form form-grid" action={action} encType="multipart/form-data"><input type="hidden" name="caseId" value={item?.id ?? ""} /><label>Título<input name="title" defaultValue={item?.title} required minLength={3} /></label><label>Tipo<select name="type" defaultValue={item?.type ?? "outro"}>{CASE_TYPES.map((value) => <option key={value} value={value}>{typeLabel[value]}</option>)}</select></label><label className="full-field">Descrição<textarea name="description" defaultValue={item?.description} rows={3} /></label><label className="full-field">Imagem ou thumbnail<input name="thumbnailUrl" type="url" defaultValue={item?.thumbnailUrl} placeholder="https://..." /></label><label className="full-field">Texto do caso<textarea name="body" defaultValue={item?.body} rows={10} required /></label><label>Fonte<input name="source" defaultValue={item?.source} /></label><label>Data<input name="caseDate" defaultValue={item?.caseDate} placeholder="Ex.: 12/08/2026" /></label><label>Tags, separadas por vírgula<input name="tags" defaultValue={item?.tags.join(", ")} /></label><label>Técnicas, separadas por vírgula<input name="techniques" defaultValue={item?.techniques.join(", ")} /></label><label className="full-field">Análise<textarea name="analysis" defaultValue={item?.analysis} rows={10} required /></label><fieldset className="material-picker full-field"><legend>Aulas relacionadas</legend>{lessons.length === 0 ? <p className="inline-empty">Nenhuma aula cadastrada.</p> : lessons.map((lesson) => <label className="material-option" key={lesson.id}><input type="checkbox" name="lessonIds" value={lesson.id} defaultChecked={item?.lessonIds.includes(lesson.id)} /><span><strong>{lesson.title}</strong><small>{lesson.courseTitle} · {lesson.moduleTitle}</small></span></label>)}</fieldset>{item && <label>Status<select name="status" defaultValue={item.status}>{CONTENT_STATUSES.map((value) => <option key={value} value={value}>{statusLabel[value]}</option>)}</select></label>}<ContentAttachmentsField attachments={attachments} /><div className="form-actions"><button className="primary-button" type="submit"><Save size={16} />{item ? "Salvar caso" : "Criar rascunho"}</button></div></form>;
}
