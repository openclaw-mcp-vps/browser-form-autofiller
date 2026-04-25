export function inferContextFromText(text) {
  const value = String(text || "").toLowerCase();
  if (/(resume|cover letter|employment|recruiter)/.test(value)) return "job_application";
  if (/(grant|funding|proposal|award)/.test(value)) return "grant_application";
  if (/(vendor|supplier|procurement|w-9|invoice)/.test(value)) return "vendor_onboarding";
  if (/(loan|credit|borrower|underwriting)/.test(value)) return "loan_application";
  if (/(conference|speaker|abstract|cfp)/.test(value)) return "conference_submission";
  if (/(medical|patient|insurance|clinic)/.test(value)) return "healthcare_intake";
  return "general";
}
