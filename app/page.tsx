import Link from "next/link";
import { hasPaidAccess } from "@/lib/auth";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

const faqs = [
  {
    question: "How is this different from normal autofill?",
    answer:
      "Standard autofill maps exact field names. browser-form-autofiller classifies form intent first, then chooses profile variations and custom fields that match that context."
  },
  {
    question: "Can I keep multiple versions of my details?",
    answer:
      "Yes. You can save multiple reusable profiles and maintain context-specific summaries for job applications, grant forms, vendor onboarding, and more."
  },
  {
    question: "What powers the context awareness?",
    answer:
      "The app runs deterministic context scoring by default and can optionally enhance classification using OpenAI when an API key is configured."
  },
  {
    question: "How do I unlock access after checkout?",
    answer:
      "Set your Stripe Payment Link to redirect back with `session_id`, then use the Activate Access form. The app issues a secure cookie after verifying the checkout session from webhook data."
  }
];

export default async function LandingPage() {
  const paidAccess = await hasPaidAccess();

  return (
    <main>
      <header className="border-b border-slate-800 bg-[#0d1117]/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-sky-300">browser-form-autofiller</p>
            <p className="text-xs text-slate-400">Smart form filling with context awareness</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="text-slate-300 hover:text-white" href="#problem">
              Problem
            </Link>
            <Link className="text-slate-300 hover:text-white" href="#solution">
              Solution
            </Link>
            <Link className="text-slate-300 hover:text-white" href="#pricing">
              Pricing
            </Link>
            <Link className="rounded-md bg-sky-500 px-3 py-2 font-medium text-slate-950" href={paidAccess ? "/tool" : "/paywall"}>
              {paidAccess ? "Open app" : "Start now"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-24">
        <div className="max-w-2xl space-y-6">
          <p className="inline-flex rounded-full border border-sky-700 bg-sky-950 px-3 py-1 text-xs font-medium text-sky-300">
            Built for professionals applying to jobs, grants, and recurring forms
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Fill repetitive forms in minutes, not hours.
          </h1>
          <p className="text-lg leading-relaxed text-slate-300">
            browser-form-autofiller detects form context, selects the best profile variation, and maps complex
            fields automatically. You keep control with editable profiles, custom fields, and transparent mappings.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Buy for $12/mo
            </a>
            <Link
              href={paidAccess ? "/tool" : "/activate"}
              className="rounded-md border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              {paidAccess ? "Open your mapper" : "Activate purchased access"}
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Stripe hosted checkout. No embedded iframes, no custom payment UI, and activation is cookie-based after purchase.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-[#101826]/90 p-6 shadow-2xl shadow-sky-950/30">
          <h2 className="text-lg font-semibold text-slate-100">Live value preview</h2>
          <p className="mt-2 text-sm text-slate-300">
            Context map for a "Senior Product Ops" application:
          </p>
          <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs text-slate-300">
            <p>
              <span className="text-sky-300">context</span>: job_application (92% confidence)
            </p>
            <p>
              <span className="text-sky-300">summary</span>: automation-focused product professional with measurable
              hiring workflow wins
            </p>
            <p>
              <span className="text-sky-300">skills</span>: process design, data hygiene, interview operations
            </p>
            <p>
              <span className="text-sky-300">custom.federal_uei</span>: L6G9N1X4D2Q8
            </p>
          </div>
        </div>
      </section>

      <section id="problem" className="border-y border-slate-800 bg-[#0f1520]/70">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">Time lost to repetition</h3>
            <p className="mt-2 text-sm text-slate-300">
              Job seekers, consultants, and founders repeatedly rewrite the same background details across similar forms.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">Context mismatch</h3>
            <p className="mt-2 text-sm text-slate-300">
              Traditional autofill inserts the wrong tone or data because it does not distinguish hiring from grants or vendor onboarding.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">Complex fields break flows</h3>
            <p className="mt-2 text-sm text-slate-300">
              Multi-part questions, narrative fields, and compliance identifiers are left manual, creating mistakes and rework.
            </p>
          </article>
        </div>
      </section>

      <section id="solution" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white">A workflow built for high-frequency form work</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-[#101826]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Step 1</p>
            <h3 className="mt-2 font-semibold text-slate-100">Build reusable profiles</h3>
            <p className="mt-2 text-sm text-slate-300">
              Store personal details, links, experience highlights, and custom fields once.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-[#101826]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Step 2</p>
            <h3 className="mt-2 font-semibold text-slate-100">Classify form context</h3>
            <p className="mt-2 text-sm text-slate-300">
              The mapper scores page text and field labels to detect intent before filling.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-[#101826]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Step 3</p>
            <h3 className="mt-2 font-semibold text-slate-100">Apply context variations</h3>
            <p className="mt-2 text-sm text-slate-300">
              Use alternate summaries and values that fit job, grant, vendor, or finance forms.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-[#101826]/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Step 4</p>
            <h3 className="mt-2 font-semibold text-slate-100">Autofill in the browser</h3>
            <p className="mt-2 text-sm text-slate-300">
              Use the included extension and sync endpoint to fill matching fields quickly.
            </p>
          </article>
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-800 bg-[#101826]/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-950/70 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">Simple pricing</p>
            <h2 className="mt-2 text-4xl font-bold text-white">$12/month</h2>
            <p className="mt-3 text-slate-300">
              Unlimited profiles, unlimited context mapping, extension support, and API sync for consistent autofill workflows.
            </p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-md bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Buy monthly access
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white">FAQ</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <h3 className="font-semibold text-slate-100">{faq.question}</h3>
              <p className="mt-2 text-sm text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
