import type {
  AutofillProfile,
  ContextAnalysisResult,
  ContextType
} from "@/lib/types";

const contextKeywordMap: Record<
  Exclude<ContextType, "general">,
  { keywords: string[]; reasons: string[] }
> = {
  job_application: {
    keywords: [
      "resume",
      "cover letter",
      "work experience",
      "employment",
      "hiring",
      "recruiter",
      "position",
      "cv"
    ],
    reasons: [
      "Detected employment-focused wording",
      "Field labels suggest a candidate intake flow"
    ]
  },
  grant_application: {
    keywords: [
      "grant",
      "funding",
      "budget",
      "proposal",
      "impact statement",
      "project scope",
      "award"
    ],
    reasons: [
      "Detected funding and project language",
      "Form appears to request grant narrative details"
    ]
  },
  vendor_onboarding: {
    keywords: [
      "vendor",
      "supplier",
      "w-9",
      "tax id",
      "payment terms",
      "procurement",
      "invoice",
      "bank account"
    ],
    reasons: [
      "Detected procurement and payment setup terms",
      "Fields align with supplier onboarding"
    ]
  },
  conference_submission: {
    keywords: [
      "conference",
      "speaker",
      "session abstract",
      "talk title",
      "bio",
      "submission",
      "cfp"
    ],
    reasons: [
      "Detected conference speaker submission language",
      "Form includes abstract or talk proposal clues"
    ]
  },
  loan_application: {
    keywords: [
      "loan",
      "credit",
      "income",
      "financial",
      "debt",
      "underwriting",
      "lender",
      "borrower"
    ],
    reasons: [
      "Detected lending and underwriting terminology",
      "Form requests financing-related information"
    ]
  },
  healthcare_intake: {
    keywords: [
      "patient",
      "medical",
      "insurance",
      "allergy",
      "provider",
      "clinic",
      "diagnosis",
      "symptoms"
    ],
    reasons: [
      "Detected healthcare intake language",
      "Fields match clinical or patient onboarding"
    ]
  }
};

function scoreContext(text: string, keywords: string[]): number {
  return keywords.reduce((score, keyword) => {
    if (text.includes(keyword)) {
      return score + 1;
    }
    return score;
  }, 0);
}

export function classifyContext(input: {
  formText: string;
  pageUrl?: string;
}): ContextAnalysisResult {
  const merged = `${input.formText} ${input.pageUrl ?? ""}`.toLowerCase();

  let bestType: ContextType = "general";
  let bestScore = 0;
  let winningReasons: string[] = [
    "No strong niche signals detected",
    "Using general profile defaults"
  ];

  for (const [contextType, details] of Object.entries(contextKeywordMap)) {
    const score = scoreContext(merged, details.keywords);
    if (score > bestScore) {
      bestType = contextType as ContextType;
      bestScore = score;
      winningReasons = details.reasons;
    }
  }

  if (bestScore === 0) {
    return {
      contextType: "general",
      confidence: 0.38,
      reasons: winningReasons
    };
  }

  const confidence = Math.min(0.95, 0.45 + bestScore * 0.1);

  return {
    contextType: bestType,
    confidence,
    reasons: winningReasons
  };
}

function coerceFieldName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function buildFieldMap(profile: AutofillProfile, contextType: ContextType) {
  const override = profile.contextOverrides[contextType] ?? {};

  const baseSummary = override.summary?.trim() || profile.summary;
  const baseAvailability =
    override.availability?.trim() || profile.availability || "Immediate";
  const baseSalary =
    override.salaryExpectation?.trim() || profile.salaryExpectation;

  const map: Record<string, string> = {
    full_name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    summary: baseSummary,
    availability: baseAvailability,
    salary_expectation: baseSalary,
    work_authorization: profile.workAuthorization,
    linkedin: profile.links.linkedin,
    portfolio: profile.links.portfolio,
    github: profile.links.github,
    website: profile.links.website,
    skills: profile.skills.join(", "),
    experience_highlights: profile.experiences
      .map((item) => `${item.title} at ${item.company}: ${item.impact}`)
      .join(" | ")
  };

  for (const customField of profile.customFields) {
    if (!customField.key.trim() || !customField.value.trim()) {
      continue;
    }
    map[coerceFieldName(customField.key)] = customField.value;
  }

  return map;
}
