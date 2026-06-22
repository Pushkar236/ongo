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
  // The free backend (Render) can cold-start slowly. Try twice: the first
  // attempt wakes it if asleep, the second gets the data. Re-fetch every 15
  // min (ISR) so the live site self-heals and new repos appear without a
  // redeploy. Falls back to the built-in examples only if both attempts fail.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/projects/showcase`, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        if (Array.isArray(data) && data.length > 0) {
          return data as ShowcaseProject[];
        }
      }
    } catch {
      /* cold start / timeout — retry once */
    }
  }
  return [];
}
