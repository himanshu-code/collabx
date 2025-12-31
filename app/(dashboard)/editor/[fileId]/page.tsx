import EditorLayout, {
  type EditorData,
} from "@/components/ui/editor/EditorLayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/documents/${fileId}`, {
    headers: {
      Cookie: `__session=${sessionCookie}`,
    },
    cache: "no-store",
  });


  console.log(res);
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) throw new Error("Failed to load");
  const data = await res.json();

  return <EditorLayout editorData={data} />;
}
