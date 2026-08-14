import { adminAuth, adminFirestore, adminStorage } from "@/infrastructure/firebase/admin";

const userOwnedCollections = ["lessonProgress", "lessonNotes", "laboratoryAttempts", "savedItems", "archiveItems", "communicationDeliveries", "aiAnalyses", "aiUsage"];

export async function deleteUserAccount(userId: string) {
  const db = adminFirestore();
  const references: FirebaseFirestore.DocumentReference[] = [db.collection("users").doc(userId)];
  const entitlements = await db.collection("entitlements").where("userId", "==", userId).get();
  references.push(...entitlements.docs.map((document) => document.ref));
  for (const collectionName of userOwnedCollections) {
    const snapshot = await db.collection(collectionName).where("userId", "==", userId).get();
    references.push(...snapshot.docs.map((document) => document.ref));
  }
  const profile = await db.collection("users").doc(userId).get();
  const email = String(profile.data()?.email ?? "");
  if (email) {
    const emailEvents = await db.collection("emailEvents").where("email", "==", email).get();
    references.push(...emailEvents.docs.map((document) => document.ref));
  }
  for (let index = 0; index < references.length; index += 450) {
    const batch = db.batch();
    references.slice(index, index + 450).forEach((reference) => batch.delete(reference));
    await batch.commit();
  }
  const [files] = await adminStorage().bucket().getFiles({ prefix: `users/${userId}/` });
  if (files.length > 0) await Promise.all(files.map((file) => file.delete({ ignoreNotFound: true })));
  await adminAuth().deleteUser(userId);
}
