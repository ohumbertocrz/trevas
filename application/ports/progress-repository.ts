import type { LessonProgress, LessonProgressInput } from "@/domain/learning/progress";

export interface ProgressRepository {
  getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null>;
  getLessonsProgress(userId: string, lessonIds: string[]): Promise<LessonProgress[]>;
  saveLessonProgress(input: LessonProgressInput): Promise<void>;
}
