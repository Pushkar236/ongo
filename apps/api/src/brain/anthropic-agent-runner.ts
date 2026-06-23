import { Logger } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { AgentRunContext, AgentRunResult, AgentRunner } from "./agent-runner";
import { buildPrompts, extractJson } from "./agent-prompt";

/**
 * Real, LLM-backed agent execution via the Anthropic API. Used by the Brain when
 * a real ANTHROPIC_API_KEY (sk-ant-api…) is configured. For free providers, see
 * OpenAiCompatibleAgentRunner.
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
    const { system, user } = buildPrompts(ctx);
    try {
      const res = await this.client.messages.create({
        model: this.model,
        // Room for complete code files + the JSON wrapper (matches the
        // OpenAI-compatible runner); 1k truncates real code generation.
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = res.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
      const parsed = extractJson(text);
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
}
