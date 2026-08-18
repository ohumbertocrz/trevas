import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { contentAttachmentRepository } from "@/infrastructure/repositories/firebase-content-attachment-repository";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { adminStorage } from "@/infrastructure/firebase/admin";

export const dynamic = "force-dynamic";

async function ownerIsPublished(ownerType: string, ownerId: string) {
  if (ownerType === "course") return (await contentRepository.getCourse(ownerId))?.status === "published";
  if (ownerType === "module") {
    const courses = await contentRepository.listCourses();
    const modules = (await Promise.all(courses.map((course) => contentRepository.listModules(course.id)))).flat();
    const module = modules.find((item) => item.id === ownerId);
    return Boolean(module?.status === "published" && courses.find((course) => course.id === module.courseId)?.status === "published");
  }
  if (ownerType === "lesson") {
    const lesson = await contentRepository.getLesson(ownerId);
    if (!lesson || lesson.status !== "published") return false;
    const [course, modules] = await Promise.all([contentRepository.getCourse(lesson.courseId), contentRepository.listModules(lesson.courseId)]);
    return course?.status === "published" && modules.find((module) => module.id === lesson.moduleId)?.status === "published";
  }
  if (ownerType === "case") return Boolean(await caseRepository.getPublishedCase(ownerId));
  if (ownerType === "reference") return Boolean(await referenceRepository.getPublishedReference(ownerId));
  if (ownerType === "laboratory") return Boolean(await laboratoryRepository.listPublishedLaboratories().then((items) => items.find((item) => item.id === ownerId)));
  return false;
}

export async function GET(_request: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user || (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement))) return NextResponse.json({ error: "NÃ£o autorizado." }, { status: 401 });
  const attachment = await contentAttachmentRepository.get((await params).attachmentId);
  if (!attachment || !attachment.storagePath.startsWith("protected/content-attachments/")) return NextResponse.json({ error: "Arquivo nÃ£o encontrado." }, { status: 404 });
  if (!hasAdministrativeAccess(user.roles) && !(await ownerIsPublished(attachment.ownerType, attachment.ownerId))) return NextResponse.json({ error: "Arquivo nÃ£o disponÃ­vel." }, { status: 404 });
  const [bytes, metadata] = await Promise.all([adminStorage().bucket().file(attachment.storagePath).download(), adminStorage().bucket().file(attachment.storagePath).getMetadata()]);
  return new NextResponse(bytes[0] as BodyInit, { headers: { "Content-Type": metadata[0].contentType ?? attachment.contentType, "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.name)}"`, "Cache-Control": "private, no-store" } });
}
