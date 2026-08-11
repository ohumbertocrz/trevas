import type { SearchResult } from "@/domain/search/entities";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";
import { memberContentRepository } from "@/infrastructure/repositories/firebase-member-content-repository";

function matches(query: string, ...values: string[]) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  return values.some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
}

export async function searchMemberContent(query: string): Promise<SearchResult[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];
  const [courses, materials, laboratories, cases] = await Promise.all([memberContentRepository.listPublishedCourses(), libraryRepository.listMaterials(), laboratoryRepository.listPublishedLaboratories(), caseRepository.listPublishedCases()]);
  const lessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ lesson, course, module }))));
  return [
    ...lessons.filter(({ lesson }) => matches(normalizedQuery, lesson.title, lesson.subtitle)).map(({ lesson, course, module }) => ({ id: `lesson-${lesson.id}`, type: "lesson" as const, title: lesson.title, description: `${course.title} · ${module.title}`, href: `/app/aula/${lesson.slug}` })),
    ...materials.filter((material) => material.visibility === "published" && matches(normalizedQuery, material.title, material.description)).map((material) => ({ id: `material-${material.id}`, type: "material" as const, title: material.title, description: material.description || "Material da Biblioteca", href: material.sourceUrl })),
    ...laboratories.filter((laboratory) => matches(normalizedQuery, laboratory.title, laboratory.description, ...laboratory.tags)).map((laboratory) => ({ id: `laboratory-${laboratory.id}`, type: "laboratory" as const, title: laboratory.title, description: laboratory.description || "Laboratorio Trevas", href: `/app/laboratorio/${laboratory.slug}` })),
    ...cases.filter((item) => matches(normalizedQuery, item.title, item.description, item.body, item.source, ...item.tags, ...item.techniques)).map((item) => ({ id: `case-${item.id}`, type: "case" as const, title: item.title, description: item.description || "Caso do Arquivo Trevas", href: `/app/arquivo/${item.id}` })),
  ];
}
