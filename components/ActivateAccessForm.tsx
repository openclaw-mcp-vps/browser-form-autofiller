"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ActivateAccessForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState(params.get("session_id") ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.post("/api/activate", {
        sessionId,
        email: email || undefined
      });
      router.push("/tool");
      router.refresh();
    } catch (activateError) {
      if (axios.isAxiosError(activateError)) {
        setError(activateError.response?.data?.error ?? "Unable to activate access.");
      } else {
        setError("Unable to activate access.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="session-id">Checkout session ID</Label>
        <Input
          id="session-id"
          placeholder="cs_test_a1b2c3..."
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Checkout email (optional)</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !sessionId.trim()}>
        {isSubmitting ? "Activating..." : "Activate paid access"}
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
