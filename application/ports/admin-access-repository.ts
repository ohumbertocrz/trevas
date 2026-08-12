import type { EntitlementOrigin, UserProfile, UserRole } from "@/domain/access/entities";
import type { CommunicationAudience } from "@/domain/communication/entities";

export interface AdminAccessRepository {
  listUsers(limit?: number): Promise<UserProfile[]>;
  listActiveUsers(): Promise<UserProfile[]>;
  listCommunicationRecipients(audience: CommunicationAudience): Promise<UserProfile[]>;
  grantEntitlement(input: { actorId: string; userId: string; productId: string; origin: EntitlementOrigin; expiresAt: Date | null; reason: string }): Promise<void>;
  revokeEntitlement(input: { actorId: string; userId: string; productId: string; reason: string }): Promise<void>;
  updateRoles(input: { actorId: string; userId: string; roles: UserRole[] }): Promise<void>;
}
