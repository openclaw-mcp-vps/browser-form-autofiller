import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { AutofillProfile, PurchaseRecord } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const profilesPath = path.join(dataDir, "profiles.json");
const purchasesPath = path.join(dataDir, "purchases.json");

interface ProfileStore {
  profiles: AutofillProfile[];
  updatedAt: string;
}

interface PurchaseStore {
  sessions: PurchaseRecord[];
  updatedAt: string;
}

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function safeReadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function queueWrite(filePath: string, content: string) {
  writeQueue = writeQueue.then(async () => {
    await writeFile(filePath, content, "utf8");
  });

  return writeQueue;
}

function profileDefaults(): ProfileStore {
  return {
    profiles: [
      {
        id: crypto.randomUUID(),
        name: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 290-1122",
        location: "Austin, TX",
        headline: "Product-focused automation consultant",
        summary:
          "I design practical automation systems that reduce repetitive operations work and improve form-data quality across hiring, onboarding, and compliance workflows.",
        workAuthorization: "US Citizen",
        salaryExpectation: "$145,000 base",
        availability: "2 weeks",
        links: {
          linkedin: "https://linkedin.com/in/alexmorgan",
          portfolio: "https://alexmorgan.work",
          github: "https://github.com/alexmorgan",
          website: "https://alexmorgan.work"
        },
        skills: ["Automation", "Form UX", "Process Design", "QA", "Prompt Engineering"],
        experiences: [
          {
            company: "Northwind Ops",
            title: "Automation Lead",
            impact:
              "Cut manual form-completion time by 41% across recruiting and grant intake operations."
          },
          {
            company: "Ridgeview Labs",
            title: "Systems Consultant",
            impact:
              "Built reusable profile templates for 8 departments with context-specific variations."
          }
        ],
        customFields: [
          {
            key: "Federal UEI",
            value: "L6G9N1X4D2Q8"
          },
          {
            key: "Preferred pronouns",
            value: "she/her"
          }
        ],
        contextOverrides: {
          job_application: {
            summary:
              "Automation-focused product professional with a track record of reducing repetitive hiring and onboarding friction through human-centered tooling.",
            salaryExpectation: "$145,000 base"
          },
          grant_application: {
            summary:
              "I deliver measurable operational improvements for public-interest programs by designing reliable, context-aware data capture workflows.",
            availability: "Immediate"
          },
          vendor_onboarding: {
            summary:
              "Reliable operations vendor specializing in workflow automation, compliance intake quality, and reporting discipline.",
            toneHint: "formal"
          },
          conference_submission: {
            summary:
              "Speaker and practitioner focused on pragmatic AI-assisted workflow design for operational teams.",
            toneHint: "inspiring"
          },
          loan_application: {
            summary:
              "Stable independent consultant with recurring contracts and documented revenue history.",
            toneHint: "concise"
          },
          healthcare_intake: {
            summary:
              "N/A",
            toneHint: "brief"
          },
          general: {
            summary:
              "Experienced automation consultant who helps teams complete recurring forms accurately and faster with context-aware workflows."
          }
        },
        updatedAt: new Date().toISOString()
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

function purchaseDefaults(): PurchaseStore {
  return {
    sessions: [],
    updatedAt: new Date().toISOString()
  };
}

export async function getProfiles(): Promise<AutofillProfile[]> {
  await ensureDataDir();
  const store = await safeReadJson<ProfileStore>(profilesPath, profileDefaults());
  return store.profiles;
}

export async function upsertProfile(profile: AutofillProfile): Promise<AutofillProfile[]> {
  await ensureDataDir();
  const store = await safeReadJson<ProfileStore>(profilesPath, profileDefaults());
  const existingIndex = store.profiles.findIndex((item) => item.id === profile.id);

  if (existingIndex >= 0) {
    store.profiles[existingIndex] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
  } else {
    store.profiles.unshift({
      ...profile,
      updatedAt: new Date().toISOString()
    });
  }

  store.updatedAt = new Date().toISOString();
  await queueWrite(profilesPath, JSON.stringify(store, null, 2));

  return store.profiles;
}

export async function deleteProfile(profileId: string): Promise<AutofillProfile[]> {
  await ensureDataDir();
  const store = await safeReadJson<ProfileStore>(profilesPath, profileDefaults());
  store.profiles = store.profiles.filter((profile) => profile.id !== profileId);
  store.updatedAt = new Date().toISOString();
  await queueWrite(profilesPath, JSON.stringify(store, null, 2));
  return store.profiles;
}

export async function recordCompletedSession(params: {
  sessionId: string;
  email: string;
  amountTotal: number;
  currency: string;
}) {
  await ensureDataDir();
  const store = await safeReadJson<PurchaseStore>(purchasesPath, purchaseDefaults());
  const existing = store.sessions.find((entry) => entry.sessionId === params.sessionId);

  if (!existing) {
    store.sessions.push({
      sessionId: params.sessionId,
      email: params.email,
      amountTotal: params.amountTotal,
      currency: params.currency,
      createdAt: new Date().toISOString()
    });
    store.updatedAt = new Date().toISOString();
    await queueWrite(purchasesPath, JSON.stringify(store, null, 2));
  }
}

export async function activateSession(params: {
  sessionId: string;
  email?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  await ensureDataDir();
  const store = await safeReadJson<PurchaseStore>(purchasesPath, purchaseDefaults());
  const entry = store.sessions.find((session) => session.sessionId === params.sessionId);

  if (!entry) {
    return {
      ok: false,
      reason:
        "Session not found. Make sure Stripe redirects back with session_id and webhook delivery is configured."
    };
  }

  if (params.email && entry.email && entry.email.toLowerCase() !== params.email.toLowerCase()) {
    return {
      ok: false,
      reason: "Email does not match the checkout record for this session."
    };
  }

  entry.activatedAt = new Date().toISOString();
  store.updatedAt = new Date().toISOString();
  await queueWrite(purchasesPath, JSON.stringify(store, null, 2));

  return { ok: true };
}
