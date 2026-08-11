"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdministrativeUser } from "@/application/access/session";
import { TREVAS_PRODUCT_ID } from "@/application/access/permissions";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";

const accessSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().trim().min(3).max(300),
  expiresAt: z.string().optional(),
});

export async function grantAccess(formData: FormData) {
  const actor = await requireAdministrativeUser();
  if (!actor.roles.some((role) => role === "admin" || role === "support")) throw new Error("Sem permissão para gerenciar acessos.");
  const input = accessSchema.parse(Object.fromEntries(formData));
  await adminAccessRepository.grantEntitlement({
    actorId: actor.id,
    userId: input.userId,
    productId: TREVAS_PRODUCT_ID,
    origin: "MANUAL",
    expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T23:59:59`) : null,
    reason: input.reason,
  });
  revalidatePath("/admin/pessoas");
}

export async function revokeAccess(formData: FormData) {
  const actor = await requireAdministrativeUser();
  if (!actor.roles.some((role) => role === "admin" || role === "support")) throw new Error("Sem permissão para gerenciar acessos.");
  const input = accessSchema.pick({ userId: true, reason: true }).parse(Object.fromEntries(formData));
  await adminAccessRepository.revokeEntitlement({ actorId: actor.id, userId: input.userId, productId: TREVAS_PRODUCT_ID, reason: input.reason });
  revalidatePath("/admin/pessoas");
}
