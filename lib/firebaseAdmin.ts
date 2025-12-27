import { initializeApp, getApps, cert } from "firebase-admin/app";
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
};
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}
