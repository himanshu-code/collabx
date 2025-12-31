import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { Document } from "@/models/Document";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  await connectDB();
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    const documents = await Document.find({
      $or: [
        { ownerId: decodedToken.uid },
        { "sharedWith.userId": decodedToken.uid },
      ],
    })
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
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await getAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    const doc = await Document.create({
      ownerId: decodedToken.uid,
      blocks: [{ id: "block-1", type: "paragraph", content: "" }],
      sharedWith: [],
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
