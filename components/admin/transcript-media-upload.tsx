"use client";

import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Check, Upload } from "lucide-react";
import { useState } from "react";
import { getFirebaseApp } from "@/infrastructure/firebase/client";

const allowed = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "video/mp4", "video/webm", "video/quicktime"];
export function TranscriptMediaUpload({ courseId, lessonId, initialPath }: { courseId: string; lessonId: string; initialPath: string }) {
  const [path, setPath] = useState(initialPath); const [progress, setProgress] = useState(0); const [message, setMessage] = useState<string | null>(null);
  function upload(file: File | undefined) { if (!file) return; if (!allowed.includes(file.type)) { setMessage("Formato de áudio ou vídeo não suportado."); return; } setMessage(null); const extension = file.name.split(".").pop()?.toLowerCase() || "bin"; const target = `lesson-transcripts/${courseId}/${lessonId}/${crypto.randomUUID()}.${extension}`; const task = uploadBytesResumable(ref(getStorage(getFirebaseApp()), target), file, { contentType: file.type, customMetadata: { lessonId } }); task.on("state_changed", (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)), () => setMessage("Não foi possível enviar a mídia."), () => { setPath(target); setMessage("Mídia enviada."); }); }
  return <div className="transcript-media-upload"><input type="hidden" name="transcriptMediaPath" value={path} /><label className="ghost-button upload-trigger"><Upload size={16} />Selecionar áudio ou vídeo<input type="file" accept="audio/*,video/*" onChange={(event) => upload(event.target.files?.[0])} /></label>{progress > 0 && progress < 100 && <progress value={progress} max="100" />}{path && <small><Check size={14} />Mídia pronta para transcrição</small>}{message && <small className="form-message">{message}</small>}</div>;
}
