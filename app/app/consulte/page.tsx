"use client";

import { Image as ImageIcon, Sparkles, Type, Upload } from "lucide-react";
import { useState } from "react";
import { ResizableColumns } from "@/components/ui/resizable-columns";

const sections = [
  ["Enquadramento", "A análise identificará o recorte escolhido e o contexto deixado fora da narrativa."],
  ["Escolhas linguísticas", "Palavras, verbos e construções que orientam a interpretação serão destacados aqui."],
  ["Omissões", "Ausências relevantes e informações não apresentadas serão organizadas nesta seção."],
  ["Recursos emocionais", "Gatilhos de medo, urgência, pertencimento e autoridade aparecerão aqui."],
  ["Técnicas identificadas", "A resposta conectará a análise às técnicas estudadas no curso Trevas."],
];

export default function ConsultPage() {
  const [text, setText] = useState("");

  return (
    <div className="page">
      <header className="page-heading"><div><span className="kicker">Análise assistida</span><h1>Consulte as Trevas</h1><p>Analise textos e imagens segundo a metodologia Trevas.</p></div></header>
      <ResizableColumns
        contentClassName="ai-layout"
        defaultSecondaryWidth={460}
        maxSecondaryWidth={620}
        minPrimaryWidth={420}
        minSecondaryWidth={360}
        storageKey="trevas:consult:result-width"
      >
        <section className="ai-input">
          <div className="segmented" role="tablist" aria-label="Tipo de análise">
            <button className="segment active" role="tab" aria-selected="true"><Type size={16} /> Texto</button>
            <button className="segment" role="tab" aria-selected="false"><ImageIcon size={16} /> Imagem</button>
            <button className="segment" role="tab" aria-selected="false"><Upload size={16} /> Upload</button>
          </div>
          <div className="panel analysis-box">
            <textarea value={text} maxLength={4000} onChange={(event) => setText(event.target.value)} placeholder="Cole aqui o conteúdo que deseja analisar..." aria-label="Conteúdo para análise" />
            <div className="analysis-footer">
              <span className="quota"><strong>5 de 5</strong> análises disponíveis nesta semana · {text.length}/4000</span>
              <button className="primary-button" disabled={!text.trim()}><Sparkles size={16} /> Analisar</button>
            </div>
          </div>
        </section>
        <section aria-labelledby="result-title">
          <div className="panel-heading"><h2 id="result-title">Resultado da análise</h2></div>
          <div className="accordion-list">
            {sections.map(([title, description]) => <details className="accordion" key={title}><summary>{title}</summary><p>{description}</p></details>)}
          </div>
        </section>
      </ResizableColumns>
    </div>
  );
}
