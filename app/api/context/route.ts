import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ACCESS_COOKIE_NAME } from "@/lib/auth";
import { buildFieldMap, classifyContext } from "@/lib/ai-context";
import type { AutofillProfile, ContextType } from "@/lib/types";

const contextTypes: ContextType[] = [
  "job_application",
  "grant_application",
  "vendor_onboarding",
  "conference_submission",
  "loan_application",
  "healthcare_intake",
  "general"
];

function hasContextAccess(request: NextRequest): boolean {
  return request.cookies.get(ACCESS_COOKIE_NAME)?.value === "1";
}

async function maybeEnhanceWithOpenAI(args: {
  formText: string;
  pageUrl?: string;
  fallback: ContextType;
}): Promise<ContextType> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !args.formText.trim()) {
    return args.fallback;
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      input: [
        {
          role: "system",
          content:
            "You classify online forms. Respond with one exact label: job_application, grant_application, vendor_onboarding, conference_submission, loan_application, healthcare_intake, general."
        },
        {
          role: "user",
          content: `URL: ${args.pageUrl ?? "n/a"}\nForm text:\n${args.formText}`
        }
      ]
    });

    const label = response.output_text.trim() as ContextType;
    if (contextTypes.includes(label)) {
      return label;
    }
  } catch {
    return args.fallback;
  }

  return args.fallback;
}

export async function POST(request: NextRequest) {
  if (!hasContextAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    formText?: string;
    pageUrl?: string;
    profile?: AutofillProfile;
  };

  if (!body.profile) {
    return NextResponse.json({ error: "Profile payload is required." }, { status: 400 });
  }

  const fallback = classifyContext({
    formText: body.formText ?? "",
    pageUrl: body.pageUrl
  });

  const contextType = await maybeEnhanceWithOpenAI({
    formText: body.formText ?? "",
    pageUrl: body.pageUrl,
    fallback: fallback.contextType
  });

  const context = {
    ...fallback,
    contextType
  };

  const fieldMap = buildFieldMap(body.profile, context.contextType);

  return NextResponse.json({ context, fieldMap });
}
