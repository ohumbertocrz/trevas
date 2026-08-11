import { Bookmark, Download, FileText, Play } from "lucide-react";
import type { ActivityItem } from "@/domain/dashboard/entities";

const icons = {
  lesson: Play,
  archive: FileText,
  favorite: Bookmark,
  download: Download,
};

export function ActivityIcon({ kind }: { kind: ActivityItem["kind"] }) {
  const Icon = icons[kind];
  return <Icon aria-hidden="true" />;
}
