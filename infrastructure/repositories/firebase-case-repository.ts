import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { CaseInput, CaseRepository } from "@/application/ports/case-repository";
import type { CaseType, TrevasCase } from "@/domain/archive/cases";
import { CASE_TYPES } from "@/domain/archive/cases";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function caseFromData(id: string, data: FirebaseFirestore.DocumentData): TrevasCase {
  return { id, title: String(data.title ?? ""), description: String(data.description ?? ""), thumbnailUrl: String(data.thumbnailUrl ?? ""), body: String(data.body ?? ""), source: String(data.source ?? ""), caseDate: String(data.caseDate ?? ""), type: CASE_TYPES.includes(data.type as CaseType) ? data.type as CaseType : "outro", tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [], techniques: Array.isArray(data.techniques) ? data.techniques.filter((technique): technique is string => typeof technique === "string") : [], analysis: String(data.analysis ?? ""), lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds.filter((lessonId): lessonId is string => typeof lessonId === "string") : [], status: CONTENT_STATUSES.includes(data.status) ? data.status : "draft", updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null };
}

export class FirebaseCaseRepository implements CaseRepository {
  async listCases() {
    const snapshot = await adminFirestore().collection("cases").get();
    return snapshot.docs.sort((a, b) => String(b.data().updatedAt ?? "").localeCompare(String(a.data().updatedAt ?? ""))).map((document) => caseFromData(document.id, document.data()));
  }
  async listPublishedCases() { return (await this.listCases()).filter((item) => item.status === "published"); }
  async getPublishedCase(caseId: string) { const document = await adminFirestore().collection("cases").doc(caseId).get(); if (!document.exists) return null; const item = caseFromData(document.id, document.data() ?? {}); return item.status === "published" ? item : null; }
  async createCase(input: CaseInput, actorId: string) { const db = adminFirestore(); const reference = db.collection("cases").doc(); const batch = db.batch(); batch.set(reference, { ...input, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }); this.audit(batch, actorId, "case.created", reference.id); await batch.commit(); return reference.id; }
  async updateCase(caseId: string, input: CaseInput, actorId: string) { const db = adminFirestore(); const batch = db.batch(); batch.set(db.collection("cases").doc(caseId), { ...input, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }, { merge: true }); this.audit(batch, actorId, "case.updated", caseId); await batch.commit(); }
  private audit(batch: FirebaseFirestore.WriteBatch, actorId: string, action: string, entityId: string) { batch.set(adminFirestore().collection("auditLogs").doc(), { actorId, action, entity: "case", entityId, createdAt: FieldValue.serverTimestamp() }); }
}

export const caseRepository = new FirebaseCaseRepository();
