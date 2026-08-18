import { BookOpen, ChevronRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/application/access/session";
import { memberContentRepository } from "@/infrastructure/repositories/firebase-member-content-repository";
import { progressRepository } from "@/infrastructure/repositories/firebase-progress-repository";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { ContentAttachments } from "@/components/member/content-attachments";

export const dynamic = "force-dynamic";

export default async function CoursePage() {
  const courses = await memberContentRepository.listPublishedCourses();
  const user = await getAuthenticatedUser();
  const allLessonIds = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  const progress = user ? await progressRepository.getLessonsProgress(user.id, allLessonIds) : [];
  const progressByLesson = new Map(progress.map((item) => [item.lessonId, item]));
  const moduleAttachments = new Map((await Promise.all(courses.flatMap((course) => course.modules).map(async (module) => [module.id, await contentAttachmentRepository.list("module", module.id)] as const))));

  return (
    <div className="page">
      <header className="page-heading"><div><span className="kicker">Formação Trevas</span><h1>Curso</h1><p>Seu percurso de estudo, organizado em módulos e aulas.</p></div></header>
      <div className="published-course-list">
        {courses.length === 0 && <section className="panel empty-result">Nenhum curso publicado.</section>}
        {courses.map((course) => (
          <section className="published-course" key={course.id}>
            <header className="published-course-heading"><h2>{course.title}</h2>{course.description && <p>{course.description}</p>}{(() => { const lessons = course.modules.flatMap((module) => module.lessons); const completed = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.completed).length; const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0; return <div className="course-progress"><div className="course-progress-heading"><span>Progresso do curso</span><strong>{percent}%</strong></div><div className="course-progress-track"><span style={{ width: `${percent}%` }} /></div><small>{completed} de {lessons.length} aulas concluídas</small></div>; })()}</header>
            <div className="member-module-list">
              {course.modules.map((module, moduleIndex) => (
                <details className="panel member-module" key={module.id} open={moduleIndex === 0}>
                  <summary><span className="module-number">{String(moduleIndex + 1).padStart(2, "0")}</span><span><strong>{module.title}</strong><small>{module.lessons.length} aulas</small></span><ChevronRight /></summary>
                  <ContentAttachments attachments={moduleAttachments.get(module.id) ?? []} /><div className="member-lesson-list">
                    {module.lessons.length === 0 && <p className="inline-empty">Nenhuma aula publicada.</p>}
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Link href={`/app/aula/${lesson.slug}`} className="member-lesson-row" key={lesson.id}>
                        <span className="lesson-order">{lessonIndex + 1}</span>
                        <span><strong>{lesson.title}</strong>{lesson.subtitle && <small>{lesson.subtitle}</small>}</span>
                        {lesson.durationMinutes > 0 && <span className="lesson-duration"><Clock3 />{lesson.durationMinutes} min</span>}
                        <BookOpen className="lesson-open-icon" />
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
