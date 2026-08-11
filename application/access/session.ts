import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthenticatedUser } from "@/domain/access/entities";
import { hasActiveEntitlement, hasAdministrativeAccess, TREVAS_PRODUCT_ID } from "@/application/access/permissions";
import { adminAuth } from "@/infrastructure/firebase/admin";
import { accessRepository } from "@/infrastructure/repositories/firebase-access-repository";

export const SESSION_COOKIE_NAME = "trevas_session";
export const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000;

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
    const profile = await accessRepository.getProfile(decoded.uid);
    if (!profile || profile.status !== "active") return null;
    const entitlement = await accessRepository.getProductEntitlement(decoded.uid, TREVAS_PRODUCT_ID);
    return { ...profile, entitlement };
  } catch {
    return null;
  }
}

export async function requireMember(returnTo = "/app") {
  const user = await getAuthenticatedUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement)) redirect("/sem-acesso");
  return user;
}

export async function requireAdministrativeUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login?returnTo=%2Fadmin");
  if (!hasAdministrativeAccess(user.roles)) redirect("/app");
  return user;
}
