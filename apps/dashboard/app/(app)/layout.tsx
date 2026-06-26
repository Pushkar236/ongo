import { Suspense } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { SessionUser } from "@/lib/types";
import { LeftRail } from "@/components/x/LeftRail";
import { RightRail } from "@/components/x/RightRail";
import { MobileTabBar } from "@/components/x/MobileTabBar";

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
    <div className="mx-auto flex min-h-screen w-full max-w-[1290px] justify-center">
      <LeftRail user={user} />
      <main className="min-h-screen w-full max-w-[640px] border-x border-x-border pb-20 md:pb-0">
        {children}
      </main>
      <Suspense fallback={<div className="hidden w-[350px] shrink-0 xl:block" />}>
        <RightRail />
      </Suspense>
      <MobileTabBar />
    </div>
  );
}
