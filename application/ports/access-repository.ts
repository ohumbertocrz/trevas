import type { Entitlement, UserProfile } from "@/domain/access/entities";

export interface AccessRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  ensureProfile(input: { id: string; email: string; displayName: string }): Promise<UserProfile>;
  getProductEntitlement(userId: string, productId: string): Promise<Entitlement | null>;
}
