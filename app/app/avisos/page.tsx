import { Bell, Check, ChevronDown, Trash2 } from "lucide-react";
import { requireMember } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { deleteNotice, markNoticeRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const user = await requireMember("/app/avisos");
  const notices = await communicationRepository.listUserDeliveries(user.id);
  return <div className="member-page notices-page"><header className="page-heading"><div><span className="kicker">Comunicação</span><h1>Avisos</h1><p>Informações importantes da sua jornada Trevas.</p></div><Bell size={28} /></header><section className="notices-list" aria-label="Avisos recebidos">{notices.length === 0 ? <div className="panel empty-result">Nenhum aviso disponível.</div> : notices.map((notice) => <details className={`panel notice-card ${notice.openedAt ? "notice-opened" : ""}`} key={notice.id}><summary className="notice-card-heading"><span className="content-symbol"><Bell size={18} /></span><span className="notice-card-title"><strong>{notice.title}</strong><small>{notice.createdAt?.toLocaleString("pt-BR") ?? ""}</small></span><span className="notice-card-status">{notice.openedAt ? <Check size={16} aria-label="Visualizado" /> : <span>Novo</span>}<ChevronDown size={18} aria-hidden="true" /></span></summary><div className="notice-card-body"><div className="notice-content">{notice.content.split(/\r?\n/).map((line, index) => <p key={`${notice.id}-${index}`}>{line}</p>)}</div><div className="notice-actions">{!notice.openedAt && <form action={markNoticeRead}><input type="hidden" name="deliveryId" value={notice.id} /><button className="ghost-button" type="submit">Marcar como lido</button></form>}<form action={deleteNotice}><input type="hidden" name="deliveryId" value={notice.id} /><button className="icon-button notice-delete" type="submit" aria-label={`Excluir aviso: ${notice.title}`}><Trash2 size={16} /></button></form></div></div></details>)}</section></div>;
}
