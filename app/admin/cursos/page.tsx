import Link from "next/link";
import { BookOpen, ChevronRight, CirclePlus, Layers3 } from "lucide-react";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { createCourse } from "./actions";

export const dynamic = "force-dynamic";

const statusLabel = {
  draft: "Rascunho",
  published: "Publicado",
  unpublished: "Despublicado",
  scheduled: "Agendado",
} as const;

export default async function CoursesPage() {
  const courses = await contentRepository.listCourses();

  return (
    <div className="admin-page content-admin-page">
      <header className="page-heading">
        <div><span className="kicker">Conteúdo</span><h1>Cursos</h1><p>Estruture módulos e aulas antes de publicar para os alunos.</p></div>
        <details className="create-popover">
          <summary className="primary-button"><CirclePlus size={17} />Novo curso</summary>
          <form className="panel cms-form compact-form" action={createCourse}>
            <label>Nome do curso<input name="title" required minLength={3} maxLength={120} autoFocus /></label>
            <label>Descrição<textarea name="description" rows={3} maxLength={2000} /></label>
            <button className="primary-button" type="submit">Criar rascunho</button>
          </form>
        </details>
      </header>

      <section className="course-admin-list" aria-label="Cursos cadastrados">
        {courses.length === 0 && <div className="panel empty-result">Nenhum curso cadastrado.</div>}
        {courses.map((course) => (
          <Link className="panel course-admin-row" href={`/admin/cursos/${course.id}`} key={course.id}>
            <span className="content-symbol"><BookOpen size={20} /></span>
            <span className="course-admin-title"><strong>{course.title}</strong><small>/{course.slug}</small></span>
            <span className="content-count"><Layers3 size={15} />{course.moduleCount} módulos</span>
            <span className="content-count"><BookOpen size={15} />{course.lessonCount} aulas</span>
            <span className={`status ${course.status === "published" ? "" : "warning"}`}>{statusLabel[course.status]}</span>
            <ChevronRight size={19} className="row-arrow" />
          </Link>
        ))}
      </section>
    </div>
  );
}
