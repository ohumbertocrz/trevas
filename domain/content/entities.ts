export const CONTENT_STATUSES = ["draft", "published", "unpublished", "scheduled"] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface CourseContent {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: ContentStatus;
  order: number;
  moduleCount: number;
  lessonCount: number;
  publishedAt: Date | null;
  updatedAt: Date | null;
}

export interface CourseModuleContent {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status: ContentStatus;
  order: number;
  lessonCount: number;
  updatedAt: Date | null;
}

export interface LessonContent {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  subtitle: string;
  slug: string;
  description: string;
  status: ContentStatus;
  order: number;
  thumbnailPath: string;
  vimeoEmbedUrl: string;
  durationMinutes: number;
  tags: string[];
  transcript: string;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  updatedAt: Date | null;
}

export function isVimeoEmbedUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "player.vimeo.com" && /^\/video\/\d+/.test(url.pathname);
  } catch {
    return false;
  }
}

export function slugifyContent(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
