"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AutofillProfile, ContextType } from "@/lib/types";

interface ProfileEditorProps {
  initialProfile?: AutofillProfile | null;
  onSave: (profile: AutofillProfile) => Promise<void> | void;
  onCancel?: () => void;
}

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  workAuthorization: string;
  salaryExpectation: string;
  availability: string;
  linkedin: string;
  portfolio: string;
  github: string;
  website: string;
  skillsText: string;
  experiences: {
    company: string;
    title: string;
    impact: string;
  }[];
  customFields: {
    key: string;
    value: string;
  }[];
  jobSummary: string;
  grantSummary: string;
  vendorSummary: string;
  conferenceSummary: string;
  loanSummary: string;
  healthcareSummary: string;
  generalSummary: string;
}

const contextSummaryFieldMap: Record<ContextType, keyof ProfileFormValues> = {
  job_application: "jobSummary",
  grant_application: "grantSummary",
  vendor_onboarding: "vendorSummary",
  conference_submission: "conferenceSummary",
  loan_application: "loanSummary",
  healthcare_intake: "healthcareSummary",
  general: "generalSummary"
};

function toDefaultValues(initialProfile?: AutofillProfile | null): ProfileFormValues {
  if (!initialProfile) {
    return {
      name: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
      workAuthorization: "",
      salaryExpectation: "",
      availability: "",
      linkedin: "",
      portfolio: "",
      github: "",
      website: "",
      skillsText: "",
      experiences: [{ company: "", title: "", impact: "" }],
      customFields: [{ key: "", value: "" }],
      jobSummary: "",
      grantSummary: "",
      vendorSummary: "",
      conferenceSummary: "",
      loanSummary: "",
      healthcareSummary: "",
      generalSummary: ""
    };
  }

  return {
    name: initialProfile.name,
    email: initialProfile.email,
    phone: initialProfile.phone,
    location: initialProfile.location,
    headline: initialProfile.headline,
    summary: initialProfile.summary,
    workAuthorization: initialProfile.workAuthorization,
    salaryExpectation: initialProfile.salaryExpectation,
    availability: initialProfile.availability,
    linkedin: initialProfile.links.linkedin,
    portfolio: initialProfile.links.portfolio,
    github: initialProfile.links.github,
    website: initialProfile.links.website,
    skillsText: initialProfile.skills.join(", "),
    experiences: initialProfile.experiences.length
      ? initialProfile.experiences
      : [{ company: "", title: "", impact: "" }],
    customFields: initialProfile.customFields.length
      ? initialProfile.customFields
      : [{ key: "", value: "" }],
    jobSummary: initialProfile.contextOverrides.job_application?.summary ?? "",
    grantSummary: initialProfile.contextOverrides.grant_application?.summary ?? "",
    vendorSummary: initialProfile.contextOverrides.vendor_onboarding?.summary ?? "",
    conferenceSummary: initialProfile.contextOverrides.conference_submission?.summary ?? "",
    loanSummary: initialProfile.contextOverrides.loan_application?.summary ?? "",
    healthcareSummary: initialProfile.contextOverrides.healthcare_intake?.summary ?? "",
    generalSummary: initialProfile.contextOverrides.general?.summary ?? ""
  };
}

export function ProfileEditor({ initialProfile, onSave, onCancel }: ProfileEditorProps) {
  const defaultValues = useMemo(() => toDefaultValues(initialProfile), [initialProfile]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting }
  } = useForm<ProfileFormValues>({
    defaultValues
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const experienceFieldArray = useFieldArray({
    name: "experiences",
    control
  });

  const customFieldArray = useFieldArray({
    name: "customFields",
    control
  });

  const submit = handleSubmit(async (values) => {
    const now = new Date().toISOString();

    const nextProfile: AutofillProfile = {
      id: initialProfile?.id ?? crypto.randomUUID(),
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      location: values.location.trim(),
      headline: values.headline.trim(),
      summary: values.summary.trim(),
      workAuthorization: values.workAuthorization.trim(),
      salaryExpectation: values.salaryExpectation.trim(),
      availability: values.availability.trim(),
      links: {
        linkedin: values.linkedin.trim(),
        portfolio: values.portfolio.trim(),
        github: values.github.trim(),
        website: values.website.trim()
      },
      skills: values.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      experiences: values.experiences.filter(
        (item) => item.company.trim() || item.title.trim() || item.impact.trim()
      ),
      customFields: values.customFields.filter((item) => item.key.trim() && item.value.trim()),
      contextOverrides: {
        job_application: { summary: values.jobSummary.trim() },
        grant_application: { summary: values.grantSummary.trim() },
        vendor_onboarding: { summary: values.vendorSummary.trim() },
        conference_submission: { summary: values.conferenceSummary.trim() },
        loan_application: { summary: values.loanSummary.trim() },
        healthcare_intake: { summary: values.healthcareSummary.trim() },
        general: { summary: values.generalSummary.trim() }
      },
      updatedAt: now
    };

    for (const contextType of Object.keys(contextSummaryFieldMap) as ContextType[]) {
      const key = contextSummaryFieldMap[contextType];
      if (!nextProfile.contextOverrides[contextType].summary) {
        delete nextProfile.contextOverrides[contextType].summary;
      }
      if (key === "generalSummary" && !nextProfile.contextOverrides.general.summary) {
        nextProfile.contextOverrides.general.summary = values.summary.trim();
      }
    }

    await onSave(nextProfile);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialProfile ? "Edit Profile" : "Create Profile"}</CardTitle>
        <CardDescription>
          Store your reusable information once, then let the context mapper adapt it for each form type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={submit}>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="headline">Professional headline</Label>
              <Input id="headline" {...register("headline")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="summary">Default summary</Label>
              <Textarea id="summary" rows={4} {...register("summary")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workAuthorization">Work authorization</Label>
              <Input id="workAuthorization" {...register("workAuthorization")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryExpectation">Salary expectation</Label>
              <Input id="salaryExpectation" {...register("salaryExpectation")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" {...register("availability")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="skillsText">Skills (comma separated)</Label>
              <Input id="skillsText" {...register("skillsText")} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" {...register("linkedin")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio</Label>
              <Input id="portfolio" {...register("portfolio")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input id="github" {...register("github")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100">Experience highlights</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => experienceFieldArray.append({ company: "", title: "", impact: "" })}
              >
                Add item
              </Button>
            </div>
            {experienceFieldArray.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-slate-800 p-4 md:grid-cols-3">
                <Input placeholder="Company" {...register(`experiences.${index}.company`)} />
                <Input placeholder="Title" {...register(`experiences.${index}.title`)} />
                <div className="flex gap-2">
                  <Input placeholder="Impact" {...register(`experiences.${index}.impact`)} />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => experienceFieldArray.remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100">Custom fields for complex forms</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => customFieldArray.append({ key: "", value: "" })}
              >
                Add field
              </Button>
            </div>
            {customFieldArray.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-lg border border-slate-800 p-4 md:grid-cols-2">
                <Input placeholder="Field label" {...register(`customFields.${index}.key`)} />
                <div className="flex gap-2">
                  <Input placeholder="Value" {...register(`customFields.${index}.value`)} />
                  <Button type="button" variant="ghost" onClick={() => customFieldArray.remove(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-100">Context-specific summaries</h4>
            <p className="text-xs text-slate-400">
              Provide alternate wording for each flow so auto-filled long-text fields match form intent.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Textarea placeholder="Job application summary" rows={3} {...register("jobSummary")} />
              <Textarea placeholder="Grant application summary" rows={3} {...register("grantSummary")} />
              <Textarea placeholder="Vendor onboarding summary" rows={3} {...register("vendorSummary")} />
              <Textarea placeholder="Conference submission summary" rows={3} {...register("conferenceSummary")} />
              <Textarea placeholder="Loan application summary" rows={3} {...register("loanSummary")} />
              <Textarea placeholder="Healthcare intake summary" rows={3} {...register("healthcareSummary")} />
              <div className="md:col-span-2">
                <Textarea placeholder="General fallback summary" rows={3} {...register("generalSummary")} />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save profile"}
            </Button>
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
