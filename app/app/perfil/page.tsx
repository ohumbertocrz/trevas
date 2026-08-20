import { UserRound } from "lucide-react";
import { requireMember } from "@/application/access/session";
import { deleteMyAccount } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireMember("/app/perfil");
  const maskedEmail = user.email.replace(/^(.{3}).*(@.*)$/, "$1***$2");
  return <div className="member-page profile-page"><header className="page-heading"><div><span className="kicker">Sua conta</span><h1>Meu Perfil</h1><p>Dados da sua conta.</p></div><UserRound size={28} /></header><section className="panel profile-summary"><span className="avatar"><UserRound size={22} /></span><div><strong>{user.displayName}</strong><small>{user.email}</small></div></section><section className="panel profile-security"><div className="panel-heading"><div><h2>Segurança e dados</h2><p>Esta ação apaga permanentemente sua conta e seus dados pessoais na plataforma.</p></div></div><form action={deleteMyAccount} className="delete-account-form"><label>Digite <strong>APAGAR</strong> para confirmar<input name="confirmation" required autoComplete="off" placeholder="APAGAR" /></label><button className="danger-button" type="submit">Apagar meus dados</button></form><small className="content-identification">Conta: {maskedEmail}</small></section></div>;
}
