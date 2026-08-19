import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AccessRepository } from "@/application/ports/access-repository";
import type { Entitlement, EntitlementOrigin, EntitlementStatus, UserProfile, UserRole, UserStatus } from "@/domain/access/entities";
import { USER_ROLES } from "@/domain/access/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function parseRoles(value: unknown): UserRole[] {
  if (!Array.isArray(value)) return ["student"];
  const roles = value.filter((role): role is UserRole => USER_ROLES.includes(role as UserRole));
  return roles.length ? roles : ["student"];
}

function bootstrapAdminEmails() {
  return new Set(
    (process.env.TREVAS_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function rolesForProfile(email: string, existingRoles: UserRole[] = ["student"]): UserRole[] {
  if (!bootstrapAdminEmails().has(email.trim().toLowerCase())) return existingRoles;
  return existingRoles.includes("admin") ? existingRoles : [...existingRoles, "admin"];
}

function profileFromData(id: string, data: FirebaseFirestore.DocumentData): UserProfile {
  return {
    id,
    displayName: typeof data.displayName === "string" && data.displayName ? data.displayName : "Aluno Trevas",
    email: typeof data.email === "string" ? data.email : "",
    roles: parseRoles(data.roles),
    status: (["active", "blocked", "invited"] as const).includes(data.status as UserStatus) ? data.status : "active",
  };
}

function asDate(value: unknown, fallback: Date) {
  return value instanceof Timestamp ? value.toDate() : fallback;
}

export class FirebaseAccessRepository implements AccessRepository {
  async getProfile(userId: string) {
    const snapshot = await adminFirestore().collection("users").doc(userId).get();
    return snapshot.exists ? profileFromData(snapshot.id, snapshot.data() ?? {}) : null;
  }

  async ensureProfile(input: { id: string; email: string; displayName: string }): Promise<UserProfile> {
    const reference = adminFirestore().collection("users").doc(input.id);
    const snapshot = await reference.get();
    const roles = rolesForProfile(input.email, snapshot.exists ? parseRoles(snapshot.data()?.roles) : ["student"]);
    if (!snapshot.exists) {
      await reference.set({
        displayName: input.displayName,
        email: input.email,
        roles,
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { ...input, roles, status: "active" };
    }

    const nextStatus = snapshot.data()?.status === "invited" ? "active" : snapshot.data()?.status;
    await reference.set({ email: input.email, displayName: input.displayName, roles, ...(nextStatus ? { status: nextStatus } : {}), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return profileFromData(snapshot.id, { ...snapshot.data(), email: input.email, displayName: input.displayName, roles, ...(nextStatus ? { status: nextStatus } : {}) });
  }

  async getProductEntitlement(userId: string, productId: string) {
    const id = `${userId}_${productId}`;
    const snapshot = await adminFirestore().collection("entitlements").doc(id).get();
    if (!snapshot.exists) return null;
    const data = snapshot.data() ?? {};
    return {
      id,
      userId,
      productId,
      status: data.status as EntitlementStatus,
      origin: data.origin as EntitlementOrigin,
      startsAt: asDate(data.startsAt, new Date(0)),
      expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : null,
    } satisfies Entitlement;
  }
}

export const accessRepository = new FirebaseAccessRepository();
