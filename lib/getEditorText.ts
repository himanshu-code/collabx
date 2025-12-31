
export async function getEditorText(documentId: string) {
  const res = await fetch(`/api/documents?id=${documentId}`, {
    method: "GET",
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Failed to fetch document text");
  }
  const data = await res.json();
  return data;
}
