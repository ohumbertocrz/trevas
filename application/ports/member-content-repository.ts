import type { LessonContent } from "@/domain/content/entities";
import type { Material } from "@/domain/library/entities";

export interface MemberLessonSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  thumbnailPath: string;
}

export interface MemberModule {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  order: number;
  lessons: MemberLessonSummary[];
}

export interface MemberCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  modules: MemberModule[];
}

export interface MemberLessonContext {
  course: Pick<MemberCourse, "id" | "slug" | "title">;
  module: Pick<MemberModule, "id" | "title" | "order" | "isFree">;
  lesson: LessonContent;
  materials: Material[];
  previous: MemberLessonSummary | null;
  next: MemberLessonSummary | null;
}

export interface MemberContentRepository {
  listPublishedCourses(): Promise<MemberCourse[]>;
  getPublishedLessonBySlug(slug: string): Promise<MemberLessonContext | null>;
}
