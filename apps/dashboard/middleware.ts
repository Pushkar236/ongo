import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./lib/config";

// Gate the whole app behind auth, except the login page and auth endpoints.
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Note: we intentionally do NOT bounce a token-bearing request away from
  // /login. The token here is unverified (middleware can't check the JWT
  // signature/expiry), so bouncing would loop with the layout's /auth/me
  // check whenever the token is present but expired. /login is always reachable.
  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
