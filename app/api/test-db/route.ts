import {connectDB} from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectDB();
    return NextResponse.json({message: 'Test database connection successful'});
}