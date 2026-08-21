import { BookOpen, Megaphone, ShoppingCart, Users } from "lucide-react";
import { ResizablePanelGrid } from "@/components/ui/resizable-panel-grid";

const syncRows: string[][] = [];
const webhooks: string[][] = [];

export default function AdminOverviewPage() {
  const metrics = [
    ["Alunos ativos", "—", Users],
    ["Acessos Hotmart hoje", "—", ShoppingCart],
    ["Aulas publicadas", "—", BookOpen],
    ["Avisos enviados", "—", Megaphone],
  ] as const;

  return (
    <div className="admin-page">
      <header className="page-heading"><div><span className="kicker">Operação</span><h1>Visão Geral</h1><p>Controle operacional da área de membros Trevas.</p></div></header>
      <section className="metrics" aria-label="Indicadores principais">
        {metrics.map(([label, value, Icon]) => <article className="metric" key={label}><span className="metric-icon"><Icon size={22} /></span><div><span>{label}</span><strong>{value}</strong></div></article>)}
      </section>
      <ResizablePanelGrid storageKey="trevas:admin:overview-columns">
        <section className="panel admin-data"><h2>Sincronização Hotmart</h2><table className="data-table"><thead><tr><th>Evento</th><th>Aluno</th><th>Produto</th><th>Status</th></tr></thead><tbody>{syncRows.map((row) => <tr key={`${row[0]}-${row[1]}`}>{row.map((cell, index) => <td key={cell}><span className={index === 3 ? `status ${cell === "Reembolsado" ? "error" : ""}` : ""}>{cell}</span></td>)}</tr>)}</tbody></table></section>
        <section className="panel admin-data"><h2>Webhooks recentes</h2><table className="data-table"><thead><tr><th>Evento</th><th>Hora</th><th>Status</th></tr></thead><tbody>{webhooks.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}><span className={index === 2 ? `status ${cell === "Falha" ? "error" : ""}` : ""}>{cell}</span></td>)}</tr>)}</tbody></table></section>
        <section className="panel admin-data"><h2>Alertas do sistema</h2><p className="inline-empty">Nenhum alerta disponível.</p></section>
      </ResizablePanelGrid>
    </div>
  );
}
