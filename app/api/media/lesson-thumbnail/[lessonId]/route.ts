import { NextResponse } from "next/server";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { getAuthenticatedUser } from "@/application/access/session";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { mediaStorage } from "@/infrastructure/storage/firebase-media-storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { lessonId } = await params;
  const lesson = await contentRepository.getLesson(lessonId);
  const isStaff = hasAdministrativeAccess(user.roles);
  if (!lesson?.thumbnailPath || (!isStaff && (lesson.status !== "published" || !hasActiveEntitlement(user.entitlement)))) {
    return NextResponse.json({ error: "Mídia não encontrada." }, { status: 404 });
  }
  const media = await mediaStorage.readLessonThumbnail(lesson.thumbnailPath);
  return new Response(new Uint8Array(media.bytes), {
    headers: { "content-type": media.contentType, "cache-control": "private, max-age=3600" },
  });
}
