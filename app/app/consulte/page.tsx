import { requireMember } from "@/application/access/session";
import { ConsultAi } from "@/components/member/consult-ai";

export const dynamic = "force-dynamic";
export default async function ConsultPage() { await requireMember("/app/consulte"); return <div className="page"><header className="page-heading"><div><span className="kicker">Análise assistida</span><h1>Consulte as Trevas</h1><p>Analise textos segundo a metodologia Trevas e conecte a resposta ao conteúdo publicado.</p></div></header><ConsultAi /></div>; }
