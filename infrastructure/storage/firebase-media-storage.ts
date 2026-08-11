import { randomUUID } from "node:crypto";
import { LESSON_THUMBNAIL_MAX_BYTES, LESSON_THUMBNAIL_TYPES, type MediaStorage } from "@/application/ports/media-storage";
import { adminStorage } from "@/infrastructure/firebase/admin";

const extensionByType: Record<(typeof LESSON_THUMBNAIL_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class FirebaseMediaStorage implements MediaStorage {
  async saveLessonThumbnail(input: { actorId: string; courseId: string; lessonId: string; file: File }) {
    if (input.file.size > LESSON_THUMBNAIL_MAX_BYTES) throw new Error("A thumbnail deve ter no máximo 2 MB.");
    if (!LESSON_THUMBNAIL_TYPES.includes(input.file.type as (typeof LESSON_THUMBNAIL_TYPES)[number])) {
      throw new Error("A thumbnail deve ser JPG, PNG ou WebP.");
    }

    const extension = extensionByType[input.file.type as (typeof LESSON_THUMBNAIL_TYPES)[number]];
    const path = `lesson-thumbnails/${input.courseId}/${input.lessonId}/${randomUUID()}.${extension}`;
    await adminStorage().bucket().file(path).save(Buffer.from(await input.file.arrayBuffer()), {
      contentType: input.file.type,
      metadata: {
        cacheControl: "private, max-age=3600",
        metadata: { uploadedBy: input.actorId },
      },
      resumable: false,
    });
    return path;
  }

  async readLessonThumbnail(path: string) {
    if (!path.startsWith("lesson-thumbnails/")) throw new Error("Caminho de mídia inválido.");
    const file = adminStorage().bucket().file(path);
    const [metadata, download] = await Promise.all([file.getMetadata(), file.download()]);
    return { bytes: download[0], contentType: metadata[0].contentType || "application/octet-stream" };
  }
}

export const mediaStorage = new FirebaseMediaStorage();
