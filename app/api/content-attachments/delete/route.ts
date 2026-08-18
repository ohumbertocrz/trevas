import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasAdministrativeAccess } from "@/application/access/permissions";
import { deleteContentAttachment } from "@/application/services/content-attachments";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !hasAdministrativeAccess(user.roles)) return NextResponse.json({ error: "NÃ£o autorizado." }, { status: 401 });
  const formData = await request.formData();
  const attachmentId = String(formData.get("attachmentId") ?? "");
  if (!attachmentId) return NextResponse.json({ error: "Arquivo nÃ£o informado." }, { status: 400 });
  await deleteContentAttachment(attachmentId, user.id);
  return NextResponse.json({ ok: true });
}
