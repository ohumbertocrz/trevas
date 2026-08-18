import { Download, FileText } from "lucide-react";
import type { ContentAttachment } from "@/domain/content/attachments";
import { formatAttachmentSize } from "@/application/services/content-attachments";

export function ContentAttachments({ attachments }: { attachments: ContentAttachment[] }) {
  if (!attachments.length) return null;
  return <section className="content-attachments"><span className="kicker">Arquivos anexos</span><div className="content-attachment-list">{attachments.map((attachment) => <a className="content-attachment-row" href={`/api/content-attachments/${attachment.id}/download`} key={attachment.id}><FileText size={16} /><span>{attachment.name}<small>{formatAttachmentSize(attachment.sizeBytes)}</small></span><Download size={15} /></a>)}</div></section>;
}
