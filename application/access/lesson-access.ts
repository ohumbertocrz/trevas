import type { AuthenticatedUser } from "@/domain/access/entities";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";

export async function canAccessLesson(user: AuthenticatedUser, lessonId: string) {
  if (hasAdministrativeAccess(user.roles) || hasActiveEntitlement(user.entitlement)) return true;
  const lesson = await contentRepository.getLesson(lessonId);
  if (!lesson) return false;
  return canAccessModule(user, lesson.moduleId, lesson.courseId);
}

export async function canAccessModule(user: AuthenticatedUser, moduleId: string, courseId?: string) {
  if (hasAdministrativeAccess(user.roles) || hasActiveEntitlement(user.entitlement)) return true;
  if (courseId) return (await contentRepository.listModules(courseId)).find((item) => item.id === moduleId)?.isFree === true;
  const courses = await contentRepository.listCourses();
  for (const course of courses) {
    const module = (await contentRepository.listModules(course.id)).find((item) => item.id === moduleId);
    if (module) return module.isFree;
  }
  return false;
}
