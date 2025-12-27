import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import { Workspace } from "@/models/Workspace";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required" }, { status: 400 });
  }
  try {
    await connectDB();
    const workspaces = await Workspace.find({ ownerId });
    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    const { name, ownerId } = await request.json();
    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "name and ownerId are required" },
        { status: 400 }
      );
    }
    try{
        await connectDB();
        const ws=await Workspace.create({name,ownerId});
        return NextResponse.json({workspace:ws},{status:201});
    }
    catch(error){
        console.error("Error creating workspace:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
    }
}
