import { ArrowLeft, ArrowRight, Bookmark, Play } from "lucide-react";
import Link from "next/link";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  return (
    <div className="page">
      <Link className="text-link" href="/app/curso"><ArrowLeft size={14} /> Voltar para o curso</Link>
      <header className="page-heading" style={{ marginTop: 22 }}><div><span className="kicker">Aula 03 | Fundamentos</span><h1>Aquilo que você vê é aquilo que não vê</h1><p>Percepção, seleção e construção de sentido.</p></div><button className="icon-button" aria-label="Salvar aula"><Bookmark /></button></header>
      <section className="panel" style={{ aspectRatio: "16 / 9", display: "grid", placeItems: "center", background: "#050606" }} aria-label="Player da aula"><span style={{ textAlign: "center", color: "var(--muted)" }}><Play size={46} style={{ margin: "0 auto 14px", color: "var(--gold)" }} />Insira o ID do Vimeo no painel administrativo</span></section>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 18 }}><button className="ghost-button"><ArrowLeft size={15} /> Aula anterior</button><button className="primary-button">Próxima aula <ArrowRight size={15} /></button></div>
    </div>
  );
}
