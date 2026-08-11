export const USER_ROLES = ["student", "admin", "editor", "support", "teacher"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = "active" | "blocked" | "invited";
export type EntitlementStatus = "active" | "expired" | "revoked" | "pending";
export type EntitlementOrigin = "HOTMART" | "MANUAL" | "CORTESIA" | "EQUIPE" | "TESTE";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
}

export interface Entitlement {
  id: string;
  userId: string;
  productId: string;
  status: EntitlementStatus;
  origin: EntitlementOrigin;
  startsAt: Date;
  expiresAt: Date | null;
}

export interface AuthenticatedUser extends UserProfile {
  entitlement: Entitlement | null;
}
