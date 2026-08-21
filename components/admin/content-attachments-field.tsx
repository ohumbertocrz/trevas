"use client";

import { ChangeEvent, useId, useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import type { ContentAttachment } from "@/domain/content/attachments";
import { formatAttachmentSize } from "@/application/services/content-attachments";

export function ContentAttachmentsField({ attachments }: { attachments?: ContentAttachment[] }) {
  const inputId = useId();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? [], (file) => file.name));
  }

  const selectedLabel = selectedFiles.length === 0
    ? "Nenhum arquivo escolhido"
    : selectedFiles.length === 1
      ? selectedFiles[0]
      : `${selectedFiles.length} arquivos escolhidos`;

  return <div className="full-field content-attachments-field"><span className="field-label"><Paperclip size={14} />Arquivos anexos</span><div className="file-picker"><input id={inputId} className="file-picker-input" name="attachments" type="file" multiple onChange={handleFileChange} /><label className="file-picker-button" htmlFor={inputId}>Escolher arquivos</label><span className="file-picker-name" title={selectedLabel}>{selectedLabel}</span></div><small className="form-hint">Vários arquivos, até 50 MB cada.</small>{attachments && attachments.length > 0 && <div className="content-attachment-list">{attachments.map((attachment) => <div className="content-attachment-row" key={attachment.id}><a href={`/api/content-attachments/${attachment.id}/download`}><FileText size={15} /><span>{attachment.name}</span><small>{formatAttachmentSize(attachment.sizeBytes)}</small></a></div>)}</div>}</div>;
}
