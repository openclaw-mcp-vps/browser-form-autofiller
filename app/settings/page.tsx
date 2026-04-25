import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePaidAccess } from "@/lib/auth";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export default async function SettingsPage() {
  await requirePaidAccess("/settings");

  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Billing configuration</CardTitle>
            <CardDescription>
              Your buy button always points directly to Stripe Payment Link from `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>Current checkout link:</p>
            <p className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200">
              {paymentLink || "Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK in .env.local"}
            </p>
            <a href={paymentLink} target="_blank" rel="noreferrer" className="text-sky-300 underline">
              Open hosted checkout
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe webhook</CardTitle>
            <CardDescription>Enable activation by recording `checkout.session.completed` events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>Webhook endpoint:</p>
            <p className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
              /api/stripe/webhook
            </p>
            <p>Required env var: `STRIPE_WEBHOOK_SECRET`.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extension sync</CardTitle>
            <CardDescription>
              The browser extension can consume profile mappings through direct profile export or the sync API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>`GET /api/sync` returns current profiles.</p>
            <p>`POST /api/sync` accepts form text + URL and returns context + mapped field values.</p>
            <p>
              Extension files live under <code>extension/</code>. See <Link href="/tool" className="text-sky-300 underline">Mapper</Link> to generate mappings.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
