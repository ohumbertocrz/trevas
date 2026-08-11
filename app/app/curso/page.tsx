import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { learningRepository } from "@/infrastructure/repositories/mock-learning-repository";

export default async function CoursePage() {
  const course = await learningRepository.getCourseOverview("preview-user");

  return (
    <div className="page">
      <header className="page-heading">
        <div><span className="kicker">Formação Trevas</span><h1>{course.title}</h1><p>{course.description}</p></div>
        <div className="course-progress">
          <div className="course-progress-label"><span>Seu progresso geral</span><strong>{course.progress}%</strong></div>
          <div className="progress"><span style={{ width: `${course.progress}%` }} /></div>
        </div>
      </header>

      <section className="module-list" aria-label="Módulos do curso">
        {course.modules.map((module) => (
          <article className={`module-row ${module.state}`} key={module.id}>
            <span className="module-number">{String(module.number).padStart(2, "0")}</span>
            <span className="module-title">{module.title}</span>
            <span className="module-status" aria-label={module.state === "completed" ? "Concluído" : module.state === "current" ? "Em andamento" : "Bloqueado"}>
              {module.state === "completed" && <Check />}
              {module.state === "current" && <ArrowRight />}
              {module.state === "locked" && <LockKeyhole />}
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
