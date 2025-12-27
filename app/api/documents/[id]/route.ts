import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import { Document } from "@/models/Document";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const uid = req.headers.get("x-user-id");

    const doc = await Document.findOne({
      _id: id,
      ownerId: uid,
    }).lean();

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(doc);
  } catch (error) {
    console.log("Error fetching document:", error);
    return NextResponse.json(
      { error: "Error occurred on server" },
      { status: 500 }
    );
  }
}
