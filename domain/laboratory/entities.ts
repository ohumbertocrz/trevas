import type { ContentStatus } from "@/domain/content/entities";

export interface LaboratoryQuestion {
  id: string;
  prompt: string;
  order: number;
}

export interface Laboratory {
  id: string;
  title: string;
  slug: string;
  description: string;
  caseText: string;
  source: string;
  officialAnalysis: string;
  tags: string[];
  questions: LaboratoryQuestion[];
  lessonIds: string[];
  status: ContentStatus;
  updatedAt: Date | null;
}

export interface LaboratoryAttempt {
  id: string;
  laboratoryId: string;
  userId: string;
  answers: Record<string, string>;
  submittedAt: Date | null;
}
