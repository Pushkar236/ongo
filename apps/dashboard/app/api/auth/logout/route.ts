import { NextResponse } from "next/server";
import { REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/config";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
