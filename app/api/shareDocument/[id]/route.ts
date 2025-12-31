import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongo";
import { Document } from "@/models/Document";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebaseAdmin";
import mongoose from "mongoose";

export async function POST(
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
    const { email, role } = await req.json();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid DocumentId" },
        { status: 400 }
      );
    }

    if (!email || !["viewer", "editor"].includes(role)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let targetUser;
    try {
      targetUser = await getAuth().getUserByEmail(email);
    } catch (error) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const doc = await Document.findOne({ _id: id, ownerId: decoded.uid });
    console.log(doc);
    if (!doc) {
      return NextResponse.json(
        { error: "Not found of not owner" },
        { status: 403 }
      );
    }
    if (!Array.isArray(doc.sharedWith)) {
      doc.sharedWith = [];
    }

    const alreadyShared = doc?.sharedWith?.find(
      (u: any) => u.userId === targetUser.uid
    );

    if (alreadyShared) {
      await Document.updateOne(
        { _id: id, ownerId: decoded.uid, "sharedWith.userId": targetUser.uid },
        { $set: { "sharedWith.$.role": role } }
      );
    } else {
      //   doc.sharedWith = doc.sharedWith ?? [];
      await Document.updateOne(
        { _id: id, ownerId: decoded.uid },
        { $push: { sharedWith: { userId: targetUser.uid, role } } }
      );
    }
    // doc.markModified("sharedWith");
    // await doc.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("Error while sharing", error);
    return NextResponse.json(
      { error: "Error Occured while sharing" },
      { status: 500 }
    );
  }
}
