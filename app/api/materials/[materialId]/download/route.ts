import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { getAuthenticatedUser } from "@/application/access/session";
import { hasActiveEntitlement, hasAdministrativeAccess } from "@/application/access/permissions";
import { canAccessLesson } from "@/application/access/lesson-access";
import { libraryRepository } from "@/infrastructure/repositories/firebase-library-repository";
import { adminFirestore } from "@/infrastructure/firebase/admin";
import { adminStorage } from "@/infrastructure/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ materialId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { materialId } = await params;
  const material = (await libraryRepository.listMaterials()).find((item) => item.id === materialId);
  if (!material || material.visibility !== "published" || !material.storagePath.startsWith("protected/")) return NextResponse.json({ error: "Material não disponível." }, { status: 404 });
  if (!hasAdministrativeAccess(user.roles) && !hasActiveEntitlement(user.entitlement)) {
    const links = await adminFirestore().collection("lessonMaterials").where("materialId", "==", materialId).get();
    const allowed = (await Promise.all(links.docs.map(async (link) => canAccessLesson(user, String(link.data().lessonId ?? ""))))).some(Boolean);
    if (!allowed) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  }
  const file = adminStorage().bucket().file(material.storagePath);
  const [bytes, metadata] = await Promise.all([file.download(), file.getMetadata()]);
  const contentType = metadata[0].contentType ?? "application/octet-stream";
  if (material.type !== "pdf" && contentType !== "application/pdf") return new NextResponse(bytes[0] as BodyInit, { headers: { "Content-Type": contentType, "Content-Disposition": `attachment; filename="${encodeURIComponent(material.title)}"`, "Cache-Control": "private, no-store" } });
  const document = await PDFDocument.load(bytes[0]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const email = user.email.replace(/^(.{3}).*(@.*)$/, "$1***$2");
  const label = `${user.displayName} · ${email} · Trevas`;
  for (const page of document.getPages()) { const { width, height } = page.getSize(); page.drawText(label, { x: 28, y: 22, size: 8, font, color: rgb(0.45, 0.45, 0.45), opacity: 0.7 }); page.drawText(label, { x: width * 0.35, y: height * 0.5, size: 14, font, color: rgb(0.6, 0.6, 0.6), opacity: 0.13, rotate: degrees(25) }); }
  const output = await document.save();
  return new NextResponse(output as BodyInit, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${encodeURIComponent(material.title)}.pdf"`, "Cache-Control": "private, no-store" } });
}
