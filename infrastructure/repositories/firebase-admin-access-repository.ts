import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AdminAccessRepository } from "@/application/ports/admin-access-repository";
import type { EntitlementOrigin, UserProfile, UserRole, UserStatus } from "@/domain/access/entities";
import { adminFirestore } from "@/infrastructure/firebase/admin";

function toProfile(id: string, data: FirebaseFirestore.DocumentData): UserProfile {
  return {
    id,
    displayName: typeof data.displayName === "string" ? data.displayName : "Aluno Trevas",
    email: typeof data.email === "string" ? data.email : "",
    roles: Array.isArray(data.roles) ? data.roles as UserRole[] : ["student"],
    status: (data.status ?? "active") as UserStatus,
  };
}

export class FirebaseAdminAccessRepository implements AdminAccessRepository {
  async listUsers(limit = 50) {
    const snapshot = await adminFirestore().collection("users").orderBy("email").limit(limit).get();
    return snapshot.docs.map((document) => toProfile(document.id, document.data()));
  }

  async grantEntitlement(input: { actorId: string; userId: string; productId: string; origin: EntitlementOrigin; expiresAt: Date | null; reason: string }) {
    const db = adminFirestore();
    const entitlementId = `${input.userId}_${input.productId}`;
    const batch = db.batch();
    batch.set(db.collection("entitlements").doc(entitlementId), {
      userId: input.userId,
      productId: input.productId,
      status: "active",
      origin: input.origin,
      startsAt: FieldValue.serverTimestamp(),
      expiresAt: input.expiresAt ? Timestamp.fromDate(input.expiresAt) : null,
      reason: input.reason,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: input.actorId,
    }, { merge: true });
    batch.set(db.collection("auditLogs").doc(), {
      actorId: input.actorId,
      action: "entitlement.granted",
      entity: "entitlement",
      entityId: entitlementId,
      reason: input.reason,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
  }

  async revokeEntitlement(input: { actorId: string; userId: string; productId: string; reason: string }) {
    const db = adminFirestore();
    const entitlementId = `${input.userId}_${input.productId}`;
    const batch = db.batch();
    batch.set(db.collection("entitlements").doc(entitlementId), {
      userId: input.userId,
      productId: input.productId,
      status: "revoked",
      reason: input.reason,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: input.actorId,
    }, { merge: true });
    batch.set(db.collection("auditLogs").doc(), {
      actorId: input.actorId,
      action: "entitlement.revoked",
      entity: "entitlement",
      entityId: entitlementId,
      reason: input.reason,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
  }

  async updateRoles(input: { actorId: string; userId: string; roles: UserRole[] }) {
    const db = adminFirestore();
    const batch = db.batch();
    batch.update(db.collection("users").doc(input.userId), { roles: input.roles, updatedAt: FieldValue.serverTimestamp() });
    batch.set(db.collection("auditLogs").doc(), {
      actorId: input.actorId,
      action: "user.roles_updated",
      entity: "user",
      entityId: input.userId,
      roles: input.roles,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
  }
}

export const adminAccessRepository = new FirebaseAdminAccessRepository();
