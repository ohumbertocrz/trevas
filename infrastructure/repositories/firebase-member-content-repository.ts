import type { MemberContentRepository, MemberCourse, MemberLessonSummary } from "@/application/ports/member-content-repository";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";

function lessonSummary(lesson: Awaited<ReturnType<typeof contentRepository.listLessons>>[number]): MemberLessonSummary {
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    subtitle: lesson.subtitle,
    durationMinutes: lesson.durationMinutes,
    thumbnailPath: lesson.thumbnailPath,
  };
}

export class FirebaseMemberContentRepository implements MemberContentRepository {
  async listPublishedCourses() {
    const courses = (await contentRepository.listCourses()).filter((course) => course.status === "published");
    return Promise.all(courses.map(async (course) => {
      const modules = (await contentRepository.listModules(course.id)).filter((module) => module.status === "published");
      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        modules: await Promise.all(modules.map(async (module) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order,
          lessons: (await contentRepository.listLessons(module.id))
            .filter((lesson) => lesson.status === "published")
            .map(lessonSummary),
        }))),
      } satisfies MemberCourse;
    }));
  }

  async getPublishedLessonBySlug(slug: string) {
    const courses = await this.listPublishedCourses();
    for (const course of courses) {
      const orderedLessons = course.modules.flatMap((module) => module.lessons.map((lesson) => ({ lesson, module })));
      const index = orderedLessons.findIndex(({ lesson }) => lesson.slug === slug);
      if (index < 0) continue;
      const found = orderedLessons[index];
      const lesson = await contentRepository.getLesson(found.lesson.id);
      if (!lesson || lesson.status !== "published") return null;
      return {
        course: { id: course.id, slug: course.slug, title: course.title },
        module: { id: found.module.id, title: found.module.title, order: found.module.order },
        lesson,
        materials: (await libraryRepository.listMaterialsForLesson(lesson.id)).filter((material) => material.visibility === "published"),
        previous: index > 0 ? orderedLessons[index - 1].lesson : null,
        next: index < orderedLessons.length - 1 ? orderedLessons[index + 1].lesson : null,
      };
    }
    return null;
  }
}

export const memberContentRepository = new FirebaseMemberContentRepository();
