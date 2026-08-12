import { FieldValue } from "firebase-admin/firestore";
import type { AiUsage, AiUsageRepository } from "@/application/ports/ai-usage-repository";
import { adminFirestore } from "@/infrastructure/firebase/admin";

const LIMIT = 5;
function weekKey() { const date = new Date(); const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); const day = Math.floor((date.getTime() - first.getTime()) / 86400000); return `${date.getUTCFullYear()}-W${String(Math.ceil((day + first.getUTCDay() + 1) / 7)).padStart(2, "0")}`; }
function docId(userId: string) { return `${userId}_${weekKey()}`; }
export class FirebaseAiUsageRepository implements AiUsageRepository {
  async get(userId: string) { const snapshot = await adminFirestore().collection("aiUsage").doc(docId(userId)).get(); const data = snapshot.data() ?? {}; return { weekKey: weekKey(), used: Number(data.used ?? 0), limit: Number(data.limit ?? LIMIT) }; }
  async reserve(userId: string) { const reference = adminFirestore().collection("aiUsage").doc(docId(userId)); let usage: AiUsage = { weekKey: weekKey(), used: 0, limit: LIMIT }; await adminFirestore().runTransaction(async (transaction) => { const snapshot = await transaction.get(reference); const data = snapshot.data() ?? {}; const used = Number(data.used ?? 0); const limit = Number(data.limit ?? LIMIT); if (used >= limit) throw new Error("AI_QUOTA_EXCEEDED"); usage = { weekKey: weekKey(), used: used + 1, limit }; transaction.set(reference, { userId, weekKey: usage.weekKey, used: usage.used, limit, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }); return usage; }
  async complete(userId: string, reservationId: string, input: { promptChars: number; responseChars: number; model: string }) { await adminFirestore().collection("aiAnalyses").doc(reservationId).set({ userId, ...input, status: "completed", completedAt: FieldValue.serverTimestamp() }, { merge: true }); }
  async refund(userId: string, reservationId: string) { const reference = adminFirestore().collection("aiUsage").doc(docId(userId)); await adminFirestore().runTransaction(async (transaction) => { const snapshot = await transaction.get(reference); const used = Math.max(0, Number(snapshot.data()?.used ?? 0) - 1); transaction.set(reference, { used, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }); await adminFirestore().collection("aiAnalyses").doc(reservationId).set({ userId, status: "refunded", refundedAt: FieldValue.serverTimestamp() }, { merge: true }); }
}
export const aiUsageRepository = new FirebaseAiUsageRepository();
