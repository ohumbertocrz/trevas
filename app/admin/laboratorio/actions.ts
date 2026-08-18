"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertCanManageContent } from "@/application/content/permissions";
import { requireAdministrativeUser } from "@/application/access/session";
import { CONTENT_STATUSES, slugifyContent } from "@/domain/content/entities";
import { laboratoryRepository } from "@/infrastructure/repositories/firebase-laboratory-repository";
import { saveContentAttachments } from "@/application/services/content-attachments";

const laboratorySchema = z.object({
  laboratoryId: z.string().min(1).optional(),
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().max(180).optional(),
  description: z.string().trim().max(3000).optional().default(""),
  caseText: z.string().trim().min(10).max(30000),
  source: z.string().trim().max(1000).optional().default(""),
  officialAnalysis: z.string().trim().min(10).max(30000),
  tags: z.string().trim().max(1000).optional().default(""),
  questions: z.string().trim().min(10).max(10000),
  lessonIds: z.array(z.string()).max(100).default([]),
  status: z.enum(CONTENT_STATUSES).default("draft"),
});

async function actor() {
  const user = await requireAdministrativeUser();
  assertCanManageContent(user);
  return user;
}

function inputFromForm(input: z.infer<typeof laboratorySchema>) {
  return {
    title: input.title,
    slug: slugifyContent(input.slug || input.title),
    description: input.description,
    caseText: input.caseText,
    source: input.source,
    officialAnalysis: input.officialAnalysis,
    tags: input.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    questions: input.questions.split(/\r?\n/).map((question) => question.trim()).filter(Boolean),
    lessonIds: input.lessonIds,
    status: input.status,
  };
}

function parseForm(formData: FormData) {
  return laboratorySchema.parse({
    ...Object.fromEntries(formData),
    lessonIds: formData.getAll("lessonIds").filter((value): value is string => typeof value === "string"),
  });
}

export async function createLaboratory(formData: FormData) {
  const user = await actor();
  const input = parseForm(formData);
  const id = await laboratoryRepository.createLaboratory(inputFromForm({ ...input, status: "draft" }), user.id);
  await saveContentAttachments(formData, "laboratory", id, user.id);
  redirect(`/admin/laboratorio?edit=${id}`);
}

export async function updateLaboratory(formData: FormData) {
  const user = await actor();
  const input = parseForm(formData);
  if (!input.laboratoryId) throw new Error("Laboratório não informado.");
  await laboratoryRepository.updateLaboratory(input.laboratoryId, inputFromForm(input), user.id);
  await saveContentAttachments(formData, "laboratory", input.laboratoryId, user.id);
  revalidatePath("/admin/laboratorio");
  revalidatePath("/app/laboratorio");
  revalidatePath(`/app/laboratorio/${input.slug}`);
}
