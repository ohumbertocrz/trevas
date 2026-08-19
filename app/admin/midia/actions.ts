"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCanManageContent } from "@/application/content/permissions";
import { requireAdministrativeUser } from "@/application/access/session";
import { deleteContentAttachment } from "@/application/services/content-attachments";

const mediaSchema = z.object({ attachmentId: z.string().min(1) });

export async function deleteMedia(formData: FormData) {
  const user = await requireAdministrativeUser();
  assertCanManageContent(user);
  const { attachmentId } = mediaSchema.parse(Object.fromEntries(formData));
  await deleteContentAttachment(attachmentId, user.id);
  revalidatePath("/admin/midia");
}
