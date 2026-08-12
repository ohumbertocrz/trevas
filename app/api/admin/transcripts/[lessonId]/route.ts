import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdministrativeUser } from "@/application/access/session";
import { assertCanPrepareTranscription } from "@/application/content/permissions";
import { getGeminiServer } from "@/application/services/gemini-server";
import { adminFirestore, adminStorage } from "@/infrastructure/firebase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const user = await requireAdministrativeUser(); assertCanPrepareTranscription(user);
  const { lessonId } = await params; const body = await request.json().catch(() => ({})); const action = String(body.action ?? "");
  const reference = adminFirestore().collection("lessons").doc(lessonId); const snapshot = await reference.get(); if (!snapshot.exists) return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 }); const lesson = snapshot.data() ?? {};
  if (action === "reject") { await reference.set({ transcriptStatus: "rejected", updatedAt: FieldValue.serverTimestamp(), updatedBy: user.id }, { merge: true }); return NextResponse.json({ message: "Preparação rejeitada." }); }
  if (action === "approve") { const draft = String(lesson.transcriptDraft ?? ""); if (!draft) return NextResponse.json({ error: "Não há rascunho para aprovar." }, { status: 400 }); await reference.set({ transcript: draft, transcriptStatus: "approved", transcriptApprovedAt: FieldValue.serverTimestamp(), transcriptApprovedBy: user.id, updatedAt: FieldValue.serverTimestamp(), updatedBy: user.id }, { merge: true }); return NextResponse.json({ message: "Transcrição aprovada e liberada para a IA." }); }
  if (action !== "generate") return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  const mediaPath = String(lesson.transcriptMediaPath ?? ""); if (!mediaPath.startsWith("lesson-transcripts/")) return NextResponse.json({ error: "Nenhuma mídia de transcrição foi enviada." }, { status: 400 });
  await reference.set({ transcriptStatus: "processing", updatedAt: FieldValue.serverTimestamp(), updatedBy: user.id }, { merge: true });
  try {
    const [download, metadata] = await Promise.all([adminStorage().bucket().file(mediaPath).download(), adminStorage().bucket().file(mediaPath).getMetadata()]); const base64 = download[0].toString("base64"); const contentType = metadata[0].contentType ?? "audio/mpeg";
    const result = await getGeminiServer().models.generateContent({ model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash", contents: [{ role: "user", parts: [{ inlineData: { mimeType: contentType, data: base64 } }, { text: "Transcreva este áudio ou vídeo em português. Retorne apenas a transcrição, preservando a ordem da fala e incluindo timestamps aproximados no formato [MM:SS] a cada mudança de assunto ou a cada 30 segundos. Não resuma e não invente conteúdo." }] }] });
    const transcriptDraft = result.text ?? ""; if (!transcriptDraft) throw new Error("A IA não retornou uma transcrição."); await reference.set({ transcriptDraft, transcriptStatus: "review", transcriptGeneratedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: user.id }, { merge: true }); return NextResponse.json({ message: "Transcrição gerada e enviada para revisão." });
  } catch (error) { await reference.set({ transcriptStatus: "rejected", transcriptError: error instanceof Error ? error.message : "Erro desconhecido", updatedAt: FieldValue.serverTimestamp(), updatedBy: user.id }, { merge: true }); return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível gerar a transcrição." }, { status: 500 }); }
}
