import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { ReferenceInput, ReferenceRepository } from "@/application/ports/reference-repository";
import type { LibraryReference, ReferenceType } from "@/domain/library/references";
import { REFERENCE_TYPES } from "@/domain/library/references";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function referenceFromData(id: string, data: FirebaseFirestore.DocumentData): LibraryReference {
  return { id, title: String(data.title ?? ""), author: String(data.author ?? ""), coverUrl: String(data.coverUrl ?? ""), description: String(data.description ?? ""), type: REFERENCE_TYPES.includes(data.type as ReferenceType) ? data.type as ReferenceType : "livro", tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [], referenceUrl: String(data.referenceUrl ?? ""), lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds.filter((id): id is string => typeof id === "string") : [], caseIds: Array.isArray(data.caseIds) ? data.caseIds.filter((id): id is string => typeof id === "string") : [], status: CONTENT_STATUSES.includes(data.status) ? data.status : "draft", updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null };
}

export class FirebaseReferenceRepository implements ReferenceRepository {
  async listReferences() { const snapshot = await adminFirestore().collection("libraryReferences").get(); return snapshot.docs.map((document) => referenceFromData(document.id, document.data())); }
  async listPublishedReferences() { return (await this.listReferences()).filter((reference) => reference.status === "published"); }
  async getPublishedReference(referenceId: string) { const document = await adminFirestore().collection("libraryReferences").doc(referenceId).get(); if (!document.exists) return null; const reference = referenceFromData(document.id, document.data() ?? {}); return reference.status === "published" ? reference : null; }
  async createReference(input: ReferenceInput, actorId: string) { const db = adminFirestore(); const reference = db.collection("libraryReferences").doc(); const batch = db.batch(); batch.set(reference, { ...input, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }); this.audit(batch, actorId, "reference.created", reference.id); await batch.commit(); return reference.id; }
  async updateReference(referenceId: string, input: ReferenceInput, actorId: string) { const db = adminFirestore(); const batch = db.batch(); batch.set(db.collection("libraryReferences").doc(referenceId), { ...input, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }, { merge: true }); this.audit(batch, actorId, "reference.updated", referenceId); await batch.commit(); }
  private audit(batch: FirebaseFirestore.WriteBatch, actorId: string, action: string, entityId: string) { batch.set(adminFirestore().collection("auditLogs").doc(), { actorId, action, entity: "libraryReference", entityId, createdAt: FieldValue.serverTimestamp() }); }
}

export const referenceRepository = new FirebaseReferenceRepository();
