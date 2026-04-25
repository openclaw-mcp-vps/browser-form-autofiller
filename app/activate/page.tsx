import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivateAccessForm } from "@/components/ActivateAccessForm";

export default function ActivatePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Activate your purchase</CardTitle>
          <CardDescription>
            Paste the Stripe checkout session ID to unlock the tool. This sets your paid-access cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Suspense fallback={<p className="text-sm text-slate-400">Loading activation form...</p>}>
            <ActivateAccessForm />
          </Suspense>
          <p className="text-xs text-slate-400">
            Need to purchase first? <Link href="/paywall" className="text-sky-300 underline">Go to paywall</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
