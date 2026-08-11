export const LESSON_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
export const LESSON_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export interface MediaStorage {
  saveLessonThumbnail(input: {
    actorId: string;
    courseId: string;
    lessonId: string;
    file: File;
  }): Promise<string>;
  readLessonThumbnail(path: string): Promise<{ bytes: Buffer; contentType: string }>;
}
