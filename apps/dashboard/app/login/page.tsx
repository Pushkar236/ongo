"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hexagon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("founder@ongo.ai");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-x-bg p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Hexagon
            className="mx-auto mb-4 h-10 w-10 text-x-blue"
            fill="currentColor"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-x-text">
            Sign in to OnGo
          </h1>
          <p className="mt-1 text-sm text-x-muted">
            Your agentic OS — agents do the work.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-x-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-x-border bg-x-bg px-3 py-3 text-x-text outline-none focus:border-x-blue"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-x-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-x-border bg-x-bg px-3 py-3 text-x-text outline-none focus:border-x-blue"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-x-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-x-blue px-4 py-3 font-bold text-white transition hover:bg-x-blue-hover disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-x-muted">
          Seeded founder: founder@ongo.ai
        </p>
      </div>
    </main>
  );
}
