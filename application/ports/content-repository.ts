import type { ContentStatus, CourseContent, CourseModuleContent, LessonContent, TranscriptStatus } from "@/domain/content/entities";

export interface CourseInput {
  title: string;
  slug: string;
  description: string;
  status: ContentStatus;
}

export interface ModuleInput {
  courseId: string;
  title: string;
  description: string;
  isFree: boolean;
  status: ContentStatus;
}

export interface LessonInput {
  courseId: string;
  moduleId: string;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  status: ContentStatus;
  thumbnailPath: string;
  vimeoEmbedUrl: string;
  durationMinutes: number;
  tags: string[];
  transcript: string;
  transcriptDraft?: string;
  transcriptStatus?: TranscriptStatus;
  transcriptMediaPath?: string;
  transcriptApprovedAt?: Date | null;
  transcriptApprovedBy?: string;
  scheduledAt: Date | null;
}

export interface ContentRepository {
  listCourses(): Promise<CourseContent[]>;
  getCourse(courseId: string): Promise<CourseContent | null>;
  createCourse(input: CourseInput, actorId: string): Promise<string>;
  updateCourse(courseId: string, input: CourseInput, actorId: string): Promise<void>;
  listModules(courseId: string): Promise<CourseModuleContent[]>;
  createModule(input: ModuleInput, actorId: string): Promise<string>;
  updateModule(moduleId: string, input: ModuleInput, actorId: string): Promise<void>;
  moveModule(courseId: string, moduleId: string, direction: "up" | "down", actorId: string): Promise<void>;
  listLessons(moduleId: string): Promise<LessonContent[]>;
  getLesson(lessonId: string): Promise<LessonContent | null>;
  createLesson(input: LessonInput, actorId: string): Promise<string>;
  updateLesson(lessonId: string, input: LessonInput, actorId: string): Promise<void>;
  moveLesson(moduleId: string, lessonId: string, direction: "up" | "down", actorId: string): Promise<void>;
}
