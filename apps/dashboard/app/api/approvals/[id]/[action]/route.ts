import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

/** Proxy approve/reject to the Brain API using the founder's cookie token. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const { id, action } = await params;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  let note = "";
  try {
    const body = await req.json();
    note = body?.note ?? "";
  } catch {
    // no body is fine
  }

  try {
    const result = await apiFetch(`/approvals/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ error: "Action failed" }, { status });
  }
}
