import { ArrowLeft, Check, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/application/access/session";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { ContentAttachments } from "@/components/member/content-attachments";
import { submitLaboratory } from "../actions";

export const dynamic = "force-dynamic";
export default async function LaboratoryDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ reveal?: string }> }) {
  const { slug } = await params; const { reveal } = await searchParams; const laboratory = await laboratoryRepository.getPublishedLaboratory(slug); if (!laboratory) notFound();
  const user = await getAuthenticatedUser(); const attempt = user ? await laboratoryRepository.getAttempt(user.id, laboratory.id) : null; const hasSubmitted = Boolean(attempt); const showAnalysis = hasSubmitted && reveal === "1"; const attachments = await contentAttachmentRepository.list("laboratory", laboratory.id);
  return <div className="page laboratory-detail"><Link className="back-link" href="/app/laboratorio"><ArrowLeft size={15} />Laboratório</Link><header className="page-heading"><div><span className="kicker">Exercício de análise</span><h1>{laboratory.title}</h1><p>{laboratory.description}</p></div></header><section className="panel laboratory-case"><span className="kicker">Caso</span><div>{laboratory.caseText}</div>{laboratory.source && <small>Fonte: {laboratory.source}</small>}</section><ContentAttachments attachments={attachments} /><form className="laboratory-response" action={submitLaboratory}><input type="hidden" name="laboratoryId" value={laboratory.id} /><input type="hidden" name="slug" value={laboratory.slug} /><div className="laboratory-questions">{laboratory.questions.map((question) => <label className="laboratory-question" key={question.id}><span>{question.order}. {question.prompt}</span><textarea name={`answer-${question.id}`} defaultValue={attempt?.answers[question.id] ?? ""} rows={5} required disabled={hasSubmitted} /></label>)}</div>{!hasSubmitted && <button className="primary-button" type="submit"><Check size={16} />Enviar respostas</button>}</form>{hasSubmitted && !showAnalysis && <Link className="primary-button laboratory-reveal" href={`/app/laboratorio/${laboratory.slug}?reveal=1`}><Eye size={16} />Ver análise</Link>}{showAnalysis && <section className="panel laboratory-analysis"><div className="analysis-heading"><Eye size={18} /><span><span className="kicker">Análise oficial</span><strong>Compare com sua leitura</strong></span></div><div>{laboratory.officialAnalysis}</div></section>}</div>;
}
