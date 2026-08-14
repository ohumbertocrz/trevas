"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireMember, SESSION_COOKIE_NAME } from "@/application/access/session";
import { deleteUserAccount } from "@/application/services/delete-user-account";

export async function deleteMyAccount(formData: FormData) {
  const user = await requireMember("/app/perfil");
  if (String(formData.get("confirmation") ?? "").trim().toUpperCase() !== "APAGAR") throw new Error("Digite APAGAR para confirmar a exclusão.");
  await deleteUserAccount(user.id);
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login?deleted=1");
}
