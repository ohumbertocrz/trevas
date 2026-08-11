import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdministrativeUser } from "@/application/access/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdministrativeUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
