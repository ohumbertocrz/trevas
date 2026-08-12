export interface AiUsage { weekKey: string; used: number; limit: number; }
export interface AiUsageRepository {
  get(userId: string): Promise<AiUsage>;
  reserve(userId: string): Promise<AiUsage>;
  complete(userId: string, reservationId: string, input: { promptChars: number; responseChars: number; model: string }): Promise<void>;
  refund(userId: string, reservationId: string): Promise<void>;
}
