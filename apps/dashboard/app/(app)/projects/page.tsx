import { apiFetch } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";
import { inr } from "@/lib/format";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await apiFetch<Project[]>("/projects");

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Internal, client, and SaaS work — each with its agents, repo, and deployment state."
      />
      {projects.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">No projects yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">{p.name}</h3>
                  <div className="mt-1 text-xs text-slate-500">{p.type}</div>
                </div>
                <Badge>{p.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>
                  <span className="text-slate-500">Tasks:</span>{" "}
                  {p._count?.tasks ?? 0}
                </span>
                <span>
                  <span className="text-slate-500">Deploys:</span>{" "}
                  {p._count?.deployments ?? 0}
                </span>
                <span>
                  <span className="text-slate-500">Revenue:</span>{" "}
                  {inr(p.revenue)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge>{p.deploymentStatus}</Badge>
                {p.repoUrl && (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-cyan hover:underline"
                  >
                    Repository →
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
