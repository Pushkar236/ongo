import { NextResponse } from "next/server";
import { API_URL, REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/config";

/** Proxies login to the Brain API and stores tokens in httpOnly cookies. */
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const data = await res.json();
  const response = NextResponse.json({ user: data.user });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    // Align the cookie lifetime with the access-token TTL (~15m). If it outlived
    // the JWT, a present-but-expired token would loop between the auth-gated
    // layout and the middleware. (Refresh-token rotation is a Phase-4 item.)
    maxAge: 60 * 15,
  });
  response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
