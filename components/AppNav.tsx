"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tool", label: "Mapper" },
  { href: "/profiles", label: "Profiles" },
  { href: "/settings", label: "Settings" }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-wide text-slate-100">
          browser-form-autofiller
        </Link>
        <nav className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/paywall">Billing</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
