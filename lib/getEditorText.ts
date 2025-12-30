import { auth } from "@/lib/firebase";

export async function getEditorText(documentId: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/documents?id=${documentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch document text");
  }
  const data = await res.json();
  return data;
}
