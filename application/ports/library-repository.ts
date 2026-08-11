import type { Material, MaterialType, MaterialVisibility } from "@/domain/library/entities";

export interface MaterialInput {
  title: string;
  type: MaterialType;
  description: string;
  sourceUrl: string;
  storagePath: string;
  visibility: MaterialVisibility;
}

export interface LibraryRepository {
  listMaterials(): Promise<Material[]>;
  listMaterialsForLesson(lessonId: string): Promise<Material[]>;
  createMaterial(input: MaterialInput, actorId: string): Promise<string>;
  updateMaterial(materialId: string, input: MaterialInput, actorId: string): Promise<void>;
  setLessonMaterials(lessonId: string, materialIds: string[], actorId: string): Promise<void>;
}
