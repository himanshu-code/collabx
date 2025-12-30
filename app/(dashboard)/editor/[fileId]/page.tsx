import EditorLayout, {
  type EditorData,
} from "@/components/ui/editor/EditorLayout";
import { cookies } from "next/headers";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) {
    return <div>UnAuthorized </div>;
  }
  const res = await fetch(`http://localhost:3000/api/documents/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  console.log(res);
  if (!res.ok) throw new Error("Failed to load");
  const data = await res.json();

  return <EditorLayout editorData={data} />;
}
