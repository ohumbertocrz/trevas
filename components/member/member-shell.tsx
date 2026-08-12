"use client";

import {
  Bell,
  BookOpen,
  Bookmark,
  Bot,
  Files,
  FlaskConical,
  Home,
  Library,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navigation = [
  { href: "/app", label: "Início", icon: Home, exact: true },
  { href: "/app/curso", label: "Curso", icon: BookOpen },
  { href: "/app/laboratorio", label: "Laboratório", icon: FlaskConical },
  { href: "/app/arquivo", label: "Arquivo", icon: Files },
  { href: "/app/meu-arquivo", label: "Meu Arquivo", icon: Bookmark },
  { href: "/app/consulte", label: "Consulte as Trevas", icon: Bot },
  { href: "/app/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/app/avisos", label: "Avisos", icon: Bell },
];

const mobileNavigation = [
  navigation[0],
  navigation[1],
  navigation[3],
  navigation[5],
  { href: "/app/perfil", label: "Perfil", icon: UserRound },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function MemberShell({ children, user, unreadNotices }: { children: React.ReactNode; user: { displayName: string; email: string }; unreadNotices: number }) {
  const pathname = usePathname();

  return (
    <div className="member-shell">
      <aside className="member-sidebar">
        <Link href="/app" className="brand-lockup" aria-label="Trevas, início">
          <span className="brand-seal">T</span>
          <span className="brand-name">TREVAS</span>
          <span className="brand-motto">Enxergar e escolher</span>
        </Link>
        <nav className="sidebar-nav" aria-label="Navegação da área de membros">
          {navigation.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} className={`nav-link ${isActive(pathname, href, exact) ? "active" : ""}`}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-profile">
          <Link className="profile-link" href="/app/perfil">
            <span className="avatar-wrap"><span className="avatar"><UserRound size={19} /></span>{unreadNotices > 0 && <span className="notice-badge" aria-label={`${unreadNotices} avisos não lidos`}>{unreadNotices > 99 ? "99+" : unreadNotices}</span>}</span>
            <span><strong>{user.displayName}</strong><small>{user.email}</small></span>
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <main className="member-main">
        <header className="mobile-header">
          <strong>TREVAS</strong>
          <button className="icon-button" aria-label="Abrir notificações"><Bell size={20} /></button>
        </header>
        <form className="member-search-bar" action="/app/busca"><Search size={17} aria-hidden="true" /><input name="q" placeholder="Buscar no conteúdo Trevas" aria-label="Buscar no conteúdo Trevas" /><button className="icon-button" type="submit" aria-label="Buscar"><Search size={17} /></button></form>
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Navegação inferior">
        {mobileNavigation.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} className={isActive(pathname, href, exact) ? "active" : ""}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
