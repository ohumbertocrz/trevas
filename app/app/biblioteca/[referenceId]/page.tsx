import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/application/access/session";
import { toggleReferenceArchive } from "@/app/app/arquivo/actions";
import { ArchiveContentToggle } from "@/components/member/archive-content-toggle";
import { ContentAttachments } from "@/components/member/content-attachments";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";

export const dynamic = "force-dynamic";
export default async function ReferencePage({ params }: { params: Promise<{ referenceId: string }> }) {
  const user = await requireMember(); const { referenceId } = await params; const reference = await referenceRepository.getPublishedReference(referenceId); if (!reference) notFound();
  const [archived, attachments] = await Promise.all([archiveRepository.getForUser(user.id, "reference", reference.id), contentAttachmentRepository.list("reference", reference.id)]);
  return <div className="page reference-page"><Link className="back-link" href="/app/biblioteca"><ArrowLeft size={14} />Voltar para a Biblioteca</Link><header className="page-heading"><div><span className="kicker">Biblioteca · {reference.type}</span><h1>{reference.title}</h1>{reference.author && <p>{reference.author}</p>}</div><ArchiveContentToggle initialSaved={Boolean(archived)} label="a referência" action={() => toggleReferenceArchive(reference.id)} /></header>{reference.coverPath && <img className="reference-detail-cover" src={`/api/media/reference-cover/${reference.id}`} alt="" />}{reference.vimeoEmbedUrl && <div className="vimeo-preview"><iframe src={reference.vimeoEmbedUrl} title={`Vídeo de ${reference.title}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>}<section className="reference-detail-reading"><p>{reference.description}</p>{reference.tags.length > 0 && <div className="case-tags">{reference.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}{reference.referenceUrl && <a className="primary-button" href={reference.referenceUrl} target="_blank" rel="noreferrer">Abrir referência <ExternalLink size={15} /></a>}</section><ContentAttachments attachments={attachments} /></div>;
}
