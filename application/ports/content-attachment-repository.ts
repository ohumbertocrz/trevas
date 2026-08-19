import type { ContentAttachment, AttachmentOwnerType } from "@/domain/content/attachments";

export interface ContentAttachmentRepository {
  list(ownerType: AttachmentOwnerType, ownerId: string): Promise<ContentAttachment[]>;
  listAll(): Promise<ContentAttachment[]>;
  create(input: Omit<ContentAttachment, "id" | "createdAt">, actorId: string): Promise<string>;
  get(id: string): Promise<ContentAttachment | null>;
  delete(id: string, actorId: string): Promise<void>;
}
