import { NextResponse } from "next/server";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { getAuthenticatedUser } from "@/application/access/session";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";
import { mediaStorage } from "@/infrastructure/storage/firebase-media-storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ referenceId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { referenceId } = await params;
  const reference = await referenceRepository.getPublishedReference(referenceId);
  const isStaff = hasAdministrativeAccess(user.roles);
  if (!reference?.coverPath || (!isStaff && !hasActiveEntitlement(user.entitlement))) return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });
  const media = await mediaStorage.readReferenceCover(reference.coverPath);
  return new Response(new Uint8Array(media.bytes), { headers: { "content-type": media.contentType, "cache-control": "private, max-age=3600" } });
}
