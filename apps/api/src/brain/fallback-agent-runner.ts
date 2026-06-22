import { Logger } from "@nestjs/common";
import { AgentRunContext, AgentRunResult, AgentRunner } from "./agent-runner";

/**
 * Pools several LLM providers behind one runner. Tries them in order and moves
 * on whenever a provider is unavailable (rate-limited / errored), so the engine
 * keeps doing real work by spreading load across multiple FREE providers
 * (Groq + Gemini + Cerebras + OpenRouter …). Their daily quotas effectively
 * stack, which is what makes faster cycles sustainable.
 */
export class FallbackAgentRunner extends AgentRunner {
  private readonly logger = new Logger(FallbackAgentRunner.name);

  constructor(
    private readonly runners: AgentRunner[],
    private readonly labels: string[] = [],
  ) {
    super();
  }

  /** Human-readable provider chain, e.g. "groq:llama-3.3 -> gemini:flash". */
  describe(): string {
    return this.labels.join(" -> ");
  }

  count(): number {
    return this.runners.length;
  }

  async run(ctx: AgentRunContext): Promise<AgentRunResult> {
    for (let i = 0; i < this.runners.length; i++) {
      const res = await this.runners[i].run(ctx);
      const failed =
        res.output &&
        (res.output as Record<string, unknown>).error === "llm_unavailable";
      if (!failed) return res;
      this.logger.warn(
        `provider ${this.labels[i] ?? i} unavailable for ${ctx.actionType}; falling through`,
      );
    }
    // Everyone is down — degrade gracefully (the action still logs).
    return {
      summary: `${ctx.agent.name} attempted ${ctx.actionType} (all LLM providers unavailable)`,
      output: { error: "llm_unavailable" },
    };
  }
}
