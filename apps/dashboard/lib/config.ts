// Server-side base URL for the OnGo Brain API. Override with API_URL in env.
export const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api/v1";

export const TOKEN_COOKIE = "ongo_token";
export const REFRESH_COOKIE = "ongo_refresh";
