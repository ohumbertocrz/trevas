export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
  updatedAt: Date | null;
}

export interface LessonProgressInput {
  userId: string;
  lessonId: string;
  lastPositionSeconds: number;
  durationSeconds: number;
  percent: number;
  completed: boolean;
}
