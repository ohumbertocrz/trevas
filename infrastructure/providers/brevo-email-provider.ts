import type { EmailProvider } from "@/application/ports/email-provider";

export class BrevoEmailProvider implements EmailProvider {
  async send(input: Parameters<EmailProvider["send"]>[0]) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!apiKey || !senderEmail) throw new Error("Configure BREVO_API_KEY e BREVO_SENDER_EMAIL no backend.");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" }, body: JSON.stringify({ sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME ?? "Trevas" }, to: input.to, subject: input.subject, htmlContent: input.html, scheduledAt: input.scheduledAt?.toISOString(), tags: input.tags }) });
    if (!response.ok) throw new Error(`Brevo recusou o envio (${response.status}).`);
    const data = await response.json() as { messageId?: string };
    return { messageId: data.messageId ?? null };
  }
}

export const brevoEmailProvider = new BrevoEmailProvider();
