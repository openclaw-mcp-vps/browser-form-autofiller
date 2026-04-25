export const dashboardSettingsGuide = {
  stripe: {
    paymentLinkEnv: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK",
    webhookPath: "/api/stripe/webhook",
    activationPath: "/activate"
  },
  extension: {
    manifestPath: "extension/manifest.json",
    popupPath: "extension/popup.html",
    contentScriptPath: "extension/content-script.js"
  },
  notes: [
    "Set Stripe Payment Link redirect to /activate?session_id={CHECKOUT_SESSION_ID}",
    "Ensure webhook sends checkout.session.completed to persist activations",
    "Use /api/sync for profile payloads from external automation workflows"
  ]
};
