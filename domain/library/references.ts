import type { ContentStatus } from "@/domain/content/entities";

export const REFERENCE_TYPES = ["livro", "artigo", "filme", "documentário", "discurso", "bibliografia"] as const;
export type ReferenceType = (typeof REFERENCE_TYPES)[number];

export interface LibraryReference {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  type: ReferenceType;
  tags: string[];
  referenceUrl: string;
  lessonIds: string[];
  caseIds: string[];
  status: ContentStatus;
  updatedAt: Date | null;
}
