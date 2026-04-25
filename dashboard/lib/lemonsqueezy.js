export function getCheckoutLink() {
  return process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "";
}

export function billingProviderSummary() {
  return {
    provider: "Stripe Payment Link",
    note:
      "Legacy LemonSqueezy integration was replaced with direct Stripe hosted checkout for simpler activation and clearer paywall handling."
  };
}
