
export async function getDocuments() {
  const res = await fetch("/api/documents", {
    method: "GET",
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Failed to fetch documents");
  }
  const data = await res.json();
  return data.documents;
}
