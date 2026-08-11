import { ArrowRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";

export const dynamic = "force-dynamic";

export default async function LaboratoryPage() {
  const laboratories = await laboratoryRepository.listPublishedLaboratories();
  return <div className="page"><header className="page-heading"><div><span className="kicker">Prática</span><h1>Laboratório Trevas</h1><p>Observe um caso, formule sua leitura e compare com a análise oficial.</p></div></header><section className="laboratory-grid">{laboratories.length === 0 && <div className="panel empty-result">Nenhum laboratório publicado.</div>}{laboratories.map((laboratory) => <Link className="panel laboratory-card" href={`/app/laboratorio/${laboratory.slug}`} key={laboratory.id}><span className="content-symbol"><FlaskConical size={22} /></span><span><strong>{laboratory.title}</strong><small>{laboratory.description}</small><span className="laboratory-card-meta">{laboratory.questions.length} perguntas</span></span><ArrowRight /></Link>)}</section></div>;
}
