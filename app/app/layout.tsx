import { MemberShell } from "@/components/member/member-shell";
import { requireAuthenticatedUser } from "@/application/access/session";
import { communicationRepository } from "@/infrastructure/repositories/firebase-communication-repository";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUser();
  const unreadNotices = await communicationRepository.countUnreadDeliveries(user.id);
  return <MemberShell user={user} unreadNotices={unreadNotices}>{children}</MemberShell>;
}
