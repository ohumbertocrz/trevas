"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";

export async function markNoticeRead(formData: FormData) {
  const user = await requireMember("/app/avisos");
  const deliveryId = String(formData.get("deliveryId") ?? "");
  if (deliveryId) await communicationRepository.markDeliveryOpened(deliveryId, user.id);
  revalidatePath("/app/avisos");
}

export async function deleteNotice(formData: FormData) {
  const user = await requireMember("/app/avisos");
  const deliveryId = String(formData.get("deliveryId") ?? "");
  if (deliveryId) await communicationRepository.deleteDelivery(deliveryId, user.id);
  revalidatePath("/app/avisos");
  revalidatePath("/app/perfil");
}
