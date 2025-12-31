import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from 'firebase-admin/auth';
import "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    // Create a session cookie logic
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(token, { expiresIn });

    (await cookies()).set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  }
  catch (error) {
    console.error("Error in session creation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
