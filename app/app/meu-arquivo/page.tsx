import { Bookmark, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { requireMember } from "@/application/access/session";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";

export const dynamic = "force-dynamic";
const labels = { lesson: "Aula", material: "Material", case: "Caso", reference: "Livro / referência" } as const;
export default async function MyArchivePage() { const user = await requireMember("/app/meu-arquivo"); const items = await archiveRepository.listForUser(user.id); return <div className="page"><header className="page-heading"><div><span className="kicker">Memória de estudo</span><h1>Meu Arquivo</h1><p>Conteúdos que você escolheu guardar para revisitar.</p></div></header>{items.length === 0 ? <section className="panel empty-result archive-empty"><Bookmark size={22} /><h2>Seu arquivo está vazio</h2><p>Use o marcador nas aulas, casos e referências.</p><Link className="primary-button" href="/app/curso">Explorar curso</Link></section> : <section className="archive-list">{items.map((item) => <article className="panel archive-list-item" key={item.id}><span className="archive-list-icon">{item.type === "lesson" ? <Bookmark /> : <FileText />}</span><div><span className="kicker">{labels[item.type]}</span><h2>{item.title}</h2><p>{item.description || "Conteúdo salvo no seu arquivo."}</p></div><Link className="ghost-button" href={item.href}>Abrir <ExternalLink size={15} /></Link></article>)}</section>}</div>; }
