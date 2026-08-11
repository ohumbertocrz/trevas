import { Search, ShieldCheck, UserRoundCheck, UserRoundX } from "lucide-react";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";
import { accessRepository } from "@/infrastructure/repositories/firebase-access-repository";
import { TREVAS_PRODUCT_ID } from "@/application/access/permissions";
import { grantAccess, revokeAccess } from "./actions";

export const dynamic = "force-dynamic";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const users = await adminAccessRepository.listUsers(50);
  const filtered = users.filter((user) => `${user.displayName} ${user.email}`.toLowerCase().includes(q.toLowerCase()));
  const rows = await Promise.all(filtered.map(async (user) => ({ user, entitlement: await accessRepository.getProductEntitlement(user.id, TREVAS_PRODUCT_ID) })));

  return (
    <div className="admin-page">
      <header className="page-heading"><div><span className="kicker">Pessoas e acessos</span><h1>Alunos</h1><p>Consulte contas e gerencie acessos manuais com registro de auditoria.</p></div></header>
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
