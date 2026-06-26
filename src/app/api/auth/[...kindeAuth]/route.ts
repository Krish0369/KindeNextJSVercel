import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const kindeHandler = handleAuth();

// Cookie name fragments that Kinde uses for session + auth-flow state. Anything
// matching these is safe to drop when we need to recover from a broken session.
const KINDE_COOKIE_PATTERNS = [
  "token",
  "kinde",
  "state",
  "nonce",
  "verifier",
  "post_login",
  "user",
];

function isKindeCookie(name: string): boolean {
  const lower = name.toLowerCase();
  return KINDE_COOKIE_PATTERNS.some((fragment) => lower.includes(fragment));
}

/**
 * Wraps Kinde's auth handler so a failed callback (e.g. corrupt/oversized or
 * stale-environment session cookies) doesn't trigger an infinite
 * login -> callback -> login redirect loop (ERR_TOO_MANY_REDIRECTS).
 *
 * On failure we expire the Kinde cookies and send the user back to "/" so they
 * land on a clean, logged-out page and can sign in again from scratch.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kindeAuth: string[] }> }
) {
  try {
    return await kindeHandler(request, context);
  } catch (error) {
    console.error("[kinde-auth] handler failed, clearing session", error);

    const homeUrl = new URL("/?auth_error=1", request.url);
    const response = NextResponse.redirect(homeUrl);

    for (const cookie of request.cookies.getAll()) {
      if (isKindeCookie(cookie.name)) {
        response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }

    return response;
  }
}
