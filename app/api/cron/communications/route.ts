import { NextResponse } from "next/server";
import { adminAccessRepository } from "@/infrastructure/repositories/firebase-admin-access-repository";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";
import { brevoEmailProvider } from "@/infrastructure/providers/brevo-email-provider";
import { dispatchCommunication } from "@/application/services/communication-service";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.COMMUNICATION_CRON_SECRET || authorization !== `Bearer ${process.env.COMMUNICATION_CRON_SECRET}`) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const due = await communicationRepository.listDue(new Date());
  for (const item of due) {
    const recipients = await adminAccessRepository.listCommunicationRecipients(item.audience);
    try {
      await communicationRepository.updateStatus(item.id, "sending", { recipientCount: recipients.length });
      await dispatchCommunication({ communicationId: item.id, title: item.title, content: item.content, channel: item.channel, audienceUserIds: recipients.map((user) => user.id), recipients: recipients.map((user) => ({ id: user.id, email: user.email, name: user.displayName })), scheduledAt: null, repository: communicationRepository, emailProvider: item.channel === "internal" ? null : brevoEmailProvider });
      await communicationRepository.updateStatus(item.id, "sent", { sentAt: new Date(), recipientCount: recipients.length });
    } catch (error) { await communicationRepository.updateStatus(item.id, "failed", { failureReason: error instanceof Error ? error.message : "Falha no envio." }); }
  }
  return NextResponse.json({ processed: due.length });
}
