import { Logger } from "@nestjs/common";
import { AgentRunner, MockAgentRunner } from "./agent-runner";
import { AnthropicAgentRunner } from "./anthropic-agent-runner";
import { OpenAiCompatibleAgentRunner } from "./openai-agent-runner";
import { FallbackAgentRunner } from "./fallback-agent-runner";

/**
 * Build the agent runner (single provider or a fallback chain) from a config
 * source. `get(key)` may read from the DB (runtime overrides) and/or env, so
 * the LLM provider can be changed live without redeploying or editing host env.
 *
 * Order: real Anthropic key first, then LLM_* (primary), LLM_*_2/_3/_4. Each
 * OpenAI-compatible provider needs API_KEY + BASE_URL + MODEL.
 */
export function buildAgentRunner(
  get: (key: string) => string | undefined,
): AgentRunner {
  const v = (k: string) => get(k)?.trim() || undefined;
  const apiKey = v("ANTHROPIC_API_KEY");
  const model = v("AGENT_MODEL") || "claude-opus-4-8";

  const runners: AgentRunner[] = [];
  const labels: string[] = [];

  if (apiKey && apiKey.startsWith("sk-ant-api")) {
    runners.push(new AnthropicAgentRunner(apiKey, model));
    labels.push(`anthropic:${model}`);
  }

  for (const sfx of ["", "_2", "_3", "_4"]) {
    const key = v(`LLM_API_KEY${sfx}`);
    const base = v(`LLM_BASE_URL${sfx}`);
    const mdl = v(`LLM_MODEL${sfx}`);
    const provider = v(`LLM_PROVIDER${sfx}`) || "openai-compatible";
    if (key && base && mdl) {
      runners.push(new OpenAiCompatibleAgentRunner(key, mdl, base, provider));
      labels.push(`${provider}:${mdl}`);
    }
  }

  if (runners.length === 0) {
    if (apiKey && apiKey.startsWith("sk-ant-oat")) {
      Logger.warn(
        "Agents: ignoring ANTHROPIC_API_KEY (sk-ant-oat… is a subscription " +
          "token, not API access). Using mock.",
        "BrainRunner",
      );
    } else {
      Logger.log("Agents: mock runner (no LLM provider configured)", "BrainRunner");
    }
    return new MockAgentRunner();
  }

  if (runners.length === 1) {
    Logger.log(`Agents: LLM-backed via ${labels[0]}`, "BrainRunner");
    return runners[0];
  }

  Logger.log(
    `Agents: ${runners.length} providers (fallback chain): ${labels.join(" -> ")}`,
    "BrainRunner",
  );
  return new FallbackAgentRunner(runners, labels);
}

/** Setting keys (in the Settings table) are env names prefixed with "llm.". */
export const LLM_SETTING_PREFIX = "llm.";
