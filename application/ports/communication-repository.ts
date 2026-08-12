import type { Communication, CommunicationAudience, CommunicationChannel } from "@/domain/communication/entities";

export interface CommunicationRepository {
  list(limit?: number): Promise<Communication[]>;
  listDue(now: Date): Promise<Communication[]>;
  create(input: { title: string; content: string; channel: CommunicationChannel; audience: CommunicationAudience; scheduledAt: Date | null; createdBy: string }): Promise<Communication>;
  updateStatus(id: string, status: Communication["status"], details?: { sentAt?: Date | null; failureReason?: string; recipientCount?: number }): Promise<void>;
  createInternalDeliveries(communicationId: string, userIds: string[]): Promise<void>;
  listUserDeliveries(userId: string, limit?: number): Promise<Array<{ id: string; communicationId: string; title: string; content: string; status: string; createdAt: Date | null; openedAt: Date | null }>>;
  countUnreadDeliveries(userId: string): Promise<number>;
  markDeliveryOpened(deliveryId: string, userId: string): Promise<void>;
}
