import type { LibraryReference, ReferenceType } from "@/domain/library/references";
import type { ContentStatus } from "@/domain/content/entities";

export interface ReferenceInput {
  title: string;
  author: string;
  coverPath: string;
  description: string;
  type: ReferenceType;
  tags: string[];
  referenceUrl: string;
  vimeoEmbedUrl: string;
  lessonIds: string[];
  caseIds: string[];
  status: ContentStatus;
}

export interface ReferenceRepository {
  listReferences(): Promise<LibraryReference[]>;
  listPublishedReferences(): Promise<LibraryReference[]>;
  getPublishedReference(referenceId: string): Promise<LibraryReference | null>;
  createReference(input: ReferenceInput, actorId: string): Promise<string>;
  updateReference(referenceId: string, input: ReferenceInput, actorId: string): Promise<void>;
}
