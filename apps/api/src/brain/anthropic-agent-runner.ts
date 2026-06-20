import { Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { AgentRunContext, AgentRunResult, AgentRunner } from "./agent-runner";

// Per-agent-type persona. The Brain stays unaware of any of this — it only
// depends on the AgentRunner interface, so swapping mock ↔ real is one line.
const PERSONA: Record<string, string> = {
  RESEARCH:
    "a market research analyst. You identify concrete business opportunities, " +
    "estimate demand and revenue, and assess competition.",
  PRODUCT_MANAGER:
    "a product manager. You turn goals into crisp PRDs, roadmaps, and task breakdowns.",
  ARCHITECT:
    "a software architect. You make technology decisions and flag security/scaling risks.",
  DEVELOPER:
    "a senior software engineer. You produce concrete implementation plans and code changes.",
  QA: "a QA engineer. You design test plans and report pass/fail with specifics.",
  DEVOPS:
    "a DevOps engineer. You handle deployments and report environment/status precisely.",
  DOCUMENTATION:
    "a technical writer. You produce clear docs, changelogs, and status updates.",
};

/**
 * Real, LLM-backed agent execution via the Anthropic API. Used by the Brain when
 * ANTHROPIC_API_KEY is configured; otherwise the MockAgentRunner is used.
 */
export class AnthropicAgentRunner extends AgentRunner {
  private readonly logger = new Logger(AnthropicAgentRunner.name);
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async run(ctx: AgentRunContext): Promise<AgentRunResult> {
    const persona = PERSONA[ctx.agent.type] ?? "an autonomous agent.";
    const system =
      `You are ${ctx.agent.name}, ${persona} You work for OnGo, an AI-run software agency. ` +
      `Perform the requested action and return a tight, realistic result. Be concrete and concise.`;

    const user =
      `Action type: ${ctx.actionType}\n` +
      `Input payload (JSON): ${JSON.stringify(ctx.payload)}\n\n` +
      `Respond with ONLY minified JSON, no prose, in the shape: ` +
      `{"summary": "<one sentence>", "output": { ...structured fields relevant to the action... }}. ` +
      `For research/opportunity actions include output fields: opportunity, market, demandScore (0-100), ` +
      `estRevenue (number, INR), competition ("LOW"|"MEDIUM"|"HIGH"), recommendation.`;

    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = res.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      const parsed = this.extractJson(text);
      return {
        summary:
          typeof parsed.summary === "string"
            ? parsed.summary
            : `${ctx.agent.name} completed ${ctx.actionType}`,
        output:
          parsed.output && typeof parsed.output === "object"
            ? (parsed.output as Record<string, unknown>)
            : {},
      };
    } catch (err) {
      this.logger.error(`Anthropic runner failed: ${String(err)}`);
      // Degrade gracefully rather than failing the whole dispatch.
      return {
        summary: `${ctx.agent.name} attempted ${ctx.actionType} (LLM unavailable)`,
        output: { error: "llm_unavailable" },
      };
    }
  }

  /** Tolerant JSON extraction — models occasionally wrap JSON in prose/fences. */
  private extractJson(text: string): Record<string, unknown> {
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end > start) {
        try {
          return JSON.parse(text.slice(start, end + 1)) as Record<
            string,
            unknown
          >;
        } catch {
          /* fall through */
        }
      }
      return {};
    }
  }
}
