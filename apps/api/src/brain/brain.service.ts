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
  Prisma,
  Role,
} from "@ongo/db";
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
    await this.log(agent.id, agent.name, approval.actionType, "Approval", approval.id, {
      level: approval.level,
      summary: result.summary,
      approved: true,
    });
    return result;
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
