"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { lessonNoteRepository } from "@/infrastructure/repositories/firebase-lesson-note-repository";

const noteSchema = z.object({ lessonId: z.string().min(1), slug: z.string().min(1), content: z.string().trim().min(2).max(5000), timestampSeconds: z.preprocess((value) => value === "" ? null : value, z.coerce.number().finite().min(0).nullable().optional()) });
async function user() { const current = await getAuthenticatedUser(); if (!current || (!hasAdministrativeAccess(current.roles) && !hasActiveEntitlement(current.entitlement))) throw new Error("Não autorizado."); return current; }
export async function createLessonNote(formData: FormData) { const current = await user(); const value = noteSchema.parse(Object.fromEntries(formData)); const lesson = await contentRepository.getLesson(value.lessonId); if (!lesson || lesson.status !== "published") throw new Error("Aula não encontrada."); await lessonNoteRepository.create({ userId: current.id, lessonId: value.lessonId, content: value.content, timestampSeconds: value.timestampSeconds ?? null }); revalidatePath(`/app/aula/${value.slug}`); }
export async function deleteLessonNote(formData: FormData) { const current = await user(); const noteId = String(formData.get("noteId") ?? ""); const slug = String(formData.get("slug") ?? ""); if (!noteId || !slug) throw new Error("Anotação não informada."); await lessonNoteRepository.delete(current.id, noteId); revalidatePath(`/app/aula/${slug}`); }
