import { AgentRunContext } from "./agent-runner";

// Per-agent-type persona. Shared by every real LLM runner so the prompt is
// identical no matter which provider (Anthropic / Groq / Gemini / …) executes.
export const PERSONA: Record<string, string> = {
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

/** Build the system + user prompt for an agent action. */
export function buildPrompts(ctx: AgentRunContext): {
  system: string;
  user: string;
} {
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
  return { system, user };
}

/** Tolerant JSON extraction — models occasionally wrap JSON in prose/fences. */
export function extractJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        /* fall through */
      }
    }
    return {};
  }
}
