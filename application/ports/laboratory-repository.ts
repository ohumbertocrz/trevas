import type { Laboratory, LaboratoryAttempt } from "@/domain/laboratory/entities";

export interface LaboratoryInput {
  title: string;
  slug: string;
  description: string;
  caseText: string;
  source: string;
  officialAnalysis: string;
  tags: string[];
  questions: string[];
  lessonIds: string[];
  status: "draft" | "published" | "unpublished" | "scheduled";
}

export interface LaboratoryRepository {
  listLaboratories(): Promise<Laboratory[]>;
  listPublishedLaboratories(): Promise<Laboratory[]>;
  getPublishedLaboratory(slug: string): Promise<Laboratory | null>;
  createLaboratory(input: LaboratoryInput, actorId: string): Promise<string>;
  updateLaboratory(laboratoryId: string, input: LaboratoryInput, actorId: string): Promise<void>;
  getAttempt(userId: string, laboratoryId: string): Promise<LaboratoryAttempt | null>;
  submitAttempt(input: { userId: string; laboratoryId: string; answers: Record<string, string> }): Promise<void>;
}
