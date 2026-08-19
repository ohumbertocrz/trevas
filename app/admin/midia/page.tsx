import { File, FileImage, FileText, Film, FolderOpen, Search, Trash2 } from "lucide-react";
import { formatAttachmentSize } from "@/application/services/content-attachments";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { deleteMedia } from "./actions";

export const dynamic = "force-dynamic";

const ownerLabels = { course: "Curso", module: "Módulo", lesson: "Aula", case: "Caso", reference: "Referência", laboratory: "Laboratório" } as const;

function mediaKind(contentType: string) {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/") || contentType.startsWith("audio/")) return "video";
  if (contentType === "application/pdf") return "pdf";
  if (contentType.includes("document") || contentType.includes("word") || contentType.includes("text/")) return "document";
  return "file";
}

const kindLabels = { image: "Imagens", video: "Mídia", pdf: "PDFs", document: "Documentos", file: "Arquivos" } as const;

function MediaIcon({ kind }: { kind: string }) {
  if (kind === "image") return <FileImage size={18} />;
  if (kind === "video") return <Film size={18} />;
  if (kind === "pdf" || kind === "document") return <FileText size={18} />;
  return <File size={18} />;
}

export default async function MediaLibraryAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLocaleLowerCase("pt-BR");
  const type = params.type ?? "all";
  const allMedia = await contentAttachmentRepository.listAll();
  const typedMedia = allMedia.map((media) => ({ media, kind: mediaKind(media.contentType) }));
  const media = typedMedia.filter(({ media: item, kind }) => (!query || `${item.name} ${item.contentType} ${ownerLabels[item.ownerType]}`.toLocaleLowerCase("pt-BR").includes(query)) && (type === "all" || kind === type));
  const totalBytes = allMedia.reduce((sum, item) => sum + item.sizeBytes, 0);
  const countByKind = (kind: string) => typedMedia.filter((item) => item.kind === kind).length;

  return (
    <div className="admin-page media-library-page">
      <header className="page-heading"><div><span className="kicker">Conteúdo</span><h1>Biblioteca de mídia</h1><p>Arquivos anexados aos conteúdos publicados e em edição.</p></div><FolderOpen size={28} /></header>
      <section className="media-metrics">
        <div className="panel media-metric"><span>Arquivos totais</span><strong>{allMedia.length}</strong><small>Em todos os conteúdos</small></div>
        <div className="panel media-metric"><span>Imagens</span><strong>{countByKind("image")}</strong><small>Capas e anexos visuais</small></div>
        <div className="panel media-metric"><span>Mídia</span><strong>{countByKind("video")}</strong><small>Áudios e vídeos</small></div>
        <div className="panel media-metric"><span>Armazenamento</span><strong>{formatAttachmentSize(totalBytes)}</strong><small>Uso contabilizado</small></div>
      </section>
      <form className="library-search panel" method="get"><Search size={18} /><input name="q" defaultValue={params.q} placeholder="Buscar arquivos..." aria-label="Buscar arquivos" /><select name="type" defaultValue={type}><option value="all">Todos os tipos</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="primary-button" type="submit">Filtrar</button></form>
      <section className="panel media-list-panel">
        <div className="media-list-heading"><span>Arquivo</span><span>Tipo</span><span>Tamanho</span><span>Origem</span><span>Ações</span></div>
        {media.length === 0 && <div className="empty-result">Nenhum arquivo encontrado.</div>}
        {media.map(({ media: item, kind }) => <article className="media-admin-row" key={item.id}><span className="media-name"><span className={`media-file-icon media-file-icon-${kind}`}><MediaIcon kind={kind} /></span><span><strong>{item.name}</strong><small>{item.contentType}</small></span></span><span><em className={`media-type media-type-${kind}`}>{kindLabels[kind as keyof typeof kindLabels]}</em></span><span className="media-muted">{formatAttachmentSize(item.sizeBytes)}</span><span className="media-muted">{ownerLabels[item.ownerType]}<small>{item.ownerId}</small></span><form action={deleteMedia}><input type="hidden" name="attachmentId" value={item.id} /><button className="icon-button danger-icon" type="submit" aria-label={`Excluir ${item.name}`} title="Excluir arquivo"><Trash2 size={16} /></button></form></article>)}
      </section>
    </div>
  );
}
