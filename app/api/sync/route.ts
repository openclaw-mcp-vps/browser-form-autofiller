import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { buildFieldMap, classifyContext } from "@/lib/ai-context";
import { getProfiles } from "@/lib/storage";
import type { AutofillProfile } from "@/lib/types";

function hasSyncAccess(request: NextRequest) {
  if (request.cookies.get(ACCESS_COOKIE_NAME)?.value === "1") {
    return true;
  }

  const configuredToken = process.env.EXTENSION_SYNC_TOKEN;
  if (!configuredToken) {
    return false;
  }

  const providedToken = request.headers.get("x-sync-token");
  return providedToken === configuredToken;
}

export async function GET(request: NextRequest) {
  if (!hasSyncAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await getProfiles();
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  if (!hasSyncAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    formText?: string;
    pageUrl?: string;
    profileId?: string;
  };

  const profiles = await getProfiles();
  if (!profiles.length) {
    return NextResponse.json({ error: "No profiles available." }, { status: 400 });
  }

  const selectedProfile: AutofillProfile =
    profiles.find((profile) => profile.id === body.profileId) ?? profiles[0];

  const context = classifyContext({
    formText: body.formText ?? "",
    pageUrl: body.pageUrl
  });

  const fieldMap = buildFieldMap(selectedProfile, context.contextType);

  return NextResponse.json({
    profileId: selectedProfile.id,
    context,
    fieldMap
  });
}
