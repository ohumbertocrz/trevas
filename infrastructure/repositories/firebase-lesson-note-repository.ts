import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { LessonNoteRepository } from "@/application/ports/lesson-note-repository";
import type { LessonNote } from "@/domain/learning/notes";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function noteFromData(id: string, data: FirebaseFirestore.DocumentData): LessonNote { return { id, userId: String(data.userId), lessonId: String(data.lessonId), content: String(data.content ?? ""), timestampSeconds: typeof data.timestampSeconds === "number" ? data.timestampSeconds : null, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null }; }
export class FirebaseLessonNoteRepository implements LessonNoteRepository {
  async listForLesson(userId: string, lessonId: string) { const snapshot = await adminFirestore().collection("lessonNotes").where("userId", "==", userId).where("lessonId", "==", lessonId).get(); return snapshot.docs.map((document) => noteFromData(document.id, document.data())).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)); }
  async create(input: { userId: string; lessonId: string; content: string; timestampSeconds: number | null }) { await adminFirestore().collection("lessonNotes").doc().set({ ...input, createdAt: FieldValue.serverTimestamp() }); }
  async delete(userId: string, noteId: string) { const reference = adminFirestore().collection("lessonNotes").doc(noteId); const document = await reference.get(); if (document.exists && document.data()?.userId === userId) await reference.delete(); }
}
export const lessonNoteRepository = new FirebaseLessonNoteRepository();
