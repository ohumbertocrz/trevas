import type { LessonNote } from "@/domain/learning/notes";

export interface LessonNoteRepository {
  listForLesson(userId: string, lessonId: string): Promise<LessonNote[]>;
  create(input: { userId: string; lessonId: string; content: string; timestampSeconds: number | null }): Promise<void>;
  delete(userId: string, noteId: string): Promise<void>;
}
