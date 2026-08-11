import type { ContinueLesson, CourseOverview } from "@/domain/course/entities";
import type { StudentDashboard } from "@/domain/dashboard/entities";

export interface LearningRepository {
  getDashboard(userId: string): Promise<StudentDashboard>;
  getContinueLesson(userId: string): Promise<ContinueLesson>;
  getCourseOverview(userId: string): Promise<CourseOverview>;
}
