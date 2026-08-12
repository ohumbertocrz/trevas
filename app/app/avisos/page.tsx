import { Bell, Check } from "lucide-react";
import { requireMember } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { markNoticeRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const user = await requireMember("/app/avisos");
  const notices = await communicationRepository.listUserDeliveries(user.id);
  return <div className="member-page notices-page"><header className="page-heading"><div><span className="kicker">Comunicação</span><h1>Avisos</h1><p>Informações importantes da sua jornada Trevas.</p></div><Bell size={28} /></header><section className="notices-list" aria-label="Avisos recebidos">{notices.length === 0 ? <div className="panel empty-result">Nenhum aviso disponível.</div> : notices.map((notice) => <article className={`panel notice-card ${notice.openedAt ? "notice-opened" : ""}`} key={notice.id}><div className="notice-card-heading"><span className="content-symbol"><Bell size={18} /></span><div><h2>{notice.title}</h2><small>{notice.createdAt?.toLocaleString("pt-BR") ?? ""}</small></div>{notice.openedAt ? <Check size={16} aria-label="Visualizado" /> : <form action={markNoticeRead}><input type="hidden" name="deliveryId" value={notice.id} /><button className="ghost-button" type="submit">Marcar como lido</button></form>}</div><div className="notice-content">{notice.content.split(/\r?\n/).map((line, index) => <p key={`${notice.id}-${index}`}>{line}</p>)}</div></article>)}</section></div>;
}
