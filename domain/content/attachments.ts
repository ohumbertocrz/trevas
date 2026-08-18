export const ATTACHMENT_OWNER_TYPES = ["course", "module", "lesson", "case", "reference", "laboratory"] as const;
export type AttachmentOwnerType = (typeof ATTACHMENT_OWNER_TYPES)[number];

export interface ContentAttachment {
  id: string;
  ownerType: AttachmentOwnerType;
  ownerId: string;
  name: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  createdAt: Date | null;
}
