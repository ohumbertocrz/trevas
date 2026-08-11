import { BookOpen, Megaphone, ShoppingCart, TriangleAlert, Users } from "lucide-react";
import { ResizablePanelGrid } from "@/components/ui/resizable-panel-grid";

const syncRows = [
  ["Nova compra", "Mariana S.", "Trevas Completo", "Sincronizado"],
  ["Acesso liberado", "Rafael T.", "Trevas Completo", "Sincronizado"],
  ["Reembolso", "Lucas P.", "Trevas Completo", "Reembolsado"],
  ["Nova compra", "Camila R.", "Trevas Completo", "Sincronizado"],
];

const webhooks = [
  ["purchase.approved", "10:37:21", "Sucesso"],
  ["access.granted", "10:33:14", "Sucesso"],
  ["refund.requested", "10:21:03", "Falha"],
  ["subscription.canceled", "10:15:42", "Pendente"],
];

export default function AdminOverviewPage() {
  const metrics = [
    ["Alunos ativos", "1.248", Users],
    ["Acessos Hotmart hoje", "37", ShoppingCart],
    ["Aulas publicadas", "42", BookOpen],
    ["Avisos enviados", "6", Megaphone],
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
        <section className="panel admin-data"><h2>Alertas do sistema</h2><div className="alert"><TriangleAlert size={20} color="#d84a3d" /><span><strong>Falha em webhook</strong><small>Tentativa de processamento Hotmart não concluída.</small></span></div><div className="alert warning"><TriangleAlert size={20} color="#c89735" /><span><strong>Configuração pendente</strong><small>Conecte o projeto Firebase antes da publicação.</small></span></div></section>
      </ResizablePanelGrid>
    </div>
  );
}
