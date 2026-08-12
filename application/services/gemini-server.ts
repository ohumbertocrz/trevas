import { GoogleGenAI } from "@google/genai";

export function getGeminiServer() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada no servidor.");
  return new GoogleGenAI({ apiKey });
}
