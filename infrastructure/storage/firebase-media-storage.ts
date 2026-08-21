import { randomUUID } from "node:crypto";
import { CONTENT_ATTACHMENT_MAX_BYTES, LESSON_THUMBNAIL_MAX_BYTES, LESSON_THUMBNAIL_TYPES, REFERENCE_COVER_MAX_BYTES, REFERENCE_COVER_TYPES, type MediaStorage } from "@/application/ports/media-storage";
import { TRANSCRIPT_MEDIA_TYPES } from "@/application/ports/media-storage";
import { adminStorage } from "@/infrastructure/firebase/admin";

const extensionByType: Record<(typeof LESSON_THUMBNAIL_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const referenceCoverExtensionByType: Record<(typeof REFERENCE_COVER_TYPES)[number], string> = extensionByType;

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

  async deleteLessonThumbnail(path: string) {
    if (!path.startsWith("lesson-thumbnails/")) throw new Error("Caminho de thumbnail inválido.");
    await adminStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }

  async saveReferenceCover(input: { actorId: string; referenceId: string; file: File }) {
    if (input.file.size > REFERENCE_COVER_MAX_BYTES) throw new Error("A capa deve ter no máximo 2 MB.");
    if (!REFERENCE_COVER_TYPES.includes(input.file.type as (typeof REFERENCE_COVER_TYPES)[number])) throw new Error("A capa deve ser JPG, PNG ou WebP.");
    const extension = referenceCoverExtensionByType[input.file.type as (typeof REFERENCE_COVER_TYPES)[number]];
    const path = `reference-covers/${input.referenceId}/${randomUUID()}.${extension}`;
    await adminStorage().bucket().file(path).save(Buffer.from(await input.file.arrayBuffer()), { contentType: input.file.type, metadata: { cacheControl: "private, max-age=3600", metadata: { uploadedBy: input.actorId } }, resumable: false });
    return path;
  }

  async readReferenceCover(path: string) {
    if (!path.startsWith("reference-covers/")) throw new Error("Caminho de capa inválido.");
    const file = adminStorage().bucket().file(path);
    const [metadata, download] = await Promise.all([file.getMetadata(), file.download()]);
    return { bytes: download[0], contentType: metadata[0].contentType || "application/octet-stream" };
  }

  async deleteReferenceCover(path: string) {
    if (!path.startsWith("reference-covers/")) throw new Error("Caminho de capa inválido.");
    await adminStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }

  async saveLessonTranscriptMedia(input: { actorId: string; courseId: string; lessonId: string; file: File }) {
    if (!TRANSCRIPT_MEDIA_TYPES.includes(input.file.type as (typeof TRANSCRIPT_MEDIA_TYPES)[number])) throw new Error("Formato de áudio ou vídeo não suportado.");
    const extension = input.file.type.split("/")[1].replace("quicktime", "mov");
    const path = `lesson-transcripts/${input.courseId}/${input.lessonId}/${randomUUID()}.${extension}`;
    await adminStorage().bucket().file(path).save(Buffer.from(await input.file.arrayBuffer()), { contentType: input.file.type, metadata: { cacheControl: "private, max-age=3600", metadata: { uploadedBy: input.actorId } }, resumable: false });
    return path;
  }

  async deleteLessonTranscriptMedia(path: string) {
    if (!path.startsWith("lesson-transcripts/")) throw new Error("Caminho de mÃ­dia invÃ¡lido.");
    await adminStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }

  async saveContentAttachment(input: { actorId: string; ownerType: string; ownerId: string; file: File }) {
    if (input.file.size > CONTENT_ATTACHMENT_MAX_BYTES) throw new Error("Cada arquivo deve ter no mÃ¡ximo 50 MB.");
    if (!input.file.size) throw new Error("O arquivo estÃ¡ vazio.");
    if (!/^[a-z]+$/.test(input.ownerType) || !/^[a-zA-Z0-9_-]+$/.test(input.ownerId)) throw new Error("Destino de arquivo invÃ¡lido.");
    const safeName = input.file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "arquivo";
    const path = `protected/content-attachments/${input.ownerType}/${input.ownerId}/${randomUUID()}-${safeName}`;
    await adminStorage().bucket().file(path).save(Buffer.from(await input.file.arrayBuffer()), { contentType: input.file.type || "application/octet-stream", metadata: { cacheControl: "private, max-age=3600", metadata: { uploadedBy: input.actorId } }, resumable: false });
    return path;
  }

  async deleteContentAttachment(path: string) {
    if (!path.startsWith("protected/content-attachments/")) throw new Error("Caminho de anexo invÃ¡lido.");
    await adminStorage().bucket().file(path).delete({ ignoreNotFound: true });
  }
}

export const mediaStorage = new FirebaseMediaStorage();
