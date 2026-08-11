import type { LearningRepository } from "@/application/ports/learning-repository";
import type { CourseOverview, ContinueLesson } from "@/domain/course/entities";
import type { StudentDashboard } from "@/domain/dashboard/entities";

const continueLesson: ContinueLesson = {
  id: "aquilo-que-voce-ve",
  moduleLabel: "Aula 03 | Fundamentos",
  title: "Aquilo que você vê é aquilo que não vê",
  progress: 55,
  thumbnail: "/assets/hero.webp",
};

const dashboard: StudentDashboard = {
  studentName: "Humberto",
  nextStep: "A consciência em escolha: os próximos passos",
  continueLessonId: continueLesson.id,
  archiveItems: [
    { id: "revolucao-1930", title: "Revolução de 1930", description: "Contexto político e social", type: "Artigo", image: "/assets/dobra-01.webp" },
    { id: "getulio-vargas", title: "Getúlio Vargas", description: "Perfil e trajetória política", type: "Biografia", image: "/assets/dobra-02.webp" },
    { id: "clube-da-luz", title: "Clube da Luz", description: "Influências e conexões", type: "Dossiê", image: "/assets/dobra-03.webp" },
    { id: "poder-mentalidades", title: "Poder e mentalidades", description: "Padrões que se repetem", type: "Análise", image: "/assets/dobra-04.webp" },
  ],
  activities: [
    { id: "a1", kind: "lesson", title: "Aula assistida", detail: "Aquilo que você vê", occurredAt: "Há 2 horas" },
    { id: "a2", kind: "archive", title: "Artigo arquivado", detail: "Revolução de 1930", occurredAt: "Há 5 horas" },
    { id: "a3", kind: "favorite", title: "Aula marcada", detail: "O poder das narrativas", occurredAt: "Há 1 dia" },
    { id: "a4", kind: "download", title: "Conteúdo baixado", detail: "Mentalidades coletivas", occurredAt: "Há 2 dias" },
  ],
};

const course: CourseOverview = {
  id: "fundamentos",
  title: "Curso",
  description: "Percurso estruturado para a formação que enxerga além das convenções.",
  progress: 33,
  modules: [
    { id: "introducao", number: 1, title: "Introdução às Trevas", state: "completed", lessonCount: 3 },
    { id: "percepcoes", number: 2, title: "Percepções e realidades", state: "completed", lessonCount: 4 },
    { id: "enquadramento", number: 3, title: "Enquadramento", state: "current", lessonCount: 5 },
    { id: "linguagem", number: 4, title: "Linguagem", state: "locked", lessonCount: 4 },
    { id: "associacoes", number: 5, title: "Associações", state: "locked", lessonCount: 4 },
    { id: "emocao", number: 6, title: "Emoção", state: "locked", lessonCount: 3 },
    { id: "narrativas", number: 7, title: "Construção de narrativas", state: "locked", lessonCount: 4 },
    { id: "aplicada", number: 8, title: "Manipulação aplicada", state: "locked", lessonCount: 5 },
  ],
};

export class MockLearningRepository implements LearningRepository {
  async getDashboard(_userId: string) {
    return dashboard;
  }

  async getContinueLesson(_userId: string) {
    return continueLesson;
  }

  async getCourseOverview(_userId: string) {
    return course;
  }
}

export const learningRepository = new MockLearningRepository();
