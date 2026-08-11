export interface ArchiveItem {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  kind: "lesson" | "archive" | "favorite" | "download";
}

export interface StudentDashboard {
  studentName: string;
  nextStep: string;
  continueLessonId: string;
  archiveItems: ArchiveItem[];
  activities: ActivityItem[];
}
