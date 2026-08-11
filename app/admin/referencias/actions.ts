"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdministrativeUser } from "@/application/access/session";
import { assertCanManageContent } from "@/application/content/permissions";
import { REFERENCE_TYPES } from "@/domain/library/references";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { referenceRepository } from "@/infrastructure/repositories/firebase-reference-repository";

const schema = z.object({ referenceId: z.string().optional(), title: z.string().trim().min(2).max(200), author: z.string().trim().max(180).default(""), coverUrl: z.string().trim().url().max(2000).or(z.literal("")), description: z.string().trim().max(4000).default(""), type: z.enum(REFERENCE_TYPES).default("livro"), tags: z.string().max(1200).default(""), referenceUrl: z.string().trim().url().max(2000).or(z.literal("")), lessonIds: z.array(z.string()).max(100).default([]), caseIds: z.array(z.string()).max(100).default([]), status: z.enum(CONTENT_STATUSES).default("draft") });
async function actor() { const user = await requireAdministrativeUser(); assertCanManageContent(user); return user; }
function parse(formData: FormData) { return schema.parse({ ...Object.fromEntries(formData), lessonIds: formData.getAll("lessonIds").filter((value): value is string => typeof value === "string"), caseIds: formData.getAll("caseIds").filter((value): value is string => typeof value === "string") }); }
function inputFrom(value: z.infer<typeof schema>) { return { title: value.title, author: value.author, coverUrl: value.coverUrl, description: value.description, type: value.type, tags: value.tags.split(",").map((tag) => tag.trim()).filter(Boolean), referenceUrl: value.referenceUrl, lessonIds: value.lessonIds, caseIds: value.caseIds, status: value.status }; }
export async function createReference(formData: FormData) { const user = await actor(); const value = parse(formData); const id = await referenceRepository.createReference(inputFrom({ ...value, status: "draft" }), user.id); redirect(`/admin/referencias?edit=${id}`); }
export async function updateReference(formData: FormData) { const user = await actor(); const value = parse(formData); if (!value.referenceId) throw new Error("Referência não informada."); await referenceRepository.updateReference(value.referenceId, inputFrom(value), user.id); revalidatePath("/admin/referencias"); revalidatePath("/app/biblioteca"); revalidatePath(`/app/biblioteca/${value.referenceId}`); }
