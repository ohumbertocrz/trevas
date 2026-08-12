"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdministrativeUser } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";
import { brevoEmailProvider } from "@/infrastructure/providers/brevo-email-provider";
import { dispatchCommunication } from "@/application/services/communication-service";

const schema = z.object({ title: z.string().trim().min(3).max(160), content: z.string().trim().min(3).max(30000), channel: z.enum(["internal", "email", "both"]), audience: z.enum(["active_students", "all_active", "not_started", "inactive_30_days"]), scheduledAt: z.string().optional().default(""), action: z.enum(["draft", "send"]) });

export async function saveCommunication(formData: FormData) {
  const actor = await requireAdministrativeUser();
  const input = schema.parse(Object.fromEntries(formData));
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const communication = await communicationRepository.create({ title: input.title, content: input.content, channel: input.channel, audience: input.audience, scheduledAt: input.action === "send" ? scheduledAt : null, createdBy: actor.id });
  if (input.action === "send" && !scheduledAt) {
    const recipients = await adminAccessRepository.listCommunicationRecipients(input.audience);
    try {
      await communicationRepository.updateStatus(communication.id, "sending", { recipientCount: recipients.length });
      await dispatchCommunication({ communicationId: communication.id, title: input.title, content: input.content, channel: input.channel, audienceUserIds: recipients.map((user) => user.id), recipients: recipients.map((user) => ({ id: user.id, email: user.email, name: user.displayName })), scheduledAt, repository: communicationRepository, emailProvider: input.channel === "internal" ? null : brevoEmailProvider });
      await communicationRepository.updateStatus(communication.id, scheduledAt ? "scheduled" : "sent", { sentAt: scheduledAt ? null : new Date(), recipientCount: recipients.length });
    } catch (error) { await communicationRepository.updateStatus(communication.id, "failed", { failureReason: error instanceof Error ? error.message : "Falha no envio." }); throw error; }
  }
  revalidatePath("/admin/comunicacao");
}
