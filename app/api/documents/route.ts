import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import { Document } from "@/models/Document";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  await connectDB();
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await getAuth().verifyIdToken(token);
    const documents = await Document.find({ ownerId: decodedToken.uid })
      .sort({
        updatedAt: -1,
      })
      .select("_id ownerId title createdAt updatedAt");
    return NextResponse.json({ documents: documents }, { status: 200 });
  } catch (error) {
    console.log("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Error occurred on server" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectDB();
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await getAuth().verifyIdToken(token);
    const doc = await Document.create({
      ownerId: decodedToken.uid,
      blocks: [{ id: "block-1", type: "paragraph", content: "" }],
    });
    return NextResponse.json(
      { documentId: doc._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error creating document:", error);
    return NextResponse.json(
      { error: "Error occurred on server" },
      { status: 500 }
    );
  }
}
