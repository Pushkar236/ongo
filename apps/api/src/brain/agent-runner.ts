import { Injectable } from "@nestjs/common";
import { Agent } from "@ongo/db";

export interface AgentRunContext {
  agent: Agent;
  actionType: string;
  payload: Record<string, unknown>;
}

export interface AgentRunResult {
  summary: string;
  output: Record<string, unknown>;
}

/**
 * Contract for executing an agent's work. The mock implementation below
 * simulates output; in a later phase this is swapped for an LLM-backed runner
 * (Anthropic API) without changing the Brain that depends on this interface.
 */
export abstract class AgentRunner {
  abstract run(ctx: AgentRunContext): Promise<AgentRunResult>;
}

@Injectable()
export class MockAgentRunner extends AgentRunner {
  async run(ctx: AgentRunContext): Promise<AgentRunResult> {
    const { actionType, agent, payload } = ctx;

    // Simulated, deterministic outputs per action family so the dashboard and
    // approval flow have something realistic to display.
    switch (actionType) {
      case "research.scan":
      case "opportunity.create":
        return {
          summary: `${agent.name} surfaced a market opportunity`,
          output: {
            opportunity: payload.title ?? "Untitled opportunity",
            demandScore: payload.demandScore ?? 72,
          },
        };
      case "prd.generate":
        return {
          summary: `${agent.name} drafted a product spec`,
          output: { sections: ["Overview", "Scope", "Milestones"], tasks: 8 },
        };
      case "code.generate":
      case "pr.create":
        return {
          summary: `${agent.name} produced a code change`,
          output: { filesChanged: 6, prUrl: "https://github.com/example/pr/123" },
        };
      case "test.run":
        return {
          summary: `${agent.name} ran the test suite`,
          output: { passed: 142, failed: 0, durationMs: 18400 },
        };
      case "deploy.feature":
      case "deploy.production":
        return {
          summary: `${agent.name} executed a deployment`,
          output: { environment: payload.environment ?? "production", status: "LIVE" },
        };
      case "docs.generate":
      case "changelog.update":
        return {
          summary: `${agent.name} updated documentation`,
          output: { pages: 3 },
        };
      default:
        return {
          summary: `${agent.name} completed ${actionType}`,
          output: { actionType, ...payload },
        };
    }
  }
}
