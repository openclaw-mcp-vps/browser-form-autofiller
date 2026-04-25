import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivateAccessForm } from "@/components/ActivateAccessForm";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export default function PaywallPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white">Unlock browser-form-autofiller</h1>
        <p className="mt-2 text-sm text-slate-300">
          Purchase monthly access, then activate your session to unlock the mapper and profile dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1) Complete checkout</CardTitle>
            <CardDescription>
              Hosted Stripe checkout for a fixed $12/month plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Open Stripe checkout
            </a>
            <p className="text-xs text-slate-400">
              Configure your Stripe Payment Link to redirect back to <code>/activate?session_id={"{CHECKOUT_SESSION_ID}"}</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2) Activate paid access</CardTitle>
            <CardDescription>
              Use your checkout session ID to set your secure access cookie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-slate-400">Loading activation form...</p>}>
              <ActivateAccessForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-slate-400">
        Already activated? <Link href="/tool" className="text-sky-300 underline">Open your mapper</Link>
      </div>
    </main>
  );
}
