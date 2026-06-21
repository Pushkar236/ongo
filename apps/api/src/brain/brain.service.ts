import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  ActorType,
  Approval,
  ApprovalLevel,
  ApprovalStatus,
  Agent,
  CompetitionLevel,
  Prisma,
  Role,
} from "@ongo/db";
import { AgentRunResult } from "./agent-runner";
import { PrismaService } from "../prisma/prisma.service";
import { AgentRunner } from "./agent-runner";
import { classifyAction } from "./approval-policy";
import { DispatchActionDto } from "./dto/dispatch-action.dto";

export type DispatchOutcome =
  | {
      status: "executed";
      level: ApprovalLevel;
      result: { summary: string; output: Record<string, unknown> };
      approvalId?: string;
    }
  | {
      status: "pending_approval";
      level: ApprovalLevel;
      approvalId: string;
      message: string;
    };

/**
 * OnGo Brain — the single gateway for all agent work.
 *
 * No agent executes anything directly. An agent emits an action request here;
 * the Brain verifies permission, classifies the approval level, then either
 * executes (AUTO / SUGGESTED) or blocks pending human approval (MANDATORY).
 * Every branch writes an immutable activity_log entry.
 */
@Injectable()
export class BrainService {
  private readonly logger = new Logger(BrainService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: AgentRunner,
  ) {}

  /**
   * Which agent runner is active — "AnthropicAgentRunner" when a real
   * sk-ant-api key is set, "MockAgentRunner" otherwise. Lets us confirm
   * live-vs-mock without exposing the key.
   */
  runnerKind(): string {
    return this.runner.constructor.name;
  }

  async dispatch(dto: DispatchActionDto): Promise<DispatchOutcome> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: dto.agentId },
    });
    if (!agent) throw new NotFoundException("Agent not found");

    // Deny-by-default: the agent must be explicitly granted this action type.
    if (!agent.permissions.includes(dto.actionType)) {
      await this.log(
        agent.id,
        `${agent.name}`,
        "permission.denied",
        "Agent",
        agent.id,
        { actionType: dto.actionType },
      );
      throw new ForbiddenException(
        `Agent '${agent.name}' is not permitted to perform '${dto.actionType}'`,
      );
    }

    const policy = classifyAction(dto.actionType);
    const payload = dto.payload ?? {};
    const title = dto.title ?? `${agent.name}: ${dto.actionType}`;

    await this.prisma.agent.update({
      where: { id: agent.id },
      data: { status: "WORKING", lastActiveAt: new Date() },
    });

    // ── L3 MANDATORY: block and create a pending approval ───────────────
    if (policy.level === ApprovalLevel.MANDATORY) {
      const approval = await this.prisma.approval.create({
        data: {
          actionType: dto.actionType,
          title,
          level: policy.level,
          riskLevel: policy.riskLevel,
          status: ApprovalStatus.PENDING,
          requestedByAgentId: agent.id,
          payload: payload as Prisma.InputJsonValue,
          impactAnalysis: this.impactFor(dto.actionType),
        },
      });
      await this.notifyFounders(title, approval.id);
      await this.log(agent.id, agent.name, "approval.request", "Approval", approval.id, {
        actionType: dto.actionType,
        level: policy.level,
      });
      await this.prisma.agent.update({
        where: { id: agent.id },
        data: { status: "IDLE" },
      });
      return {
        status: "pending_approval",
        level: policy.level,
        approvalId: approval.id,
        message: "Action requires human approval and was not executed.",
      };
    }

    // ── L1 AUTO / L2 SUGGESTED: execute now ─────────────────────────────
    const result = await this.runner.run({
      agent,
      actionType: dto.actionType,
      payload,
    });
    await this.materialize(agent, dto.actionType, result, payload);

    let approvalId: string | undefined;
    if (policy.level === ApprovalLevel.SUGGESTED) {
      // Executed, but recorded + surfaced for after-the-fact review.
      const approval = await this.prisma.approval.create({
        data: {
          actionType: dto.actionType,
          title,
          level: policy.level,
          riskLevel: policy.riskLevel,
          status: ApprovalStatus.AUTO_APPROVED,
          requestedByAgentId: agent.id,
          payload: { ...payload, result } as unknown as Prisma.InputJsonValue,
          impactAnalysis: this.impactFor(dto.actionType),
        },
      });
      approvalId = approval.id;
    }

    await this.log(agent.id, agent.name, dto.actionType, "Agent", agent.id, {
      level: policy.level,
      summary: result.summary,
    });
    await this.prisma.agent.update({
      where: { id: agent.id },
      data: { status: "IDLE" },
    });

    return { status: "executed", level: policy.level, result, approvalId };
  }

  /**
   * Called by ApprovalsService when a human approves a MANDATORY action.
   * Executes the originally-blocked work and records the result.
   */
  async executeApproved(approval: Approval) {
    const agent = approval.requestedByAgentId
      ? await this.prisma.agent.findUnique({
          where: { id: approval.requestedByAgentId },
        })
      : null;

    if (!agent) {
      await this.log(null, "OnGo Brain", "approval.execute.skipped", "Approval", approval.id, {
        reason: "no source agent",
      });
      return { summary: "Approved (no agent to execute)", output: {} };
    }

    const payload = (approval.payload ?? {}) as Record<string, unknown>;
    const result = await this.runner.run({
      agent,
      actionType: approval.actionType,
      payload,
    });
    await this.materialize(agent, approval.actionType, result, payload);
    await this.log(agent.id, agent.name, approval.actionType, "Approval", approval.id, {
      level: approval.level,
      summary: result.summary,
      approved: true,
    });
    return result;
  }

  /**
   * Turn an executed agent action into real records so the platform visibly
   * "does work": research surfaces opportunities, PMs create tasks, DevOps
   * records deployments. Best-effort — a failure here never fails the action.
   */
  private async materialize(
    agent: Agent,
    actionType: string,
    result: AgentRunResult,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const out = result.output ?? {};
    const str = (v: unknown, fallback = "") =>
      typeof v === "string" && v.trim() ? v.trim() : fallback;
    const num = (v: unknown, fallback = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    };

    try {
      if (actionType === "opportunity.create" || actionType === "research.scan") {
        const comp = str(out.competition, "MEDIUM").toUpperCase();
        await this.prisma.opportunity.create({
          data: {
            title: str(out.opportunity ?? out.title, "New opportunity"),
            market: str(out.market, "General"),
            description: str(out.description, result.summary),
            demandScore: Math.max(0, Math.min(100, Math.round(num(out.demandScore, 60)))),
            estRevenue: num(out.estRevenue, 0),
            competition: (["LOW", "MEDIUM", "HIGH"].includes(comp)
              ? comp
              : "MEDIUM") as CompetitionLevel,
            recommendation: str(out.recommendation) || null,
            sourceAgentId: agent.id,
          },
        });
      } else if (actionType === "task.create") {
        await this.prisma.task.create({
          data: {
            title: str(out.title, result.summary),
            description: str(out.description) || null,
            assignedAgentId: agent.id,
            projectId: str(payload.projectId) || null,
          } as Prisma.TaskUncheckedCreateInput,
        });
      } else if (
        actionType === "deploy.feature" ||
        actionType === "deploy.production"
      ) {
        const projectId = str(payload.projectId);
        if (projectId) {
          await this.prisma.deployment.create({
            data: {
              projectId,
              environment: str(
                payload.environment,
                actionType === "deploy.production" ? "production" : "preview",
              ),
              status: "LIVE",
              url: str(out.url) || null,
              commitSha: str(payload.commitSha) || null,
              deployedAt: new Date(),
            },
          });
          await this.prisma.project
            .update({ where: { id: projectId }, data: { deploymentStatus: "LIVE" } })
            .catch(() => undefined);
        }
      }
    } catch (err) {
      this.logger.warn(`materialize(${actionType}) failed: ${String(err)}`);
    }
  }

  private impactFor(actionType: string): string {
    const map: Record<string, string> = {
      "deploy.production":
        "Promotes a build to the live environment; affects all users.",
      "infra.purchase": "Commits real spend on infrastructure.",
      "finance.charge": "Moves money. Financial and reputational risk.",
      "db.production.change":
        "Mutates production data; potential for data loss.",
      "client.communicate":
        "Sends an outward-facing message on behalf of OnGo.",
    };
    return map[actionType] ?? "Action queued for review.";
  }

  private async notifyFounders(title: string, approvalId: string) {
    const founders = await this.prisma.user.findMany({
      where: { role: { in: [Role.FOUNDER, Role.ADMIN] }, status: "ACTIVE" },
      select: { id: true },
    });
    if (founders.length === 0) return;
    await this.prisma.notification.createMany({
      data: founders.map((f) => ({
        userId: f.id,
        type: "approval",
        title: "Approval required",
        body: title,
        link: `/approvals/${approvalId}`,
      })),
    });
  }

  private async log(
    actorId: string | null,
    actorName: string,
    action: string,
    entity?: string,
    entityId?: string,
    metadata: Record<string, unknown> = {},
  ) {
    try {
      await this.prisma.activityLog.create({
        data: {
          actorType: ActorType.AGENT,
          actorId,
          actorName,
          action,
          entity,
          entityId,
          metadata: metadata as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn(`activity log failed: ${String(err)}`);
    }
  }
}
