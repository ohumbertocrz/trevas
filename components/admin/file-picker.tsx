"use client";

import { ChangeEvent, useId, useState } from "react";

export function FilePicker({ name, accept, multiple = false }: { name: string; accept?: string; multiple?: boolean }) {
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

  return <div className="file-picker"><input id={inputId} className="file-picker-input" name={name} type="file" accept={accept} multiple={multiple} onChange={handleFileChange} /><label className="file-picker-button" htmlFor={inputId}>Escolher arquivos</label><span className="file-picker-name" title={selectedLabel}>{selectedLabel}</span></div>;
}
