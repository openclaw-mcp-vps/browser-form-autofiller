"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AutofillProfile, ContextAnalysisResult } from "@/lib/types";

interface FieldMapperProps {
  profile: AutofillProfile | null;
}

interface ContextResponse {
  context: ContextAnalysisResult;
  fieldMap: Record<string, string>;
}

export function FieldMapper({ profile }: FieldMapperProps) {
  const [formText, setFormText] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [contextResult, setContextResult] = useState<ContextAnalysisResult | null>(null);
  const [fieldMap, setFieldMap] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedMapEntries = useMemo(
    () => Object.entries(fieldMap).sort(([a], [b]) => a.localeCompare(b)),
    [fieldMap]
  );

  async function runAnalysis() {
    if (!profile) {
      setError("Select or create a profile first.");
      return;
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await axios.post<ContextResponse>("/api/context", {
        formText,
        pageUrl,
        profile
      });
      setContextResult(response.data.context);
      setFieldMap(response.data.fieldMap);
    } catch (analysisError) {
      if (axios.isAxiosError(analysisError)) {
        setError(analysisError.response?.data?.error ?? "Context analysis failed.");
      } else {
        setError("Context analysis failed.");
      }
    } finally {
      setIsRunning(false);
    }
  }

  function copyJson() {
    if (!sortedMapEntries.length) {
      return;
    }
    void navigator.clipboard.writeText(JSON.stringify(Object.fromEntries(sortedMapEntries), null, 2));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Context detection</CardTitle>
          <CardDescription>
            Paste field labels, helper text, and page context from a form to generate the best profile variation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-url">Page URL (optional)</Label>
            <Input
              id="page-url"
              placeholder="https://jobs.company.com/apply"
              value={pageUrl}
              onChange={(event) => setPageUrl(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-text">Form labels and instructions</Label>
            <Textarea
              id="form-text"
              rows={10}
              placeholder="Example: Upload resume, cover letter, desired salary, available start date..."
              value={formText}
              onChange={(event) => setFormText(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={runAnalysis} disabled={isRunning}>
              {isRunning ? "Analyzing..." : "Analyze and map fields"}
            </Button>
            <Button variant="outline" onClick={copyJson} disabled={!sortedMapEntries.length}>
              Copy JSON map
            </Button>
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated field map</CardTitle>
          <CardDescription>
            Use this mapping for extension autofill, API sync, or direct import into your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contextResult ? (
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center gap-2">
                <Badge>{contextResult.contextType.replaceAll("_", " ")}</Badge>
                <Badge variant="secondary">{Math.round(contextResult.confidence * 100)}% confidence</Badge>
              </div>
              <ul className="list-disc space-y-1 pl-6 text-sm text-slate-300">
                {contextResult.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Run analysis to generate a field map.</p>
          )}

          <div className="max-h-[28rem] overflow-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900 text-slate-300">
                <tr>
                  <th className="px-3 py-2 font-medium">Field key</th>
                  <th className="px-3 py-2 font-medium">Mapped value</th>
                </tr>
              </thead>
              <tbody>
                {sortedMapEntries.map(([key, value]) => (
                  <tr key={key} className="border-t border-slate-800 align-top">
                    <td className="px-3 py-2 font-mono text-xs text-sky-300">{key}</td>
                    <td className="px-3 py-2 text-slate-200">{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
