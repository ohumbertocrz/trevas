import type { ArchiveItem, ArchiveItemType } from "@/domain/archive/entities";

export interface SaveArchiveItemInput {
  userId: string;
  type: ArchiveItemType;
  targetId: string;
  title: string;
  description: string;
  href: string;
}

export interface ArchiveRepository {
  listForUser(userId: string): Promise<ArchiveItem[]>;
  getForUser(userId: string, type: ArchiveItemType, targetId: string): Promise<ArchiveItem | null>;
  save(input: SaveArchiveItemInput): Promise<void>;
  remove(userId: string, type: ArchiveItemType, targetId: string): Promise<void>;
}
