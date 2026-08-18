import { FileText, Paperclip } from "lucide-react";
import type { ContentAttachment } from "@/domain/content/attachments";
import { formatAttachmentSize } from "@/application/services/content-attachments";

export function ContentAttachmentsField({ attachments }: { attachments?: ContentAttachment[] }) {
  return <div className="full-field content-attachments-field"><span className="field-label"><Paperclip size={14} />Arquivos anexos</span><input name="attachments" type="file" multiple /><small className="form-hint">VÃ¡rios arquivos, atÃ© 50 MB cada.</small>{attachments && attachments.length > 0 && <div className="content-attachment-list">{attachments.map((attachment) => <div className="content-attachment-row" key={attachment.id}><a href={`/api/content-attachments/${attachment.id}/download`}><FileText size={15} /><span>{attachment.name}</span><small>{formatAttachmentSize(attachment.sizeBytes)}</small></a></div>)}</div>}</div>;
}
