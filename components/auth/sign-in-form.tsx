"use client";

import { FirebaseError } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, type UserCredential } from "firebase/auth";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { getFirebaseApp } from "@/infrastructure/firebase/client";

function authMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) return "Não foi possível entrar. Tente novamente.";
  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(error.code)) return "E-mail ou senha incorretos.";
  if (error.code === "auth/too-many-requests") return "Muitas tentativas. Aguarde alguns minutos.";
  if (error.code === "auth/invalid-email") return "Informe um e-mail válido.";
  if (error.code === "auth/popup-closed-by-user") return "A entrada com Google foi cancelada.";
  if (error.code === "auth/popup-blocked") return "O navegador bloqueou a janela do Google. Libere pop-ups e tente novamente.";
  if (error.code === "auth/account-exists-with-different-credential") return "Este e-mail já usa outro método de entrada.";
  return "Não foi possível entrar. Tente novamente.";
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function establishSession(credential: UserCredential) {
    const idToken = await credential.user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) throw new Error("session");
    const returnTo = searchParams.get("returnTo");
    router.replace(returnTo?.startsWith("/") ? returnTo : "/app");
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const credential = await signInWithEmailAndPassword(getAuth(getFirebaseApp()), email.trim(), password);
      await establishSession(credential);
    } catch (error) {
      setMessage(authMessage(error));
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    setPending(true);
    setMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(getAuth(getFirebaseApp()), provider);
      await establishSession(credential);
    } catch (error) {
      setMessage(authMessage(error));
    } finally {
      setPending(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setMessage("Informe seu e-mail para recuperar a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(getAuth(getFirebaseApp()), email.trim());
      setMessage("Enviamos as instruções de recuperação para seu e-mail.");
    } catch (error) {
      setMessage(authMessage(error));
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="email">E-mail</label>
      <div className="auth-field"><Mail aria-hidden="true" /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <label htmlFor="password">Senha</label>
      <div className="auth-field"><LockKeyhole aria-hidden="true" /><input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <button className="text-link auth-reset" type="button" onClick={resetPassword}>Esqueci minha senha</button>
      {message && <p className="auth-message" role="status">{message}</p>}
      <button className="primary-button auth-submit" type="submit" disabled={pending}>{pending ? <LoaderCircle className="spinner" /> : <>Entrar <ArrowRight size={16} /></>}</button>
      <div className="auth-divider"><span>ou</span></div>
      <button className="google-button" type="button" onClick={signInWithGoogle} disabled={pending}>
        <span className="google-mark" aria-hidden="true">G</span>
        Continuar com Google
      </button>
    </form>
  );
}
