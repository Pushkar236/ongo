import { Injectable } from "@nestjs/common";
import { ApprovalStatus } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      activeProjects,
      activeAgents,
      openTasks,
      pendingApprovals,
      deploymentsToday,
      revenueAgg,
      newOpportunities,
      newLeads,
    ] = await this.prisma.$transaction([
      this.prisma.project.count({ where: { status: "ACTIVE" } }),
      this.prisma.agent.count({ where: { status: { not: "OFFLINE" } } }),
      this.prisma.task.count({
        where: { status: { in: ["PENDING", "IN_PROGRESS", "IN_REVIEW"] } },
      }),
      this.prisma.approval.count({
        where: { status: ApprovalStatus.PENDING },
      }),
      this.prisma.deployment.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.revenue.aggregate({ _sum: { amount: true } }),
      this.prisma.opportunity.count({ where: { status: "NEW" } }),
      this.prisma.lead.count({ where: { status: "NEW" } }),
    ]);

    return {
      activeProjects,
      activeAgents,
      openTasks,
      pendingApprovals,
      deploymentsToday,
      newOpportunities,
      newLeads,
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    };
  }
}
