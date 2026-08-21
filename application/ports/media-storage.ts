export const LESSON_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
export const LESSON_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const REFERENCE_COVER_MAX_BYTES = 2 * 1024 * 1024;
export const REFERENCE_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const TRANSCRIPT_MEDIA_TYPES = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "video/mp4", "video/webm", "video/quicktime"] as const;
export const CONTENT_ATTACHMENT_MAX_BYTES = 50 * 1024 * 1024;

export interface MediaStorage {
  saveLessonThumbnail(input: {
    actorId: string;
    courseId: string;
    lessonId: string;
    file: File;
  }): Promise<string>;
  readLessonThumbnail(path: string): Promise<{ bytes: Buffer; contentType: string }>;
  deleteLessonThumbnail(path: string): Promise<void>;
  saveReferenceCover(input: { actorId: string; referenceId: string; file: File }): Promise<string>;
  readReferenceCover(path: string): Promise<{ bytes: Buffer; contentType: string }>;
  deleteReferenceCover(path: string): Promise<void>;
  saveLessonTranscriptMedia(input: { actorId: string; courseId: string; lessonId: string; file: File }): Promise<string>;
  deleteLessonTranscriptMedia(path: string): Promise<void>;
  saveContentAttachment(input: { actorId: string; ownerType: string; ownerId: string; file: File }): Promise<string>;
  deleteContentAttachment(path: string): Promise<void>;
}
