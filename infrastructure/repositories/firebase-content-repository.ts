import { FieldValue, Timestamp, type WriteBatch } from "firebase-admin/firestore";
import type { ContentRepository, CourseInput, LessonInput, ModuleInput } from "@/application/ports/content-repository";
import type { ContentStatus, CourseContent, CourseModuleContent, LessonContent } from "@/domain/content/entities";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function asStatus(value: unknown): ContentStatus {
  return CONTENT_STATUSES.includes(value as ContentStatus) ? value as ContentStatus : "draft";
}

function asDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate() : null;
}

function audit(batch: WriteBatch, actorId: string, action: string, entity: string, entityId: string) {
  batch.set(adminFirestore().collection("auditLogs").doc(), {
    actorId,
    action,
    entity,
    entityId,
    createdAt: FieldValue.serverTimestamp(),
  });
}

function lessonFromData(id: string, data: FirebaseFirestore.DocumentData): LessonContent {
  return {
    id,
    courseId: String(data.courseId ?? ""),
    moduleId: String(data.moduleId ?? ""),
    title: String(data.title ?? ""),
    subtitle: String(data.subtitle ?? ""),
    slug: String(data.slug ?? ""),
    description: String(data.description ?? ""),
    status: asStatus(data.status),
    order: Number(data.order ?? 0),
    thumbnailUrl: String(data.thumbnailUrl ?? ""),
    vimeoId: String(data.vimeoId ?? ""),
    durationMinutes: Number(data.durationMinutes ?? 0),
    tags: Array.isArray(data.tags) ? data.tags.filter((tag): tag is string => typeof tag === "string") : [],
    transcript: String(data.transcript ?? ""),
    publishedAt: asDate(data.publishedAt),
    scheduledAt: asDate(data.scheduledAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export class FirebaseContentRepository implements ContentRepository {
  private db = adminFirestore;

  async listCourses() {
    const db = this.db();
    const snapshot = await db.collection("courses").orderBy("order").get();
    return Promise.all(snapshot.docs.map(async (document) => {
      const data = document.data();
      const [modules, lessons] = await Promise.all([
        db.collection("modules").where("courseId", "==", document.id).count().get(),
        db.collection("lessons").where("courseId", "==", document.id).count().get(),
      ]);
      return {
        id: document.id,
        title: String(data.title ?? ""),
        slug: String(data.slug ?? ""),
        description: String(data.description ?? ""),
        status: asStatus(data.status),
        order: Number(data.order ?? 0),
        moduleCount: modules.data().count,
        lessonCount: lessons.data().count,
        publishedAt: asDate(data.publishedAt),
        updatedAt: asDate(data.updatedAt),
      } satisfies CourseContent;
    }));
  }

  async getCourse(courseId: string) {
    const db = this.db();
    const document = await db.collection("courses").doc(courseId).get();
    if (!document.exists) return null;
    const data = document.data() ?? {};
    const [modules, lessons] = await Promise.all([
      db.collection("modules").where("courseId", "==", courseId).count().get(),
      db.collection("lessons").where("courseId", "==", courseId).count().get(),
    ]);
    return {
      id: document.id,
      title: String(data.title ?? ""),
      slug: String(data.slug ?? ""),
      description: String(data.description ?? ""),
      status: asStatus(data.status),
      order: Number(data.order ?? 0),
      moduleCount: modules.data().count,
      lessonCount: lessons.data().count,
      publishedAt: asDate(data.publishedAt),
      updatedAt: asDate(data.updatedAt),
    } satisfies CourseContent;
  }

  async createCourse(input: CourseInput, actorId: string) {
    const db = this.db();
    const last = await db.collection("courses").orderBy("order", "desc").limit(1).get();
    const order = Number(last.docs[0]?.data().order ?? 0) + 1;
    const reference = db.collection("courses").doc();
    const batch = db.batch();
    batch.set(reference, {
      ...input,
      order,
      publishedAt: input.status === "published" ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorId,
    });
    audit(batch, actorId, "course.created", "course", reference.id);
    await batch.commit();
    return reference.id;
  }

  async updateCourse(courseId: string, input: CourseInput, actorId: string) {
    const db = this.db();
    const batch = db.batch();
    batch.set(db.collection("courses").doc(courseId), {
      ...input,
      publishedAt: input.status === "published" ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorId,
    }, { merge: true });
    audit(batch, actorId, "course.updated", "course", courseId);
    await batch.commit();
  }

  async listModules(courseId: string) {
    const db = this.db();
    const snapshot = await db.collection("modules").where("courseId", "==", courseId).get();
    const documents = snapshot.docs.sort((left, right) => Number(left.data().order ?? 0) - Number(right.data().order ?? 0));
    return Promise.all(documents.map(async (document) => {
      const data = document.data();
      const lessons = await db.collection("lessons").where("moduleId", "==", document.id).count().get();
      return {
        id: document.id,
        courseId,
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        status: asStatus(data.status),
        order: Number(data.order ?? 0),
        lessonCount: lessons.data().count,
        updatedAt: asDate(data.updatedAt),
      } satisfies CourseModuleContent;
    }));
  }

  async createModule(input: ModuleInput, actorId: string) {
    const db = this.db();
    const existing = await db.collection("modules").where("courseId", "==", input.courseId).get();
    const lastOrder = Math.max(0, ...existing.docs.map((document) => Number(document.data().order ?? 0)));
    const reference = db.collection("modules").doc();
    const batch = db.batch();
    batch.set(reference, {
      ...input,
      order: lastOrder + 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorId,
    });
    audit(batch, actorId, "module.created", "module", reference.id);
    await batch.commit();
    return reference.id;
  }

  async updateModule(moduleId: string, input: ModuleInput, actorId: string) {
    const db = this.db();
    const batch = db.batch();
    batch.set(db.collection("modules").doc(moduleId), { ...input, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId }, { merge: true });
    audit(batch, actorId, "module.updated", "module", moduleId);
    await batch.commit();
  }

  async moveModule(courseId: string, moduleId: string, direction: "up" | "down", actorId: string) {
    await this.move("modules", "courseId", courseId, moduleId, direction, actorId, "module");
  }

  async listLessons(moduleId: string) {
    const snapshot = await this.db().collection("lessons").where("moduleId", "==", moduleId).get();
    return snapshot.docs
      .sort((left, right) => Number(left.data().order ?? 0) - Number(right.data().order ?? 0))
      .map((document) => lessonFromData(document.id, document.data()));
  }

  async getLesson(lessonId: string) {
    const document = await this.db().collection("lessons").doc(lessonId).get();
    return document.exists ? lessonFromData(document.id, document.data() ?? {}) : null;
  }

  async createLesson(input: LessonInput, actorId: string) {
    const db = this.db();
    const existing = await db.collection("lessons").where("moduleId", "==", input.moduleId).get();
    const lastOrder = Math.max(0, ...existing.docs.map((document) => Number(document.data().order ?? 0)));
    const reference = db.collection("lessons").doc();
    const batch = db.batch();
    batch.set(reference, {
      ...input,
      order: lastOrder + 1,
      scheduledAt: input.scheduledAt ? Timestamp.fromDate(input.scheduledAt) : null,
      publishedAt: input.status === "published" ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorId,
    });
    audit(batch, actorId, "lesson.created", "lesson", reference.id);
    await batch.commit();
    return reference.id;
  }

  async updateLesson(lessonId: string, input: LessonInput, actorId: string) {
    const db = this.db();
    const reference = db.collection("lessons").doc(lessonId);
    const current = await reference.get();
    const changedModule = current.exists && current.data()?.moduleId !== input.moduleId;
    let order = Number(current.data()?.order ?? 1);
    if (changedModule) {
      const targetLessons = await db.collection("lessons").where("moduleId", "==", input.moduleId).get();
      order = Math.max(0, ...targetLessons.docs.map((document) => Number(document.data().order ?? 0))) + 1;
    }
    const batch = db.batch();
    batch.set(reference, {
      ...input,
      order,
      scheduledAt: input.scheduledAt ? Timestamp.fromDate(input.scheduledAt) : null,
      publishedAt: input.status === "published" ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorId,
    }, { merge: true });
    audit(batch, actorId, "lesson.updated", "lesson", lessonId);
    await batch.commit();
  }

  async moveLesson(moduleId: string, lessonId: string, direction: "up" | "down", actorId: string) {
    await this.move("lessons", "moduleId", moduleId, lessonId, direction, actorId, "lesson");
  }

  private async move(collection: "modules" | "lessons", parentField: "courseId" | "moduleId", parentId: string, itemId: string, direction: "up" | "down", actorId: string, entity: string) {
    const db = this.db();
    const snapshot = await db.collection(collection).where(parentField, "==", parentId).get();
    const documents = snapshot.docs.sort((left, right) => Number(left.data().order ?? 0) - Number(right.data().order ?? 0));
    const index = documents.findIndex((document) => document.id === itemId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= documents.length) return;
    const current = documents[index];
    const target = documents[targetIndex];
    const batch = db.batch();
    batch.update(current.ref, { order: target.data().order, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId });
    batch.update(target.ref, { order: current.data().order, updatedAt: FieldValue.serverTimestamp(), updatedBy: actorId });
    audit(batch, actorId, `${entity}.reordered`, entity, itemId);
    await batch.commit();
  }
}

export const contentRepository = new FirebaseContentRepository();
