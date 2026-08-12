export interface EmailProvider {
  send(input: { to: Array<{ email: string; name?: string }>; subject: string; html: string; scheduledAt?: Date | null; tags?: string[] }): Promise<{ messageId: string | null }>;
}
