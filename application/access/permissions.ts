import type { Entitlement, UserRole } from "@/domain/access/entities";

export const TREVAS_PRODUCT_ID = "trevas-completo";

const administrativeRoles = new Set<UserRole>(["admin", "editor", "support", "teacher"]);

export function hasAdministrativeAccess(roles: UserRole[]) {
  return roles.some((role) => administrativeRoles.has(role));
}

export function hasActiveEntitlement(entitlement: Entitlement | null, now = new Date()) {
  if (!entitlement || entitlement.status !== "active") return false;
  if (entitlement.startsAt > now) return false;
  return entitlement.expiresAt === null || entitlement.expiresAt > now;
}
