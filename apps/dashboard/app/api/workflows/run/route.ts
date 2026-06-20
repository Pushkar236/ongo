import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

/** Proxy a pipeline run to the Brain API using the founder's cookie token. */
export async function POST(req: Request) {
  let pipeline = "";
  try {
    pipeline = (await req.json())?.pipeline ?? "";
  } catch {
    /* empty body */
  }
  if (!pipeline) {
    return NextResponse.json({ error: "pipeline required" }, { status: 400 });
  }
  try {
    const result = await apiFetch("/workflows/run", {
      method: "POST",
      body: JSON.stringify({ pipeline }),
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: "run failed" }, { status });
  }
}
