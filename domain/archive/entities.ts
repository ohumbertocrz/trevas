export const ARCHIVE_ITEM_TYPES = ["lesson", "material", "case", "reference"] as const;
export type ArchiveItemType = (typeof ARCHIVE_ITEM_TYPES)[number];

export interface ArchiveItem {
  id: string;
  userId: string;
  type: ArchiveItemType;
  targetId: string;
  title: string;
  description: string;
  href: string;
  createdAt: Date | null;
}
