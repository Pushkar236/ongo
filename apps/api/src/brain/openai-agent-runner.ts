import { Logger } from "@nestjs/common";
import { AgentRunContext, AgentRunResult, AgentRunner } from "./agent-runner";
import { buildPrompts, extractJson } from "./agent-prompt";

/**
 * Real, LLM-backed agent execution against ANY OpenAI-compatible chat API.
 * This unlocks free providers — no Anthropic billing required:
 *   • Groq    base: https://api.groq.com/openai/v1            (free key, no card)
 *   • Gemini  base: https://generativelanguage.googleapis.com/v1beta/openai
 *   • OpenRouter / Together / Mistral / local Ollama …
 *
 * Configured via LLM_BASE_URL + LLM_API_KEY + LLM_MODEL. The Brain only knows
 * the AgentRunner interface, so this drops in exactly like the Anthropic one.
 */
export class OpenAiCompatibleAgentRunner extends AgentRunner {
  private readonly logger = new Logger(OpenAiCompatibleAgentRunner.name);
  private readonly endpoint: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    baseUrl: string,
    private readonly provider = "openai-compatible",
  ) {
    super();
    // Normalize: accept base URLs with or without a trailing slash.
    this.endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  }

  async run(ctx: AgentRunContext): Promise<AgentRunResult> {
    const { system, user } = buildPrompts(ctx);
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.7,
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`${res.status} ${body.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = (data.choices?.[0]?.message?.content ?? "").trim();
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
      this.logger.error(`${this.provider} runner failed: ${String(err)}`);
      // Degrade gracefully rather than failing the whole dispatch.
      return {
        summary: `${ctx.agent.name} attempted ${ctx.actionType} (LLM unavailable)`,
        output: { error: "llm_unavailable" },
      };
    }
  }
}
