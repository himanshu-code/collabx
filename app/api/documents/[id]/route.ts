import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { Document } from "@/models/Document";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await getAuth().verifySessionCookie(sessionCookie, true /** checkRevoked */);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid document id" }, { status: 400 });
  }

  const doc = await Document.findOne({
    _id: id,
    ownerId: decoded.uid,
  }).lean();

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(doc);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const sessionCookie = (await cookies()).get("__session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "UnAuthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await getAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { blocks } = await req.json();
    const { id } = await params;

    const updated = await Document.findOneAndUpdate(
      { _id: id, ownerId: decoded.uid },
      {
        blocks,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.log("Error while saving document data", error);
    return NextResponse.json(
      { error: "Error occurred on server" },
      { status: 500 }
    );
  }
}
