import { LockKeyhole } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function NoAccessPage() {
  return (
    <main className="auth-page">
      <section className="panel auth-panel no-access">
        <LockKeyhole size={40} />
        <h1>Acesso não disponível</h1>
        <p>Sua conta está ativa, mas não possui acesso vigente ao produto Trevas. Entre em contato com o suporte caso a compra já tenha sido aprovada.</p>
        <SignOutButton />
      </section>
    </main>
  );
}
