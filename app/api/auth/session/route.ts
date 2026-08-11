import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/application/access/session";
import { adminAuth } from "@/infrastructure/firebase/admin";
import { accessRepository } from "@/infrastructure/repositories/firebase-access-repository";

const requestSchema = z.object({ idToken: z.string().min(100) });

export async function POST(request: Request) {
  try {
    const { idToken } = requestSchema.parse(await request.json());
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    const authUser = await adminAuth().getUser(decoded.uid);
    if (!authUser.email) return NextResponse.json({ error: "A conta não possui e-mail." }, { status: 400 });

    await accessRepository.ensureProfile({
      id: decoded.uid,
      email: authUser.email,
      displayName: authUser.displayName || authUser.email.split("@")[0],
    });

    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Unable to establish Firebase session", error);
    return NextResponse.json({ error: "Não foi possível iniciar a sessão." }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
