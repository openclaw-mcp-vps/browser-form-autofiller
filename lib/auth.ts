import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ACCESS_COOKIE_NAME = "bfa_paid";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30
};

export async function hasPaidAccess() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE_NAME)?.value;
  return token === "1";
}

export async function requirePaidAccess(targetPath?: string) {
  const access = await hasPaidAccess();
  if (!access) {
    const destination = targetPath ? `/paywall?next=${encodeURIComponent(targetPath)}` : "/paywall";
    redirect(destination);
  }
}

export async function setPaidAccessCookie() {
  const store = await cookies();
  store.set(ACCESS_COOKIE_NAME, "1", cookieOptions);
}

export async function clearPaidAccessCookie() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE_NAME);
}
