"use client";

import { Bell, Boxes, Cable, Gauge, Mail, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const items = [
  { href: "/admin", label: "Visão Geral", icon: Gauge },
  { href: "/admin/cursos", label: "Conteúdo", icon: Boxes },
  { href: "/admin/pessoas", label: "Pessoas", icon: Users },
  { href: "/admin/comunicacao", label: "Comunicação", icon: Mail },
  { href: "/admin/integracoes", label: "Integrações", icon: Cable },
  { href: "/admin/sistema", label: "Sistema", icon: ShieldCheck },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({ children, user }: { children: React.ReactNode; user: { displayName: string; email: string } }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><span className="admin-brand-mark">T</span><span><strong>TREVAS</strong><small>Painel administrativo</small></span></Link>
        <nav className="admin-nav" aria-label="Navegação administrativa">
          {items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "active" : ""}`}><Icon /><span>{label}</span></Link>)}
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><span>{user.displayName} · {user.email}</span><button className="icon-button" aria-label="Notificações"><Bell size={19} /></button><SignOutButton /></header>
        {children}
      </main>
    </div>
  );
}
