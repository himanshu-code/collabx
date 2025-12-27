import { auth } from "@/lib/firebase";

export async function getDocuments() {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch("/api/documents", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }
  const data = await res.json();
  return data.documents;
}
