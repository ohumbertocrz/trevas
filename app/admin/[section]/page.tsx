import { Construction } from "lucide-react";

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = section.charAt(0).toUpperCase() + section.slice(1);
  return <div className="admin-page empty-page"><div><Construction size={42} /><h1>{title}</h1><p>A navegação e o limite deste módulo já estão preparados. Seus fluxos serão implementados na etapa correspondente do briefing.</p><span className="tag">Módulo administrativo</span></div></div>;
}
