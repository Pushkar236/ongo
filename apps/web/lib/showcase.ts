// Pulls the auto-synced, featured projects from the OnGo Brain so the public
// site shows REAL shipped work instead of static placeholders. Server-side
// only (no CORS concern). Degrades to [] on any error, so the Portfolio falls
// back to its built-in examples and the page never breaks if the API is asleep.

export type ShowcaseProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  tech: string[];
  stars: number;
  status: string;
  deploymentStatus: string;
};

// Defaults to the live backend so it works with zero configuration. Override
// with ONGO_API_URL in the environment if the Brain moves.
const API_BASE = (
  process.env.ONGO_API_URL || "https://ongo-brain.onrender.com/api/v1"
).replace(/\/+$/, "");

export async function getShowcaseProjects(): Promise<ShowcaseProject[]> {
  try {
    const res = await fetch(`${API_BASE}/projects/showcase`, {
      // Re-fetch hourly (ISR) so new repos appear without a redeploy.
      next: { revalidate: 3600 },
      // Don't hang the build if the free backend is cold-starting.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as ShowcaseProject[]) : [];
  } catch {
    return [];
  }
}
