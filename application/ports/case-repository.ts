import type { CaseType, TrevasCase } from "@/domain/archive/cases";
import type { ContentStatus } from "@/domain/content/entities";

export interface CaseInput {
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
}

export interface CaseRepository {
  listCases(): Promise<TrevasCase[]>;
  listPublishedCases(): Promise<TrevasCase[]>;
  getPublishedCase(caseId: string): Promise<TrevasCase | null>;
  createCase(input: CaseInput, actorId: string): Promise<string>;
  updateCase(caseId: string, input: CaseInput, actorId: string): Promise<void>;
}
