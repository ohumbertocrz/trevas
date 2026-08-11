import { ArrowRight, BookOpen, FileText, Files, FlaskConical, Search } from "lucide-react";
import Link from "next/link";
import { requireMember } from "@/application/access/session";
import { searchMemberContent } from "@/application/services/member-search-service";

export const dynamic = "force-dynamic";
const labels = { lesson: "Aula", material: "Material", laboratory: "Laboratorio", case: "Arquivo Trevas" } as const;
const icons = { lesson: BookOpen, material: FileText, laboratory: FlaskConical, case: Files } as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireMember("/app/busca");
  const query = ((await searchParams).q ?? "").trim();
  const results = await searchMemberContent(query);
  const groups = ["lesson", "material", "laboratory", "case"] as const;
  return <div className="page search-page"><header className="page-heading"><div><span className="kicker">Conhecimento Trevas</span><h1>Buscar</h1><p>Encontre aulas, materiais, laboratorios e casos publicados.</p></div></header><form className="search-form panel" action="/app/busca"><Search size={19} aria-hidden="true" /><input name="q" defaultValue={query} placeholder="Buscar no conteudo Trevas" aria-label="Buscar no conteudo Trevas" autoFocus /><button className="primary-button" type="submit">Buscar</button></form>{query.length > 0 && query.length < 2 && <p className="search-feedback">Digite pelo menos 2 caracteres.</p>}{query.length >= 2 && results.length === 0 && <section className="panel empty-result"><Search size={22} /><h2>Nenhum resultado encontrado</h2><p>Tente buscar por outro termo.</p></section>}{groups.map((type) => { const group = results.filter((result) => result.type === type); if (!group.length) return null; const Icon = icons[type]; return <section className="search-group" key={type}><div className="section-heading"><h2><Icon size={18} />{labels[type]}</h2><span>{group.length}</span></div><div className="search-results">{group.map((result) => <article className="panel search-result" key={result.id}><div><span className="kicker">{labels[result.type]}</span><h3>{result.title}</h3><p>{result.description}</p></div><Link className="ghost-button" href={result.href} target={result.type === "material" ? "_blank" : undefined} rel={result.type === "material" ? "noreferrer" : undefined}>Abrir <ArrowRight size={15} /></Link></article>)}</div></section>; })}</div>;
}
