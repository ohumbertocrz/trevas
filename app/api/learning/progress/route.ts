import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { progressRepository } from "@/infrastructure/repositories/firebase-progress-repository";

const progressSchema = z.object({
  lessonId: z.string().min(1),
  lastPositionSeconds: z.number().finite().nonnegative(),
  durationSeconds: z.number().finite().nonnegative(),
  percent: z.number().finite().min(0).max(100),
  completed: z.boolean(),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement)) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  const parsed = progressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Progresso inválido." }, { status: 400 });

  const lesson = await contentRepository.getLesson(parsed.data.lessonId);
  if (!lesson || lesson.status !== "published") return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });

  await progressRepository.saveLessonProgress({ userId: user.id, ...parsed.data });
  return NextResponse.json({ ok: true });
}
