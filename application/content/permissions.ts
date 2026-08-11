import type { AuthenticatedUser } from "@/domain/access/entities";

export function canManageContent(user: AuthenticatedUser) {
  return user.roles.some((role) => role === "admin" || role === "editor");
}

export function assertCanManageContent(user: AuthenticatedUser) {
  if (!canManageContent(user)) throw new Error("Sem permissão para gerenciar conteúdo.");
}
