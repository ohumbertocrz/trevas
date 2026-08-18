import { ArrowLeft, ExternalLink, Files } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/application/access/session";
import { toggleCaseArchive } from "@/app/app/arquivo/actions";
import { ArchiveContentToggle } from "@/components/member/archive-content-toggle";
import { ContentAttachments } from "@/components/member/content-attachments";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";

export const dynamic = "force-dynamic";
export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const user = await requireMember(); const { caseId } = await params; const item = await caseRepository.getPublishedCase(caseId); if (!item) notFound();
  const [archived, attachments] = await Promise.all([archiveRepository.getForUser(user.id, "case", item.id), contentAttachmentRepository.list("case", item.id)]);
  return <div className="page case-page"><Link className="back-link" href="/app/arquivo"><ArrowLeft size={14} />Voltar para o Arquivo</Link><header className="page-heading"><div><span className="kicker">Arquivo Trevas · {item.type}</span><h1>{item.title}</h1>{item.description && <p>{item.description}</p>}</div><ArchiveContentToggle initialSaved={Boolean(archived)} label="o caso" action={() => toggleCaseArchive(item.id)} /></header>{item.thumbnailUrl && <img className="case-hero-image" src={item.thumbnailUrl} alt="" />}{(item.tags.length > 0 || item.techniques.length > 0) && <div className="case-tags">{[...item.tags, ...item.techniques].map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}<article className="case-reading"><div className="case-body"><p>{item.body}</p></div><aside className="case-meta panel"><Files size={19} /><strong>Ficha do caso</strong>{item.caseDate && <span>Data: {item.caseDate}</span>}{item.source && <a href={item.source} target="_blank" rel="noreferrer">Fonte <ExternalLink size={14} /></a>}</aside></article><section className="panel case-analysis"><span className="kicker">Análise Trevas</span><h2>Leitura do caso</h2><p>{item.analysis}</p></section><ContentAttachments attachments={attachments} /></div>;
}
