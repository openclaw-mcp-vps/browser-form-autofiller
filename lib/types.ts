export type ContextType =
  | "job_application"
  | "grant_application"
  | "vendor_onboarding"
  | "conference_submission"
  | "loan_application"
  | "healthcare_intake"
  | "general";

export interface ProfileLinkSet {
  linkedin: string;
  portfolio: string;
  github: string;
  website: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  impact: string;
}

export interface CustomField {
  key: string;
  value: string;
}

export interface ContextOverride {
  summary?: string;
  toneHint?: string;
  salaryExpectation?: string;
  availability?: string;
}

export interface AutofillProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  workAuthorization: string;
  salaryExpectation: string;
  availability: string;
  links: ProfileLinkSet;
  skills: string[];
  experiences: ExperienceItem[];
  customFields: CustomField[];
  contextOverrides: Record<ContextType, ContextOverride>;
  updatedAt: string;
}

export interface ContextAnalysisResult {
  contextType: ContextType;
  confidence: number;
  reasons: string[];
}

export interface PurchaseRecord {
  sessionId: string;
  email: string;
  amountTotal: number;
  currency: string;
  activatedAt?: string;
  createdAt: string;
}
