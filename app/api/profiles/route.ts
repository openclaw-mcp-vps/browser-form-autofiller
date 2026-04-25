import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { deleteProfile, getProfiles, upsertProfile } from "@/lib/storage";
import type { AutofillProfile } from "@/lib/types";

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get(ACCESS_COOKIE_NAME)?.value === "1";
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await getProfiles();
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as Partial<AutofillProfile>;

  if (!payload.id || !payload.name || !payload.email) {
    return NextResponse.json({ error: "Missing required profile fields." }, { status: 400 });
  }

  const profiles = await upsertProfile(payload as AutofillProfile);
  return NextResponse.json({ profiles });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as { id?: string };
  if (!payload.id) {
    return NextResponse.json({ error: "Profile id is required." }, { status: 400 });
  }

  const profiles = await deleteProfile(payload.id);
  return NextResponse.json({ profiles });
}
