"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertCanManageContent } from "@/application/content/permissions";
import { LESSON_THUMBNAIL_MAX_BYTES, LESSON_THUMBNAIL_TYPES } from "@/application/ports/media-storage";
import { requireAdministrativeUser } from "@/application/access/session";
import { CONTENT_STATUSES, isVimeoEmbedUrl, slugifyContent } from "@/domain/content/entities";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { mediaStorage } from "@/infrastructure/storage/firebase-media-storage";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";

const identifier = z.string().min(1).max(128);
const status = z.enum(CONTENT_STATUSES);

const courseSchema = z.object({
  courseId: identifier.optional(),
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().max(140).optional(),
  description: z.string().trim().max(2000).optional().default(""),
  status: status.optional().default("draft"),
});

const moduleSchema = z.object({
  moduleId: identifier.optional(),
  courseId: identifier,
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(2000).optional().default(""),
  status: status.optional().default("draft"),
});

const lessonFields = {
  lessonId: identifier.optional(),
  courseId: identifier,
  moduleId: identifier,
  title: z.string().trim().min(3).max(160),
  subtitle: z.string().trim().max(200).optional().default(""),
  slug: z.string().trim().max(180).optional(),
  description: z.string().trim().max(8000).optional().default(""),
  status: status.optional().default("draft"),
  thumbnailPath: z.string().trim().max(1000).optional().default(""),
  vimeoEmbedUrl: z.string().trim().max(500).refine(isVimeoEmbedUrl, "Use uma URL de embed do player.vimeo.com.").optional().default(""),
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional().default(0),
  tags: z.string().trim().max(1000).optional().default(""),
  transcript: z.string().trim().max(200000).optional().default(""),
  transcriptMediaPath: z.string().trim().max(1000).optional().default(""),
  scheduledAt: z.string().optional().default(""),
};

function validateSchedule(input: { status: z.infer<typeof status>; scheduledAt: string }, context: z.RefinementCtx) {
  if (input.status === "scheduled" && !input.scheduledAt) {
    context.addIssue({ code: "custom", path: ["scheduledAt"], message: "Informe a data de publicação." });
  }
}

const lessonSchema = z.object(lessonFields).superRefine(validateSchedule);
const lessonUpdateSchema = z.object({ ...lessonFields, lessonId: identifier }).superRefine(validateSchedule);

async function contentActor() {
  const actor = await requireAdministrativeUser();
  assertCanManageContent(actor);
  return actor;
}

function lessonInput(input: z.infer<typeof lessonSchema>) {
  return {
    courseId: input.courseId,
    moduleId: input.moduleId,
    title: input.title,
    subtitle: input.subtitle,
    slug: slugifyContent(input.slug || input.title),
    description: input.description,
    status: input.status,
    thumbnailPath: input.thumbnailPath,
    vimeoEmbedUrl: input.vimeoEmbedUrl,
    durationMinutes: input.durationMinutes,
    tags: input.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    transcript: input.transcript,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
  };
}

export async function createCourse(formData: FormData) {
  const actor = await contentActor();
  const input = courseSchema.parse(Object.fromEntries(formData));
  const courseId = await contentRepository.createCourse({
    title: input.title,
    slug: slugifyContent(input.slug || input.title),
    description: input.description,
    status: "draft",
  }, actor.id);
  redirect(`/admin/cursos/${courseId}`);
}

export async function updateCourse(formData: FormData) {
  const actor = await contentActor();
  const input = courseSchema.required({ courseId: true }).parse(Object.fromEntries(formData));
  await contentRepository.updateCourse(input.courseId, {
    title: input.title,
    slug: slugifyContent(input.slug || input.title),
    description: input.description,
    status: input.status,
  }, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
  revalidatePath("/admin/cursos");
}

export async function createModule(formData: FormData) {
  const actor = await contentActor();
  const input = moduleSchema.parse(Object.fromEntries(formData));
  await contentRepository.createModule({ ...input, status: "draft" }, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
}

export async function updateModule(formData: FormData) {
  const actor = await contentActor();
  const input = moduleSchema.required({ moduleId: true }).parse(Object.fromEntries(formData));
  await contentRepository.updateModule(input.moduleId, {
    courseId: input.courseId,
    title: input.title,
    description: input.description,
    status: input.status,
  }, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
}

export async function moveModule(formData: FormData) {
  const actor = await contentActor();
  const input = z.object({ courseId: identifier, moduleId: identifier, direction: z.enum(["up", "down"]) }).parse(Object.fromEntries(formData));
  await contentRepository.moveModule(input.courseId, input.moduleId, input.direction, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
}

export async function createLesson(formData: FormData) {
  const actor = await contentActor();
  const input = lessonSchema.parse(Object.fromEntries(formData));
  const lessonId = await contentRepository.createLesson(lessonInput({ ...input, status: "draft" }), actor.id);
  redirect(`/admin/cursos/${input.courseId}/aulas/${lessonId}`);
}

export async function updateLesson(formData: FormData) {
  const actor = await contentActor();
  const input = lessonUpdateSchema.parse(Object.fromEntries(formData));
  const previousLesson = await contentRepository.getLesson(input.lessonId);
  let thumbnailPath = input.thumbnailPath;
  const thumbnail = formData.get("thumbnail");
  if (thumbnail instanceof File && thumbnail.size > 0) {
    if (thumbnail.size > LESSON_THUMBNAIL_MAX_BYTES) throw new Error("A thumbnail deve ter no máximo 2 MB.");
    if (!LESSON_THUMBNAIL_TYPES.includes(thumbnail.type as (typeof LESSON_THUMBNAIL_TYPES)[number])) throw new Error("A thumbnail deve ser JPG, PNG ou WebP.");
    thumbnailPath = await mediaStorage.saveLessonThumbnail({ actorId: actor.id, courseId: input.courseId, lessonId: input.lessonId, file: thumbnail });
  }
  let transcriptMediaPath = input.transcriptMediaPath || previousLesson?.transcriptMediaPath || "";
  if (transcriptMediaPath && !transcriptMediaPath.startsWith(`lesson-transcripts/${input.courseId}/${input.lessonId}/`)) throw new Error("Mídia de transcrição inválida.");
  await contentRepository.updateLesson(input.lessonId, { ...lessonInput(input), thumbnailPath, transcriptMediaPath }, actor.id);
  if (previousLesson?.transcriptMediaPath && previousLesson.transcriptMediaPath !== transcriptMediaPath) {
    await mediaStorage.deleteLessonTranscriptMedia(previousLesson.transcriptMediaPath);
  }
  const materialIds = formData.getAll("materialIds").filter((value): value is string => typeof value === "string");
  await libraryRepository.setLessonMaterials(input.lessonId, materialIds, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
  revalidatePath(`/admin/cursos/${input.courseId}/aulas/${input.lessonId}`);
}

export async function moveLesson(formData: FormData) {
  const actor = await contentActor();
  const input = z.object({ courseId: identifier, moduleId: identifier, lessonId: identifier, direction: z.enum(["up", "down"]) }).parse(Object.fromEntries(formData));
  await contentRepository.moveLesson(input.moduleId, input.lessonId, input.direction, actor.id);
  revalidatePath(`/admin/cursos/${input.courseId}`);
}
