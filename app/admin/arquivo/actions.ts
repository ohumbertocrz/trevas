"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdministrativeUser } from "@/application/access/session";
import { assertCanManageContent } from "@/application/content/permissions";
import { CASE_TYPES } from "@/domain/archive/cases";
import { CONTENT_STATUSES } from "@/domain/content/entities";
import { caseRepository } from "@/infrastructure/repositories/firebase-case-repository";

const schema = z.object({ caseId: z.string().optional(), title: z.string().trim().min(3).max(160), description: z.string().trim().max(3000).default(""), thumbnailUrl: z.string().trim().url().max(2000).or(z.literal("")), body: z.string().trim().min(10).max(50000), source: z.string().trim().max(1000).default(""), caseDate: z.string().trim().max(40).default(""), type: z.enum(CASE_TYPES).default("outro"), tags: z.string().max(1500).default(""), techniques: z.string().max(1500).default(""), analysis: z.string().trim().min(10).max(50000), lessonIds: z.array(z.string()).max(100).default([]), status: z.enum(CONTENT_STATUSES).default("draft") });

async function actor() { const user = await requireAdministrativeUser(); assertCanManageContent(user); return user; }
function parse(formData: FormData) { return schema.parse({ ...Object.fromEntries(formData), lessonIds: formData.getAll("lessonIds").filter((value): value is string => typeof value === "string") }); }
function inputFrom(value: z.infer<typeof schema>) { return { title: value.title, description: value.description, thumbnailUrl: value.thumbnailUrl, body: value.body, source: value.source, caseDate: value.caseDate, type: value.type, tags: value.tags.split(",").map((tag) => tag.trim()).filter(Boolean), techniques: value.techniques.split(",").map((technique) => technique.trim()).filter(Boolean), analysis: value.analysis, lessonIds: value.lessonIds, status: value.status }; }

export async function createCase(formData: FormData) { const user = await actor(); const value = parse(formData); const id = await caseRepository.createCase(inputFrom({ ...value, status: "draft" }), user.id); revalidatePath("/app/arquivo"); return id; }
export async function updateCase(formData: FormData) { const user = await actor(); const value = parse(formData); if (!value.caseId) throw new Error("Caso não informado."); await caseRepository.updateCase(value.caseId, inputFrom(value), user.id); revalidatePath("/admin/arquivo"); revalidatePath("/app/arquivo"); revalidatePath(`/app/arquivo/${value.caseId}`); }
