import { Bell, UserRound } from "lucide-react";
import { requireMember } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { markNoticeRead } from "@/app/app/avisos/actions";
import { deleteMyAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireMember("/app/perfil");
  const notices = await communicationRepository.listUserDeliveries(user.id);
  const maskedEmail = user.email.replace(/^(.{3}).*(@.*)$/, "$1***$2");
  return <div className="member-page profile-page"><header className="page-heading"><div><span className="kicker">Sua conta</span><h1>Meu Perfil</h1><p>Dados da sua conta e avisos da plataforma.</p></div><UserRound size={28} /></header><section className="panel profile-summary"><span className="avatar"><UserRound size={22} /></span><div><strong>{user.displayName}</strong><small>{user.email}</small></div></section><section className="profile-notices"><div className="panel-heading"><div><h2>Avisos</h2><p>Mensagens recebidas da equipe Trevas.</p></div><Bell size={20} /></div>{notices.length === 0 ? <div className="panel empty-result">Nenhum aviso disponível.</div> : notices.map((notice) => <article className={`panel notice-card ${notice.openedAt ? "notice-opened" : ""}`} key={notice.id}><div className="notice-card-heading"><span className="content-symbol"><Bell size={18} /></span><div><h3>{notice.title}</h3><small>{notice.createdAt?.toLocaleString("pt-BR") ?? ""}</small></div>{notice.openedAt ? <span className="notice-read">Lido</span> : <form action={markNoticeRead}><input type="hidden" name="deliveryId" value={notice.id} /><button className="ghost-button" type="submit">Marcar como lido</button></form>}</div><div className="notice-content">{notice.content.split(/\r?\n/).map((line, index) => <p key={`${notice.id}-${index}`}>{line}</p>)}</div></article>)}</section><section className="panel profile-security"><div className="panel-heading"><div><h2>Segurança e dados</h2><p>Esta ação apaga permanentemente sua conta e seus dados pessoais na plataforma.</p></div></div><form action={deleteMyAccount} className="delete-account-form"><label>Digite <strong>APAGAR</strong> para confirmar<input name="confirmation" required autoComplete="off" placeholder="APAGAR" /></label><button className="danger-button" type="submit">Apagar meus dados</button></form><small className="content-identification">Conta: {maskedEmail}</small></section></div>;
}
