export const COMMUNICATION_CHANNELS = ["internal", "email", "both"] as const;
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];
export const COMMUNICATION_STATUSES = ["draft", "scheduled", "sending", "sent", "failed"] as const;
export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];
export const COMMUNICATION_AUDIENCES = ["active_students", "all_active", "not_started", "inactive_30_days"] as const;
export type CommunicationAudience = (typeof COMMUNICATION_AUDIENCES)[number];

export interface Communication {
  id: string;
  title: string;
  content: string;
  channel: CommunicationChannel;
  audience: CommunicationAudience;
  status: CommunicationStatus;
  scheduledAt: Date | null;
  createdAt: Date | null;
  sentAt: Date | null;
  createdBy: string;
  recipientCount: number;
  failureReason: string;
}

export interface CommunicationDelivery {
  id: string;
  communicationId: string;
  userId: string;
  email: string;
  channel: "internal" | "email";
  status: "pending" | "sent" | "delivered" | "opened" | "failed";
  deliveredAt: Date | null;
  openedAt: Date | null;
}
