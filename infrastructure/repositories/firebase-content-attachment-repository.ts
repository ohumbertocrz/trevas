import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { ContentAttachmentRepository } from "@/application/ports/content-attachment-repository";
import { ATTACHMENT_OWNER_TYPES, type AttachmentOwnerType, type ContentAttachment } from "@/domain/content/attachments";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function fromData(id: string, data: FirebaseFirestore.DocumentData): ContentAttachment {
  const ownerType = ATTACHMENT_OWNER_TYPES.includes(data.ownerType as AttachmentOwnerType) ? data.ownerType as AttachmentOwnerType : "lesson";
  return { id, ownerType, ownerId: String(data.ownerId ?? ""), name: String(data.name ?? "Arquivo"), storagePath: String(data.storagePath ?? ""), contentType: String(data.contentType ?? "application/octet-stream"), sizeBytes: Number(data.sizeBytes ?? 0), createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null };
}

export class FirebaseContentAttachmentRepository implements ContentAttachmentRepository {
  async list(ownerType: AttachmentOwnerType, ownerId: string) {
    const snapshot = await adminFirestore().collection("contentAttachments").where("ownerType", "==", ownerType).where("ownerId", "==", ownerId).get();
    return snapshot.docs.map((document) => fromData(document.id, document.data())).sort((a, b) => a.name.localeCompare(b.name));
  }

  async create(input: Omit<ContentAttachment, "id" | "createdAt">, actorId: string) {
    const db = adminFirestore();
    const reference = db.collection("contentAttachments").doc();
    await reference.set({ ...input, createdAt: FieldValue.serverTimestamp(), uploadedBy: actorId });
    return reference.id;
  }

  async get(id: string) {
    const document = await adminFirestore().collection("contentAttachments").doc(id).get();
    return document.exists ? fromData(document.id, document.data() ?? {}) : null;
  }

  async delete(id: string, actorId: string) {
    const db = adminFirestore();
    const reference = db.collection("contentAttachments").doc(id);
    const attachment = await reference.get();
    if (!attachment.exists) return;
    await reference.delete();
    await db.collection("auditLogs").add({ actorId, action: "contentAttachment.deleted", entity: "contentAttachment", entityId: id, createdAt: FieldValue.serverTimestamp() });
  }
}

export const contentAttachmentRepository = new FirebaseContentAttachmentRepository();
