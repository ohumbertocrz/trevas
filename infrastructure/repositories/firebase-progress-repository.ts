import type { ProgressRepository } from "@/application/ports/progress-repository";
import type { LessonProgress, LessonProgressInput } from "@/domain/learning/progress";
import { adminFirestore } from "@/infrastructure/firebase/admin";

const collectionName = "lessonProgress";

function progressId(userId: string, lessonId: string) {
  return `${userId}_${lessonId}`;
}

function toProgress(id: string, data: FirebaseFirestore.DocumentData): LessonProgress {
  return {
    id,
    userId: String(data.userId),
    lessonId: String(data.lessonId),
    lastPositionSeconds: Number(data.lastPositionSeconds ?? 0),
    durationSeconds: Number(data.durationSeconds ?? 0),
    percent: Number(data.percent ?? 0),
    completed: data.completed === true,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export class FirebaseProgressRepository implements ProgressRepository {
  async getLessonProgress(userId: string, lessonId: string) {
    const snapshot = await adminFirestore().collection(collectionName).doc(progressId(userId, lessonId)).get();
    return snapshot.exists ? toProgress(snapshot.id, snapshot.data() ?? {}) : null;
  }

  async getLessonsProgress(userId: string, lessonIds: string[]) {
    if (lessonIds.length === 0) return [];
    const snapshots = await Promise.all(
      lessonIds.map((lessonId) => adminFirestore().collection(collectionName).doc(progressId(userId, lessonId)).get()),
    );
    return snapshots.filter((snapshot) => snapshot.exists).map((snapshot) => toProgress(snapshot.id, snapshot.data() ?? {}));
  }

  async saveLessonProgress(input: LessonProgressInput) {
    const lastPositionSeconds = Math.max(0, input.lastPositionSeconds);
    const durationSeconds = Math.max(0, input.durationSeconds);
    const percent = Math.min(100, Math.max(0, input.percent));
    await adminFirestore().collection(collectionName).doc(progressId(input.userId, input.lessonId)).set({
      userId: input.userId,
      lessonId: input.lessonId,
      lastPositionSeconds,
      durationSeconds,
      percent,
      completed: input.completed || percent >= 95,
      updatedAt: new Date(),
    }, { merge: true });
  }
}

export const progressRepository = new FirebaseProgressRepository();
