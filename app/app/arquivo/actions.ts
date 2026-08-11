"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";

async function authorizedUser() {
  const user = await getAuthenticatedUser();
  if (!user || (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement))) throw new Error("Não autorizado.");
  return user;
}

export async function toggleLessonArchive(lessonId: string) {
  const user = await authorizedUser();
  const lesson = await contentRepository.getLesson(lessonId);
  if (!lesson || lesson.status !== "published") throw new Error("Aula não encontrada.");
  const existing = await archiveRepository.getForUser(user.id, "lesson", lessonId);
  if (existing) await archiveRepository.remove(user.id, "lesson", lessonId);
  else await archiveRepository.save({ userId: user.id, type: "lesson", targetId: lesson.id, title: lesson.title, description: lesson.subtitle || lesson.description, href: `/app/aula/${lesson.slug}` });
  revalidatePath("/app/arquivo");
  revalidatePath(`/app/aula/${lesson.slug}`);
  return { saved: !existing };
}

export async function toggleCaseArchive(caseId: string) {
  const user = await authorizedUser();
  const item = await caseRepository.getPublishedCase(caseId);
  if (!item) throw new Error("Caso não encontrado.");
  const existing = await archiveRepository.getForUser(user.id, "case", caseId);
  if (existing) await archiveRepository.remove(user.id, "case", caseId);
  else await archiveRepository.save({ userId: user.id, type: "case", targetId: item.id, title: item.title, description: item.description, href: `/app/arquivo/${item.id}` });
  revalidatePath("/app/meu-arquivo");
  revalidatePath(`/app/arquivo/${item.id}`);
  return { saved: !existing };
}

export async function toggleReferenceArchive(referenceId: string) {
  const user = await authorizedUser();
  const item = await referenceRepository.getPublishedReference(referenceId);
  if (!item) throw new Error("Referência não encontrada.");
  const existing = await archiveRepository.getForUser(user.id, "reference", referenceId);
  if (existing) await archiveRepository.remove(user.id, "reference", referenceId);
  else await archiveRepository.save({ userId: user.id, type: "reference", targetId: item.id, title: item.title, description: item.author || item.description, href: `/app/biblioteca/${item.id}` });
  revalidatePath("/app/meu-arquivo");
  revalidatePath(`/app/biblioteca/${item.id}`);
  return { saved: !existing };
}
