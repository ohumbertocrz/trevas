export type ModuleState = "completed" | "current" | "locked";

export interface CourseModule {
  id: string;
  number: number;
  title: string;
  state: ModuleState;
  lessonCount: number;
}

export interface ContinueLesson {
  id: string;
  moduleLabel: string;
  title: string;
  progress: number;
  thumbnail: string;
}

export interface CourseOverview {
  id: string;
  title: string;
  description: string;
  progress: number;
  modules: CourseModule[];
}
