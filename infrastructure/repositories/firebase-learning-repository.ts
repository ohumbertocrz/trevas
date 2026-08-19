import type { LearningRepository } from "@/application/ports/learning-repository";
import type { ContinueLesson, CourseOverview } from "@/domain/course/entities";
import type { StudentDashboard } from "@/domain/dashboard/entities";
import { archiveRepository } from "@/infrastructure/repositories/firebase-archive-repository";
import { memberContentRepository } from "@/infrastructure/repositories/firebase-member-content-repository";
import { progressRepository } from "@/infrastructure/repositories/firebase-progress-repository";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { accessRepository } from "@/infrastructure/repositories/firebase-access-repository";

const archiveTypeLabel = { lesson: "Aula", material: "Material", case: "Caso", reference: "Livro" } as const;

export class FirebaseLearningRepository implements LearningRepository {
  async getDashboard(userId: string): Promise<StudentDashboard> {
    const courses = await memberContentRepository.listPublishedCourses();
    const allLessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ course, module, lesson }))));
    const profile = await accessRepository.getProfile(userId);
    const entitlement = await accessRepository.getProductEntitlement(userId, "trevas-completo");
    const lessons = profile && (hasAdministrativeAccess(profile.roles) || hasActiveEntitlement(entitlement)) ? allLessons : allLessons.filter(({ module }) => module.isFree);
    const progress = await progressRepository.getLessonsProgress(userId, lessons.map(({ lesson }) => lesson.id));
    const progressByLesson = new Map(progress.map((item) => [item.lessonId, item]));
    const continueItem = [...lessons].sort((left, right) => (progressByLesson.get(right.lesson.id)?.updatedAt?.getTime() ?? 0) - (progressByLesson.get(left.lesson.id)?.updatedAt?.getTime() ?? 0)).find(({ lesson }) => progressByLesson.has(lesson.id) && !progressByLesson.get(lesson.id)?.completed) ?? lessons.find(({ lesson }) => !progressByLesson.get(lesson.id)?.completed) ?? lessons[0];
    const archive = await archiveRepository.listForUser(userId);
    const activities = progress.filter((item) => item.updatedAt).sort((left, right) => (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0)).slice(0, 4).map((item) => ({ id: item.id, kind: "lesson" as const, title: "Aula assistida", detail: lessons.find(({ lesson }) => lesson.id === item.lessonId)?.lesson.title ?? "Aula", occurredAt: item.updatedAt?.toLocaleString("pt-BR") ?? "Agora" }));
    return { studentName: "", nextStep: continueItem ? `Continue com ${continueItem.lesson.title}` : "Comece pelo primeiro módulo do curso.", continueLessonId: continueItem?.lesson.slug ?? "", archiveItems: archive.slice(0, 4).map((item) => ({ id: item.id, title: item.title, description: item.description, type: archiveTypeLabel[item.type], image: "/assets/hero.webp" })), activities };
  }

  async getContinueLesson(userId: string): Promise<ContinueLesson> {
    const dashboard = await this.getDashboard(userId);
    const courses = await memberContentRepository.listPublishedCourses();
    const match = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)).find((lesson) => lesson.slug === dashboard.continueLessonId);
    const progress = match ? await progressRepository.getLessonProgress(userId, match.id) : null;
    return { id: dashboard.continueLessonId, moduleLabel: match ? "Conteúdo Trevas" : "Curso", title: match?.title ?? "Nenhuma aula disponível", progress: progress?.percent ?? 0, thumbnail: match?.thumbnailPath ? `/api/media/lesson-thumbnail/${match.id}` : "/assets/hero.webp" };
  }

  async getCourseOverview(userId: string): Promise<CourseOverview> {
    const courses = await memberContentRepository.listPublishedCourses();
    const course = courses[0];
    const lessons = course?.modules.flatMap((module) => module.lessons) ?? [];
    const progress = await progressRepository.getLessonsProgress(userId, lessons.map((lesson) => lesson.id));
    const completed = progress.filter((item) => item.completed).length;
    return { id: course?.id ?? "", title: course?.title ?? "Curso", description: course?.description ?? "", progress: lessons.length ? Math.round((completed / lessons.length) * 100) : 0, modules: (course?.modules ?? []).map((module, index) => ({ id: module.id, number: index + 1, title: module.title, state: "current", lessonCount: module.lessons.length })) };
  }
}

export const learningRepository = new FirebaseLearningRepository();
