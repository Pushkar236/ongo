import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { BrainService, DispatchOutcome } from "../brain/brain.service";
import { PIPELINES } from "./pipelines";

export interface WorkflowStepResult {
  agentType: string;
  actionType: string;
  title: string;
  status: DispatchOutcome["status"] | "error";
  level?: string;
  summary?: string;
  approvalId?: string;
  error?: string;
}

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly brain: BrainService,
  ) {}

  list() {
    return this.prisma.workflow.findMany({ orderBy: { createdAt: "desc" } });
  }

  catalog() {
    return Object.values(PIPELINES).map((p) => ({
      key: p.key,
      name: p.name,
      description: p.description,
      steps: p.steps.length,
    }));
  }

  /**
   * Run a predefined pipeline. Each step is dispatched through the Brain and
   * mapped to its source agent by type. A step that requires human approval
   * (e.g. deploy.production) returns `pending_approval` and the run pauses
   * there — the rest of the chain is reported but not forced through.
   */
  async run(pipelineKey: string) {
    const def = PIPELINES[pipelineKey];
    if (!def) throw new BadRequestException(`Unknown pipeline '${pipelineKey}'`);

    const agents = await this.prisma.agent.findMany();
    const byType = new Map(agents.map((a) => [a.type, a]));

    const results: WorkflowStepResult[] = [];
    let pausedForApproval = false;

    for (const step of def.steps) {
      const agent = byType.get(step.agentType);
      if (!agent) {
        results.push({
          agentType: step.agentType,
          actionType: step.actionType,
          title: step.title,
          status: "error",
          error: "no agent of this type",
        });
        continue;
      }
      try {
        const outcome = await this.brain.dispatch({
          agentId: agent.id,
          actionType: step.actionType,
          title: step.title,
          payload: step.payload ?? {},
        });
        results.push({
          agentType: step.agentType,
          actionType: step.actionType,
          title: step.title,
          status: outcome.status,
          level: outcome.level,
          summary:
            outcome.status === "executed" ? outcome.result.summary : outcome.message,
          approvalId:
            "approvalId" in outcome ? outcome.approvalId : undefined,
        });
        if (outcome.status === "pending_approval") {
          pausedForApproval = true;
          break; // stop the chain at the human gate
        }
      } catch (err) {
        results.push({
          agentType: step.agentType,
          actionType: step.actionType,
          title: step.title,
          status: "error",
          error: String(err),
        });
      }
    }

    const status = pausedForApproval ? "PAUSED" : "ACTIVE";
    const workflow = await this.prisma.workflow.create({
      data: {
        name: def.name,
        description: def.description,
        trigger: "manual",
        status: status === "PAUSED" ? "PAUSED" : "ACTIVE",
        steps: results as unknown as Prisma.InputJsonValue,
      },
    });

    return { workflow, pausedForApproval, steps: results };
  }
}
