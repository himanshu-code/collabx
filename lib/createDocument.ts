import { auth } from "@/lib/firebase";

export async function createDocument() {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}
