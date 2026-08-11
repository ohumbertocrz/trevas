export const MATERIAL_TYPES = ["link", "pdf", "document", "image", "file"] as const;
export const MATERIAL_VISIBILITIES = ["draft", "published"] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];
export type MaterialVisibility = (typeof MATERIAL_VISIBILITIES)[number];

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  description: string;
  sourceUrl: string;
  storagePath: string;
  visibility: MaterialVisibility;
  createdAt: Date | null;
  updatedAt: Date | null;
}
