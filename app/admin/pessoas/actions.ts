"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdministrativeUser } from "@/application/access/session";
import { TREVAS_PRODUCT_ID } from "@/application/access/permissions";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";
import { adminAuth, adminFirestore } from "@/infrastructure/firebase/admin";
import { brevoEmailProvider } from "@/infrastructure/providers/brevo-email-provider";

const accessSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().trim().min(3).max(300),
  expiresAt: z.string().optional(),
});

const inviteSchema = z.object({ displayName: z.string().trim().min(2).max(120), email: z.string().trim().email().max(200) });

export async function inviteStudent(formData: FormData) {
  const actor = await requireAdministrativeUser();
  if (!actor.roles.some((role) => role === "admin" || role === "support")) throw new Error("Sem permissão para cadastrar alunos.");
  const input = inviteSchema.parse(Object.fromEntries(formData));
  let authUser;
  try {
    authUser = await adminAuth().getUserByEmail(input.email);
    throw new Error("Já existe uma conta com este e-mail.");
  } catch (error) {
    if (error instanceof Error && error.message === "Já existe uma conta com este e-mail.") throw error;
    const errorCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (errorCode !== "auth/user-not-found") throw error;
    authUser = await adminAuth().createUser({ email: input.email, displayName: input.displayName });
  }
  const db = adminFirestore();
  const batch = db.batch();
  batch.set(db.collection("users").doc(authUser.uid), { displayName: input.displayName, email: input.email, roles: ["student"], status: "invited", createdAt: new Date(), updatedAt: new Date(), invitedBy: actor.id });
  batch.set(db.collection("auditLogs").doc(), { actorId: actor.id, action: "user.invited", entity: "user", entityId: authUser.uid, email: input.email, createdAt: new Date() });
  await batch.commit();
  const resetLink = await adminAuth().generatePasswordResetLink(input.email);
  await brevoEmailProvider.send({ to: [{ email: input.email, name: input.displayName }], subject: "Seu acesso à área de membros Trevas", html: `<p>Olá, ${input.displayName}.</p><p>Sua conta na área de membros Trevas foi criada. Clique no botão abaixo para definir sua senha e concluir o acesso.</p><p><a href="${resetLink}">Definir minha senha</a></p><p>Se você não esperava este convite, ignore esta mensagem.</p>`, tags: ["trevas-invite"] });
  revalidatePath("/admin/pessoas");
  redirect("/admin/pessoas?invited=1");
}

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
