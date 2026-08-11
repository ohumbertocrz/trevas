export interface LessonNote {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestampSeconds: number | null;
  createdAt: Date | null;
}
