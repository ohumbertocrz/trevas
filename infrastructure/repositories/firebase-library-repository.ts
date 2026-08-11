import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { LibraryRepository, MaterialInput } from "@/application/ports/library-repository";
import type { Material, MaterialType, MaterialVisibility } from "@/domain/library/entities";
import { MATERIAL_TYPES, MATERIAL_VISIBILITIES } from "@/domain/library/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function materialFromData(id: string, data: FirebaseFirestore.DocumentData): Material {
  return {
    id,
    title: String(data.title ?? ""),
    type: MATERIAL_TYPES.includes(data.type as MaterialType) ? data.type as MaterialType : "link",
    description: String(data.description ?? ""),
    sourceUrl: String(data.sourceUrl ?? ""),
    storagePath: String(data.storagePath ?? ""),
    visibility: MATERIAL_VISIBILITIES.includes(data.visibility as MaterialVisibility) ? data.visibility as MaterialVisibility : "draft",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
  };
}

export class FirebaseLibraryRepository implements LibraryRepository {
  async listMaterials() {
    const snapshot = await adminFirestore().collection("materials").get();
    return snapshot.docs
      .sort((left, right) => String(left.data().title ?? "").localeCompare(String(right.data().title ?? "")))
      .map((document) => materialFromData(document.id, document.data()));
  }

  async listMaterialsForLesson(lessonId: string) {
    const links = await adminFirestore().collection("lessonMaterials").where("lessonId", "==", lessonId).get();
    const materials = await Promise.all(links.docs.map(async (link) => {
      const material = await adminFirestore().collection("materials").doc(String(link.data().materialId)).get();
      return material.exists ? materialFromData(material.id, material.data() ?? {}) : null;
    }));
    return materials.filter((material): material is Material => material !== null);
  }

  async createMaterial(input: MaterialInput, actorId: string) {
    const db = adminFirestore();
    const reference = db.collection("materials").doc();
    const batch = db.batch();
    batch.set(reference, { ...input, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId });
    this.audit(batch, actorId, "material.created", reference.id);
    await batch.commit();
    return reference.id;
  }

  async updateMaterial(materialId: string, input: MaterialInput, actorId: string) {
    const db = adminFirestore();
    const batch = db.batch();
    batch.set(db.collection("materials").doc(materialId), { ...input, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }, { merge: true });
    this.audit(batch, actorId, "material.updated", materialId);
    await batch.commit();
  }

  async setLessonMaterials(lessonId: string, materialIds: string[], actorId: string) {
    const db = adminFirestore();
    const validMaterials = await Promise.all(materialIds.map((id) => db.collection("materials").doc(id).get()));
    const batch = db.batch();
    const current = await db.collection("lessonMaterials").where("lessonId", "==", lessonId).get();
    current.docs.forEach((document) => batch.delete(document.ref));
    validMaterials.filter((document) => document.exists).forEach((document, order) => {
      const reference = db.collection("lessonMaterials").doc(`${lessonId}_${document.id}`);
      batch.set(reference, { lessonId, materialId: document.id, order, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId });
    });
    this.audit(batch, actorId, "lesson.materials_updated", lessonId);
    await batch.commit();
  }

  private audit(batch: FirebaseFirestore.WriteBatch, actorId: string, action: string, entityId: string) {
    batch.set(adminFirestore().collection("auditLogs").doc(), { actorId, action, entity: "material", entityId, createdAt: FieldValue.serverTimestamp() });
  }
}

export const libraryRepository = new FirebaseLibraryRepository();
