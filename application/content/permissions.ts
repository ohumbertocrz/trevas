import type { AuthenticatedUser } from "@/domain/access/entities";

export function canManageContent(user: AuthenticatedUser) {
  return user.roles.some((role) => role === "admin" || role === "editor");
}

export function assertCanManageContent(user: AuthenticatedUser) {
  if (!canManageContent(user)) throw new Error("Sem permissão para gerenciar conteúdo.");
}

export function canPrepareTranscription(user: AuthenticatedUser) {
  return user.roles.some((role) => role === "admin" || role === "editor" || role === "teacher");
}

export function assertCanPrepareTranscription(user: AuthenticatedUser) {
  if (!canPrepareTranscription(user)) throw new Error("Sem permissão para preparar transcrições.");
}
