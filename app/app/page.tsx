import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { ActivityIcon } from "@/components/member/activity-icon";
import { ResizableColumns } from "@/components/ui/resizable-columns";
import { learningRepository } from "@/infrastructure/repositories/firebase-learning-repository";
import { requireAuthenticatedUser } from "@/application/access/session";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const [dashboard, lesson] = await Promise.all([
    learningRepository.getDashboard(user.id),
    learningRepository.getContinueLesson(user.id),
  ]);

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <span className="kicker">Sua mesa de trabalho</span>
          <h1>Bem-vindo de volta, {user.displayName}.</h1>
          <p>Continue sua jornada de onde parou.</p>
        </div>
      </header>

      <ResizableColumns
        contentClassName="dashboard-grid"
        defaultSecondaryWidth={310}
        maxSecondaryWidth={420}
        minPrimaryWidth={560}
        minSecondaryWidth={280}
        storageKey="trevas:dashboard:secondary-width"
      >
        <section className="panel continue-panel" aria-labelledby="continue-title">
          <div className="panel-heading"><h2 id="continue-title">Continue de onde parou</h2></div>
          <div className="continue-content">
            <div className="continue-image" style={{ backgroundImage: `url(${lesson.thumbnail})` }} role="img" aria-label="Aula em andamento" />
            <div className="continue-copy">
              <span className="kicker">{lesson.moduleLabel}</span>
              <h2>{lesson.title}</h2>
              <div className="continue-actions">
                <div><small>{lesson.progress}% concluído</small><div className="progress"><span style={{ width: `${lesson.progress}%` }} /></div></div>
                {lesson.id ? <Link className="primary-button" href={`/app/aula/${lesson.id}`}>Continuar aula <ArrowRight size={16} /></Link> : <Link className="primary-button" href="/app/curso">Explorar curso <ArrowRight size={16} /></Link>}
              </div>
            </div>
          </div>
        </section>

        <aside className="panel next-panel">
          <h2>Próximo passo</h2>
          <p>{dashboard.nextStep}</p>
          <div className="next-rule"><BookOpen size={22} /></div>
          <Link className="ghost-button" href="/app/curso">Ver próximo passo</Link>
        </aside>

        <section className="panel archive-panel" aria-labelledby="recent-title">
          <div className="panel-heading"><h2 id="recent-title">Adicionados recentemente ao Arquivo</h2><Link className="text-link" href="/app/arquivo">Ver tudo</Link></div>
          <div className="archive-grid">
            {dashboard.archiveItems.length === 0 && <p className="inline-empty">Você ainda não adicionou conteúdos ao Arquivo.</p>}
            {dashboard.archiveItems.map((item) => (
              <article className="archive-card" key={item.id}>
                {/* Existing Trevas imagery is reused until editorial media is connected. */}
                <img src={item.image} alt="" />
                <div className="archive-card-body"><h3>{item.title}</h3><p>{item.description}</p><span className="tag">{item.type}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel activity-panel" aria-labelledby="activity-title">
          <div className="panel-heading"><h2 id="activity-title">Atividade recente</h2><button className="text-link">Ver todas</button></div>
          <div className="activity-list">
            {dashboard.activities.length === 0 && <p className="inline-empty">Sua atividade aparecerá aqui quando você começar a estudar.</p>}
            {dashboard.activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <span className="activity-icon"><ActivityIcon kind={activity.kind} /></span>
                <span><strong>{activity.title}</strong><span>{activity.detail}</span><time>{activity.occurredAt}</time></span>
              </div>
            ))}
          </div>
        </section>
      </ResizableColumns>
    </div>
  );
}
