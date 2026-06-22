import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.agent.findMany({ orderBy: { createdAt: "asc" } });
  }

  /**
   * Per-agent work analysis for the dashboard: how much each agent has done,
   * the breakdown by action type, and its most recent actions — built from the
   * immutable activity log so it reflects real work, not just config.
   */
  async analytics() {
    const [agents, grouped, recent, totals] = await Promise.all([
      this.prisma.agent.findMany({ orderBy: { createdAt: "asc" } }),
      this.prisma.activityLog.groupBy({
        by: ["actorId", "action"],
        where: { actorType: "AGENT", actorId: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.activityLog.findMany({
        where: { actorType: "AGENT", actorId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 300,
        select: { actorId: true, action: true, entity: true, createdAt: true },
      }),
      // What real artifacts exist, for a headline summary.
      Promise.all([
        this.prisma.opportunity.count(),
        this.prisma.project.count(),
        this.prisma.project.count({ where: { source: "incubated" } }),
        this.prisma.project.aggregate({
          where: { source: "incubated" },
          _sum: { devStep: true },
        }),
        this.prisma.activityLog.count({ where: { actorType: "AGENT" } }),
      ]),
    ]);

    const byAgent = new Map<
      string,
      { actions: Record<string, number>; total: number; recent: unknown[] }
    >();
    for (const g of grouped) {
      if (!g.actorId) continue;
      const e = byAgent.get(g.actorId) ?? { actions: {}, total: 0, recent: [] };
      e.actions[g.action] = g._count._all;
      e.total += g._count._all;
      byAgent.set(g.actorId, e);
    }
    for (const r of recent) {
      if (!r.actorId) continue;
      const e = byAgent.get(r.actorId);
      if (e && e.recent.length < 6) {
        e.recent.push({ action: r.action, entity: r.entity, createdAt: r.createdAt });
      }
    }

    const [oppCount, projCount, incubated, devSum, totalAgentActions] = totals;
    return {
      summary: {
        totalAgentActions,
        opportunities: oppCount,
        projects: projCount,
        incubatedRepos: incubated,
        devCommits: devSum._sum.devStep ?? 0,
      },
      agents: agents.map((a) => {
        const e = byAgent.get(a.id) ?? { actions: {}, total: 0, recent: [] };
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          role: a.role,
          status: a.status,
          description: a.description,
          lastActiveAt: a.lastActiveAt,
          totalActions: e.total,
          actionsByType: Object.entries(e.actions)
            .map(([action, count]) => ({ action, count }))
            .sort((x, y) => y.count - x.count),
          recentActions: e.recent,
        };
      }),
    };
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        tasks: { take: 10, orderBy: { updatedAt: "desc" } },
      },
    });
    if (!agent) throw new NotFoundException("Agent not found");
    return agent;
  }
}
