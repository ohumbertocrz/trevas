import { MailPlus, Search, ShieldCheck, UserRoundCheck, UserRoundX } from "lucide-react";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";
import { accessRepository } from "@/infrastructure/repositories/firebase-access-repository";
import { TREVAS_PRODUCT_ID } from "@/application/access/permissions";
import { grantAccess, inviteStudent, revokeAccess } from "./actions";

export const dynamic = "force-dynamic";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string; invited?: string }> }) {
  const params = await searchParams;
  const { q = "", invited } = params;
  const users = await adminAccessRepository.listUsers(50);
  const filtered = users.filter((user) => `${user.displayName} ${user.email}`.toLowerCase().includes(q.toLowerCase()));
  const rows = await Promise.all(filtered.map(async (user) => ({ user, entitlement: await accessRepository.getProductEntitlement(user.id, TREVAS_PRODUCT_ID) })));

  return (
    <div className="admin-page">
      <header className="page-heading"><div><span className="kicker">Pessoas e acessos</span><h1>Alunos</h1><p>Cadastre, convide e gerencie os acessos dos alunos.</p></div></header>
      {invited === "1" && <div className="app-toast" role="status">Convite enviado ao aluno.</div>}
      <section className="panel person-invite"><div className="panel-heading"><div><h2>Adicionar aluno</h2><p>Crie a conta e envie um link para o aluno definir a senha.</p></div><MailPlus size={20} /></div><form className="admin-form person-invite-form" action={inviteStudent}><label>Nome<input name="displayName" required minLength={2} maxLength={120} placeholder="Nome do aluno" /></label><label>E-mail<input name="email" type="email" required maxLength={200} placeholder="aluno@exemplo.com" /></label><button className="primary-button" type="submit"><MailPlus size={16} />Enviar convite</button></form></section>
      <form className="admin-search" method="get"><Search aria-hidden="true" /><input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" aria-label="Buscar alunos" /><button className="ghost-button">Buscar</button></form>
      <section className="people-list">
        {rows.length === 0 && <div className="panel empty-result">Nenhum usuário encontrado.</div>}
        {rows.map(({ user, entitlement }) => {
          const active = entitlement?.status === "active";
          return (
            <article className="panel person-row" key={user.id}>
              <div className="person-identity"><span className="avatar"><ShieldCheck size={18} /></span><span><strong>{user.displayName}</strong><small>{user.email}</small></span></div>
              <div className="person-meta"><span className={`status ${active ? "" : "error"}`}>{active ? "Acesso ativo" : "Sem acesso"}</span><small>{user.roles.join(", ")}</small></div>
              <form className="access-form" action={active ? revokeAccess : grantAccess}>
                <input type="hidden" name="userId" value={user.id} />
                <input name="reason" required minLength={3} maxLength={300} placeholder="Motivo da alteração" aria-label={`Motivo da alteração para ${user.displayName}`} />
                {!active && <input type="date" name="expiresAt" aria-label="Data final opcional" />}
                <button className={active ? "ghost-button danger" : "primary-button"} type="submit">{active ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}{active ? "Remover" : "Conceder"}</button>
              </form>
            </article>
          );
        })}
      </section>
    </div>
  );
}
