import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase ainda não foi configurado neste ambiente.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let appCheck: AppCheck | null = null;
export function getFirebaseAppCheck() {
  if (typeof window === "undefined" || !isFirebaseConfigured || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) return null;
  if (appCheck) return appCheck;
  appCheck = initializeAppCheck(getFirebaseApp(), { provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
  return appCheck;
}
