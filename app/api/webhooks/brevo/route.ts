import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/infrastructure/firebase/admin";

export async function POST(request: Request) {
  const event = await request.json().catch(() => null);
  if (!event || typeof event !== "object") return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  await adminFirestore().collection("emailEvents").add({ ...event as Record<string, unknown>, receivedAt: FieldValue.serverTimestamp(), provider: "brevo" });
  return NextResponse.json({ received: true });
}
