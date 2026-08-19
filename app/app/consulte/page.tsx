import { requireMember } from "@/application/access/session";
import { ConsultAi } from "@/components/member/consult-ai";

export const dynamic = "force-dynamic";
export default async function ConsultPage() { await requireMember("/app/consulte"); return <div className="page"><header className="page-heading"><div><span className="kicker">Análise assistida</span><h1>Analisar com IA</h1><p>Este recurso está sendo preparado para uma próxima etapa da plataforma.</p></div></header><ConsultAi disabled /></div>; }
