import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { LaboratoryInput, LaboratoryRepository } from "@/application/ports/laboratory-repository";
import type { Laboratory, LaboratoryAttempt } from "@/domain/laboratory/entities";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function laboratoryFromData(id: string, data: FirebaseFirestore.DocumentData): Laboratory {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  return {
    id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    description: String(data.description ?? ""),
    caseText: String(data.caseText ?? ""),
    source: String(data.source ?? ""),
    officialAnalysis: String(data.officialAnalysis ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
    questions: questions.map((question: unknown, index: number) => ({
      id: typeof question === "object" && question !== null && "id" in question ? String(question.id) : `question-${index + 1}`,
      prompt: typeof question === "object" && question !== null && "prompt" in question ? String(question.prompt) : String(question),
      order: index + 1,
    })),
    lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds.filter((lessonId): lessonId is string => typeof lessonId === "string") : [],
    status: CONTENT_STATUSES.includes(data.status) ? data.status : "draft",
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  };
}

function attemptFromData(id: string, data: FirebaseFirestore.DocumentData): LaboratoryAttempt {
  return {
    id,
    laboratoryId: String(data.laboratoryId ?? ""),
    userId: String(data.userId ?? ""),
    answers: data.answers && typeof data.answers === "object" ? data.answers as Record<string, string> : {},
    submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : null,
  };
}

export class FirebaseLaboratoryRepository implements LaboratoryRepository {
  async listLaboratories() {
    const snapshot = await adminFirestore().collection("laboratories").get();
    return snapshot.docs.sort((left, right) => String(left.data().title ?? "").localeCompare(String(right.data().title ?? ""))).map((document) => laboratoryFromData(document.id, document.data()));
  }

  async listPublishedLaboratories() {
    return (await this.listLaboratories()).filter((laboratory) => laboratory.status === "published");
  }

  async getPublishedLaboratory(slug: string) {
    const laboratory = (await this.listPublishedLaboratories()).find((item) => item.slug === slug);
    return laboratory ?? null;
  }

  async createLaboratory(input: LaboratoryInput, actorId: string) {
    const db = adminFirestore();
    const reference = db.collection("laboratories").doc();
    const batch = db.batch();
    batch.set(reference, { ...this.serialize(input), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId });
    this.audit(batch, actorId, "laboratory.created", reference.id);
    await batch.commit();
    return reference.id;
  }

  async updateLaboratory(laboratoryId: string, input: LaboratoryInput, actorId: string) {
    const db = adminFirestore();
    const batch = db.batch();
    batch.set(db.collection("laboratories").doc(laboratoryId), { ...this.serialize(input), updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }, { merge: true });
    this.audit(batch, actorId, "laboratory.updated", laboratoryId);
    await batch.commit();
  }

  async getAttempt(userId: string, laboratoryId: string) {
    const document = await adminFirestore().collection("laboratoryAttempts").doc(`${userId}_${laboratoryId}`).get();
    return document.exists ? attemptFromData(document.id, document.data() ?? {}) : null;
  }

  async submitAttempt(input: { userId: string; laboratoryId: string; answers: Record<string, string> }) {
    const db = adminFirestore();
    await db.collection("laboratoryAttempts").doc(`${input.userId}_${input.laboratoryId}`).set({ ...input, submittedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }

  private serialize(input: LaboratoryInput) {
    return {
      ...input,
      questions: input.questions.map((prompt, index) => ({ id: `question-${index + 1}`, prompt, order: index + 1 })),
    };
  }

  private audit(batch: FirebaseFirestore.WriteBatch, actorId: string, action: string, entityId: string) {
    batch.set(adminFirestore().collection("auditLogs").doc(), { actorId, action, entity: "laboratory", entityId, createdAt: FieldValue.serverTimestamp() });
  }
}

export const laboratoryRepository = new FirebaseLaboratoryRepository();
