import type { AttachmentOwnerType, ContentAttachment } from "@/domain/content/attachments";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { mediaStorage } from "@/infrastructure/storage/firebase-media-storage";

export async function saveContentAttachments(formData: FormData, ownerType: AttachmentOwnerType, ownerId: string, actorId: string) {
  const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  for (const file of files) {
    const storagePath = await mediaStorage.saveContentAttachment({ actorId, ownerType, ownerId, file });
    await contentAttachmentRepository.create({ ownerType, ownerId, name: file.name, storagePath, contentType: file.type || "application/octet-stream", sizeBytes: file.size }, actorId);
  }
}

export async function deleteContentAttachment(id: string, actorId: string) {
  const attachment = await contentAttachmentRepository.get(id);
  if (!attachment) return;
  await mediaStorage.deleteContentAttachment(attachment.storagePath);
  await contentAttachmentRepository.delete(id, actorId);
}

export function formatAttachmentSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type AttachmentList = ContentAttachment[];
