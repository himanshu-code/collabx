import {NextResponse} from 'next/server';
import {connectDB} from '@/lib/mongo';
import {File} from '@/models/File';

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const workSpaceId = searchParams.get('workSpaceId');

    if (!workSpaceId) {
        return NextResponse.json({error: 'workSpaceId is required'}, {status: 400});
    }
    try{
        await connectDB();
        const files =await File.find({workSpaceId});
        return NextResponse.json({files},{status:200});
    }
    catch(error){
        console.error("Error fetching files:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const { name, workSpaceId } = await request.json();
    if (!name || !workSpaceId) {
      return NextResponse.json(
        { error: "name and workSpaceId are required" },
        { status: 400 }
      );
    }
    try{
        await connectDB();
        const file=await File.create({name,workSpaceId});
        return NextResponse.json({file},{status:201});
    }
    catch(error){
        console.error("Error creating file:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
    }
}