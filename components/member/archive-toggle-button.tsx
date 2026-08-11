"use client";

import { toggleLessonArchive } from "@/app/app/arquivo/actions";
import { ArchiveContentToggle } from "@/components/member/archive-content-toggle";

export function ArchiveToggleButton({ lessonId, initialSaved }: { lessonId: string; initialSaved: boolean }) {
  return <ArchiveContentToggle initialSaved={initialSaved} label="a aula" action={() => toggleLessonArchive(lessonId)} />;
}
