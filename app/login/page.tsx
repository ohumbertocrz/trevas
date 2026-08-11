import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getAuthenticatedUser } from "@/application/access/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();
  if (user) redirect("/app");

  return (
    <main className="auth-page">
      <section className="panel auth-panel">
        <div className="auth-brand"><span className="brand-seal">T</span><div className="brand-name">TREVAS</div><div className="brand-motto">Área de membros</div></div>
        <Suspense fallback={<p className="auth-message">Carregando acesso...</p>}><SignInForm /></Suspense>
      </section>
    </main>
  );
}
