import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";
import { contentRepository } from "@/infrastructure/repositories/firebase-content-repository";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { memberContentRepository } from "@/infrastructure/repositories/firebase-member-content-repository";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement))) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim().toLocaleLowerCase("pt-BR") ?? "";
  if (query.length < 2) return NextResponse.json({ lessons: [], cases: [], laboratories: [], references: [] });
  const [courses, cases, laboratories, references] = await Promise.all([memberContentRepository.listPublishedCourses(), caseRepository.listPublishedCases(), laboratoryRepository.listPublishedLaboratories(), referenceRepository.listPublishedReferences()]);
  const match = (...values: string[]) => values.some((value) => value.toLocaleLowerCase("pt-BR").includes(query));
  const lessonCandidates = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, course: course.title, module: module.title }))));
  const enrichedLessons = (await Promise.all(lessonCandidates.map(async (item) => { const lesson = await contentRepository.getLesson(item.id); return { ...item, transcript: lesson?.transcript ?? "" }; }))).filter((item) => match(item.title, item.course, item.module, item.transcript)).slice(0, 8).map((item) => ({ ...item, transcript: item.transcript.slice(0, 12000) }));
  return NextResponse.json({ lessons: enrichedLessons, cases: cases.filter((item) => match(item.title, item.description, ...item.tags, ...item.techniques)).slice(0, 6).map((item) => ({ title: item.title, analysis: item.analysis.slice(0, 5000), body: item.body.slice(0, 5000) })), laboratories: laboratories.filter((item) => match(item.title, item.description, ...item.tags)).slice(0, 4).map((item) => ({ title: item.title, analysis: item.officialAnalysis.slice(0, 3000) })), references: references.filter((item) => match(item.title, item.author, item.description, ...item.tags)).slice(0, 6).map((item) => ({ title: item.title, author: item.author, description: item.description })) });
}
