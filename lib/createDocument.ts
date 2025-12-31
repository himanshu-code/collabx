
export async function createDocument() {
  const response = await fetch("/api/documents", {
    method: "POST",
  });
  if (response.status === 401) {
    window.location.href = "/login";
    return;
  }

  const data = await response.json();
  return data;
}
