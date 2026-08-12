import Link from "next/link";
import { Captions, Check, Clock3, FileAudio, FileVideo, Search, Sparkles } from "lucide-react";
import { requireAdministrativeUser } from "@/application/access/session";
import { assertCanPrepareTranscription } from "@/application/content/permissions";
import { FirebaseContentRepository } from "@/infrastructure/repositories/firebase-content-repository";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = { none: "Sem mídia", processing: "Processando", review: "Aguardando revisão", approved: "Aprovada e disponível para IA", rejected: "Rejeitada" };
const icons: Record<string, typeof Clock3> = { processing: Clock3, review: Search, approved: Check, rejected: Captions, none: FileAudio };

export default async function TranscriptionsPage() {
  const user = await requireAdministrativeUser();
  assertCanPrepareTranscription(user);
  const repository = new FirebaseContentRepository();
  const courses = await repository.listCourses();
  const groups = (await Promise.all(courses.map(async (course) => {
    const modules = await repository.listModules(course.id);
    return Promise.all(modules.map(async (module) => ({ course, module, lessons: await repository.listLessons(module.id) })));
  }))).flat();
  const rows = groups.flatMap((group) => group.lessons.map((lesson) => ({ ...group, lesson })));

  return <div className="admin-page content-admin-page">
    <header className="page-heading"><div><span className="kicker">Preparação de conhecimento</span><h1>Transcrições</h1><p>Envie mídias, gere transcrições e aprove somente o conteúdo revisado para uso da IA.</p></div><Sparkles size={28} /></header>
    <section className="panel transcript-queue" aria-label="Fila de transcrições">
      {rows.length === 0 && <div className="empty-result">Nenhuma aula cadastrada.</div>}
      {rows.map(({ course, module, lesson }) => {
        const StatusIcon = icons[lesson.transcriptStatus] ?? Captions;
        return <Link className="transcript-queue-row" href={`/admin/cursos/${course.id}/aulas/${lesson.id}`} key={lesson.id}>
          <span className="content-symbol"><StatusIcon size={18} /></span>
          <span className="transcript-queue-copy"><strong>{lesson.title}</strong><small>{course.title} · {module.title}</small></span>
          <span className={`transcript-status transcript-status-${lesson.transcriptStatus}`}><StatusIcon size={14} />{labels[lesson.transcriptStatus]}</span>
          <span className="transcript-media-kind">{lesson.transcriptMediaPath ? (lesson.transcriptMediaPath.match(/\.(mp4|mov|webm)$/i) ? <FileVideo size={16} /> : <FileAudio size={16} />) : null}</span>
        </Link>;
      })}
    </section>
  </div>;
}
