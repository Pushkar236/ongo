import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: SessionUser;
  try {
    user = await apiFetch<SessionUser>("/auth/me");
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
