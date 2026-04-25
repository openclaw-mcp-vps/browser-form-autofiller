import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://browser-form-autofiller.example.com"),
  title: "browser-form-autofiller | Smart form filling with context awareness",
  description:
    "Stop retyping the same form details. Build smart profiles, map complex fields, and auto-fill recurring applications with context-aware variations.",
  openGraph: {
    title: "browser-form-autofiller",
    description:
      "Smart form filling with context awareness for job, grant, vendor, and compliance workflows.",
    url: "https://browser-form-autofiller.example.com",
    siteName: "browser-form-autofiller",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "browser-form-autofiller dashboard preview"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "browser-form-autofiller",
    description:
      "Smart form filling with context awareness for repetitive professional workflows.",
    images: ["/og-image.svg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
