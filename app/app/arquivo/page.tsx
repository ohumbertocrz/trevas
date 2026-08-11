import { ArrowRight, Files, Search } from "lucide-react";
import Link from "next/link";
import { requireMember } from "@/application/access/session";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";

export const dynamic = "force-dynamic";
const typeLabel = { jornalismo: "Jornalismo", publicidade: "Publicidade", política: "Política", cinema: "Cinema", "redes sociais": "Redes sociais", outro: "Outro" } as const;

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  await requireMember("/app/arquivo");
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLocaleLowerCase("pt-BR");
  const type = params.type ?? "all";
  const cases = (await caseRepository.listPublishedCases()).filter((item) => (!query || [item.title, item.description, item.body, item.source, ...item.tags, ...item.techniques].some((value) => value.toLocaleLowerCase("pt-BR").includes(query))) && (type === "all" || item.type === type));
  return <div className="page"><header className="page-heading"><div><span className="kicker">Casos e análises</span><h1>Arquivo Trevas</h1><p>Uma base para observar enquadramentos, escolhas e técnicas em circulação.</p></div></header><form className="case-search panel" action="/app/arquivo"><Search size={18} /><input name="q" defaultValue={params.q} placeholder="Buscar casos, tags ou técnicas" aria-label="Buscar casos" /><select name="type" defaultValue={type}><option value="all">Todos os tipos</option>{Object.entries(typeLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><button className="primary-button" type="submit">Filtrar</button></form>{cases.length === 0 ? <section className="panel empty-result"><Files size={22} /><h2>{query || type !== "all" ? "Nenhum caso encontrado" : "Nenhum caso publicado"}</h2><p>{query || type !== "all" ? "Tente alterar os termos ou filtros." : "Os casos publicados aparecerão aqui."}</p></section> : <section className="case-grid">{cases.map((item) => <article className="panel case-card" key={item.id}>{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : <div className="case-card-placeholder"><Files size={25} /></div>}<div className="case-card-body"><span className="kicker">{typeLabel[item.type]}</span><h2>{item.title}</h2><p>{item.description}</p><div className="case-card-tags">{item.tags.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><Link className="ghost-button" href={`/app/arquivo/${item.id}`}>Ler caso <ArrowRight size={15} /></Link></div></article>)}</section>}</div>;
}
