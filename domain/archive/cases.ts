import type { ContentStatus } from "@/domain/content/entities";

export const CASE_TYPES = ["jornalismo", "publicidade", "política", "cinema", "redes sociais", "outro"] as const;
export type CaseType = (typeof CASE_TYPES)[number];

export interface TrevasCase {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  body: string;
  source: string;
  caseDate: string;
  type: CaseType;
  tags: string[];
  techniques: string[];
  analysis: string;
  lessonIds: string[];
  status: ContentStatus;
  updatedAt: Date | null;
}
