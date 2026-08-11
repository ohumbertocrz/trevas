"use server";

import { redirect } from "next/navigation";
import { requireMember } from "@/application/access/session";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";

export async function submitLaboratory(formData: FormData) {
  const user = await requireMember();
  const laboratoryId = String(formData.get("laboratoryId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const laboratory = await laboratoryRepository.getPublishedLaboratory(slug);
  if (!laboratory || laboratory.id !== laboratoryId) throw new Error("Laboratório não encontrado.");
  const answers = Object.fromEntries(laboratory.questions.map((question) => [question.id, String(formData.get(`answer-${question.id}`) ?? "").trim()]));
  await laboratoryRepository.submitAttempt({ userId: user.id, laboratoryId, answers });
  redirect(`/app/laboratorio/${laboratory.slug}?reveal=1`);
}
