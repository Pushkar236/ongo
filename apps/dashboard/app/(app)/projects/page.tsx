import { apiFetch } from "@/lib/api";
import { Badge, Card } from "@/components/ui";
import { inr } from "@/lib/format";
import type { Project } from "@/lib/types";
import { ColumnHeader } from "@/components/x/ColumnHeader";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await apiFetch<Project[]>("/projects");

  return (
    <>
      <ColumnHeader
        title="Projects"
        subtitle="Internal, client, and SaaS work"
      />

      {projects.length === 0 ? (
        <p className="p-8 text-center text-sm text-x-muted">No projects yet.</p>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-x-text">{p.name}</h3>
                  <div className="mt-0.5 text-xs text-x-muted">{p.type}</div>
                </div>
                <Badge>{p.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-x-text">
                <span>
                  <span className="text-x-muted">Tasks</span>{" "}
                  {p._count?.tasks ?? 0}
                </span>
                <span>
                  <span className="text-x-muted">Deploys</span>{" "}
                  {p._count?.deployments ?? 0}
                </span>
                <span>
                  <span className="text-x-muted">Revenue</span> {inr(p.revenue)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Badge>{p.deploymentStatus}</Badge>
                {p.repoUrl && (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-x-blue hover:underline"
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
