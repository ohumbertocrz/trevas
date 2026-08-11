"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCanManageContent } from "@/application/content/permissions";
import { requireAdministrativeUser } from "@/application/access/session";
import { MATERIAL_TYPES, MATERIAL_VISIBILITIES } from "@/domain/library/entities";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";

const materialSchema = z.object({
  materialId: z.string().min(1).optional(),
  title: z.string().trim().min(3).max(160),
  type: z.enum(MATERIAL_TYPES),
  description: z.string().trim().max(2000).optional().default(""),
  sourceUrl: z.string().trim().url().max(2000),
  visibility: z.enum(MATERIAL_VISIBILITIES).default("draft"),
});

async function actor() {
  const user = await requireAdministrativeUser();
  assertCanManageContent(user);
  return user;
}

export async function createMaterial(formData: FormData) {
  const user = await actor();
  const input = materialSchema.parse(Object.fromEntries(formData));
  await libraryRepository.createMaterial({ ...input, storagePath: "" }, user.id);
  revalidatePath("/admin/biblioteca");
}

export async function updateMaterial(formData: FormData) {
  const user = await actor();
  const input = materialSchema.required({ materialId: true }).parse(Object.fromEntries(formData));
  await libraryRepository.updateMaterial(input.materialId, { ...input, storagePath: "" }, user.id);
  revalidatePath("/admin/biblioteca");
}
