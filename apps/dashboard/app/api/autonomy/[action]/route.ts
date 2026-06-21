import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

const ALLOWED = new Set(["tick", "start", "stop"]);

/** Proxy autonomy-engine controls to the Brain API with the founder's token. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!ALLOWED.has(action)) {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
  try {
    const result = await apiFetch(`/autonomy/${action}`, { method: "POST" });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: `${action} failed` }, { status });
  }
}
