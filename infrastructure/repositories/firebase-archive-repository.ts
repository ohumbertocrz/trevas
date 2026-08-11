import type { ArchiveRepository, SaveArchiveItemInput } from "@/application/ports/archive-repository";
import type { ArchiveItem } from "@/domain/archive/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

const collectionName = "savedItems";

function itemId(type: string, targetId: string) { return `${type}_${targetId}`; }

function toArchiveItem(id: string, data: FirebaseFirestore.DocumentData): ArchiveItem {
  return { id, userId: String(data.userId), type: data.type, targetId: String(data.targetId), title: String(data.title ?? ""), description: String(data.description ?? ""), href: String(data.href ?? "#"), createdAt: data.createdAt?.toDate?.() ?? null };
}

export class FirebaseArchiveRepository implements ArchiveRepository {
  async listForUser(userId: string) {
    const snapshot = await adminFirestore().collection(collectionName).where("userId", "==", userId).get();
    return snapshot.docs.map((doc) => toArchiveItem(doc.id, doc.data())).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }
  async getForUser(userId: string, type: ArchiveItem["type"], targetId: string) {
    const snapshot = await adminFirestore().collection(collectionName).doc(`${userId}_${itemId(type, targetId)}`).get();
    return snapshot.exists ? toArchiveItem(snapshot.id, snapshot.data() ?? {}) : null;
  }
  async save(input: SaveArchiveItemInput) {
    await adminFirestore().collection(collectionName).doc(`${input.userId}_${itemId(input.type, input.targetId)}`).set({ ...input, createdAt: new Date() }, { merge: true });
  }
  async remove(userId: string, type: ArchiveItem["type"], targetId: string) {
    await adminFirestore().collection(collectionName).doc(`${userId}_${itemId(type, targetId)}`).delete();
  }
}

export const archiveRepository = new FirebaseArchiveRepository();
