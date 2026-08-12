import { Clock3, Mail, Megaphone, Send, ShieldCheck } from "lucide-react";
import { requireAdministrativeUser } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { saveCommunication } from "./actions";

export const dynamic = "force-dynamic";
const statusLabel: Record<string, string> = { draft: "Rascunho", scheduled: "Agendada", sending: "Enviando", sent: "Enviada", failed: "Falhou" };
const audienceLabel: Record<string, string> = { active_students: "Alunos ativos", all_active: "Todos os usuários ativos", not_started: "Ainda não começaram", inactive_30_days: "Sem progresso há 30 dias" };

export default async function CommunicationPage() {
  await requireAdministrativeUser();
  const history = await communicationRepository.list();
  return <div className="admin-page content-admin-page">
    <header className="page-heading"><div><span className="kicker">Relacionamento</span><h1>Comunicação</h1><p>Crie uma mensagem e escolha se ela será exibida na plataforma, enviada por e-mail ou pelos dois canais.</p></div><Megaphone size={28} /></header>
    <section className="panel communication-composer"><div className="panel-heading"><div><h2>Nova comunicação</h2><p>Escolha um público e um ou mais canais de entrega.</p></div><ShieldCheck size={20} /></div><form action={saveCommunication} className="admin-form communication-form"><label>Título<input name="title" required maxLength={160} /></label><label>Mensagem<textarea name="content" rows={8} required maxLength={30000} /></label><div className="form-grid"><label>Público<select name="audience" defaultValue="active_students"><option value="active_students">Alunos ativos</option><option value="all_active">Todos os usuários ativos</option><option value="not_started">Alunos que ainda não começaram</option><option value="inactive_30_days">Sem progresso nos últimos 30 dias</option></select></label><label>Canal<select name="channel" defaultValue="both"><option value="internal">Aviso interno</option><option value="email">E-mail</option><option value="both">Aviso e e-mail</option></select></label><label>Agendar envio<input name="scheduledAt" type="datetime-local" /></label></div><div className="form-actions"><button className="ghost-button" name="action" value="draft" type="submit"><Clock3 size={16} />Salvar rascunho</button><button className="primary-button" name="action" value="send" type="submit"><Send size={16} />Enviar comunicação</button></div></form></section>
    <section className="panel communication-history"><div className="panel-heading"><h2>Histórico</h2><span>{history.length} registros</span></div>{history.length === 0 ? <div className="empty-result">Nenhuma comunicação criada.</div> : <div className="communication-list">{history.map((item) => <article className="communication-row" key={item.id}><span className="content-symbol">{item.channel === "internal" ? <Megaphone size={18} /> : <Mail size={18} />}</span><div><strong>{item.title}</strong><small>{audienceLabel[item.audience] ?? item.audience} · {item.recipientCount || "público ainda não calculado"}</small></div><span className={`status ${item.status === "failed" ? "error" : ""}`}>{statusLabel[item.status] ?? item.status}</span></article>)}</div>}</section>
  </div>;
}
