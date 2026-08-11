import { MemberShell } from "@/components/member/member-shell";
import { requireMember } from "@/application/access/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireMember();
  return <MemberShell user={user}>{children}</MemberShell>;
}
