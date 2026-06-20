import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

/** Proxy lead → opportunity conversion to the Brain API. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await apiFetch(`/leads/${id}/convert`, { method: "POST" });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: "convert failed" }, { status });
  }
}
