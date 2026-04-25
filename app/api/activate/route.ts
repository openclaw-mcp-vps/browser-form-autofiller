import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { activateSession } from "@/lib/storage";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    sessionId?: string;
    email?: string;
  };

  if (!body.sessionId?.trim()) {
    return NextResponse.json({ error: "Checkout session ID is required." }, { status: 400 });
  }

  const result = await activateSession({
    sessionId: body.sessionId.trim(),
    email: body.email?.trim() || undefined
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, "1", cookieOptions);
  return response;
}
