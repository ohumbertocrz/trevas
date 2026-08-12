import type { CommunicationChannel } from "@/domain/communication/entities";
import type { CommunicationRepository } from "@/application/ports/communication-repository";
import type { EmailProvider } from "@/application/ports/email-provider";

export async function dispatchCommunication(input: { communicationId: string; title: string; content: string; channel: CommunicationChannel; audienceUserIds: string[]; recipients: Array<{ id: string; email: string; name: string }>; scheduledAt: Date | null; repository: CommunicationRepository; emailProvider: EmailProvider | null }) {
  if (input.channel === "internal" || input.channel === "both") await input.repository.createInternalDeliveries(input.communicationId, input.audienceUserIds);
  if (input.channel === "email" || input.channel === "both") {
    if (!input.emailProvider) throw new Error("Provedor de e-mail não configurado.");
    await input.emailProvider.send({ to: input.recipients.map(({ email, name }) => ({ email, name })), subject: input.title, html: `<main style="font-family:Arial,sans-serif;line-height:1.6"><h1>${escapeHtml(input.title)}</h1>${input.content.split(/\r?\n/).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</main>`, scheduledAt: input.scheduledAt, tags: ["trevas", "communication", input.communicationId] });
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
