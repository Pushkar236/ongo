import { AgentRunContext } from "./agent-runner";

// Per-agent-type persona. Shared by every real LLM runner so the prompt is
// identical no matter which provider (Anthropic / Groq / Gemini / …) executes.
export const PERSONA: Record<string, string> = {
  RESEARCH:
    "a senior product strategist who finds SPECIFIC, buildable, niche software " +
    "products — never generic ones. Every idea names a real problem for a " +
    "clearly-defined user, has a sharp differentiator, and a tight MVP a solo " +
    "full-stack developer can ship in a few weeks.",
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
    `You are ${ctx.agent.name}, ${persona} You work for OnGo, an AI-run software studio. ` +
    `Be concrete, specific, and realistic. Respond with ONLY minified JSON, no prose.`;

  // Research/opportunity discovery gets a specialized, grounded prompt that
  // forces SPECIFIC ideas (this is what stops generic "AI automation" repos).
  if (
    ctx.actionType.includes("research") ||
    ctx.actionType.includes("opportunity")
  ) {
    return { system, user: buildResearchPrompt(ctx) };
  }

  const user =
    `Action type: ${ctx.actionType}\n` +
    `Input payload (JSON): ${JSON.stringify(ctx.payload)}\n\n` +
    `Respond with ONLY minified JSON, no prose, in the shape: ` +
    `{"summary": "<one sentence>", "output": { ...structured fields relevant to the action... }}.`;
  return { system, user };
}

/** Grounded, specificity-forcing prompt for the Research agent. */
function buildResearchPrompt(ctx: AgentRunContext): string {
  const p = (ctx.payload ?? {}) as Record<string, unknown>;
  const founder =
    typeof p.founder === "string" && p.founder.trim()
      ? p.founder.trim()
      : "a solo full-stack developer (TypeScript, React, Next.js, Node, Tailwind) " +
        "building a standout GitHub portfolio and attracting freelance + SaaS clients";
  const signals = Array.isArray(p.signals)
    ? (p.signals as unknown[]).map(String).filter(Boolean).slice(0, 16)
    : [];
  const signalBlock = signals.length
    ? `Real, CURRENT signals for inspiration (trending repos + live discussions) — ` +
      `find an underserved gap near these, do NOT copy them:\n- ${signals.join("\n- ")}\n\n`
    : "";

  return (
    `Propose ONE specific, buildable software product idea for ${founder}.\n\n` +
    signalBlock +
    `HARD RULES — be SPECIFIC, never generic:\n` +
    `- BANNED: vague ideas like "AI-powered automation", "autonomous system", "AI assistant", ` +
    `"smart platform", "all-in-one tool". Reject anything that could describe 100 products.\n` +
    `- Name a REAL, narrow problem for a CLEARLY DEFINED user (e.g. "indie iOS devs", ` +
    `"Shopify sellers in India", "freelance video editors", "D&D dungeon masters").\n` +
    `- Give a sharp differentiator vs existing tools, and a tight MVP shippable in 2-3 weeks.\n` +
    `- The product name must be a concrete brand (e.g. "InvoiceSnap", "PromptVault", "ClipQueue") ` +
    `— NEVER "ai-powered-<thing>" or "autonomous-<thing>".\n\n` +
    `Return ONLY minified JSON: {"summary":"<one-line pitch>","output":{` +
    `"opportunity":"<concrete product name>",` +
    `"market":"<specific niche/user segment>",` +
    `"description":"<2-3 sentences: the exact problem, who has it, and your specific solution + differentiator>",` +
    `"demandScore":<integer 0-100>,` +
    `"estRevenue":<number, INR>,` +
    `"competition":"LOW"|"MEDIUM"|"HIGH",` +
    `"recommendation":"<the MVP: 3-5 concrete features in one string, then the recommended tech stack>"}}`
  );
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
