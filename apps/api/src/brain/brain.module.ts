import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentRunner, MockAgentRunner } from "./agent-runner";
import { AnthropicAgentRunner } from "./anthropic-agent-runner";
import { OpenAiCompatibleAgentRunner } from "./openai-agent-runner";
import { FallbackAgentRunner } from "./fallback-agent-runner";
import { BrainController } from "./brain.controller";
import { BrainService } from "./brain.service";

@Module({
  controllers: [BrainController],
  providers: [
    BrainService,
    {
      // Build a chain of LLM providers and fall through on rate-limits so the
      // engine pools several FREE providers. Mock only if none are configured.
      provide: AgentRunner,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const get = (k: string) => config.get<string>(k)?.trim();
        const apiKey = get("ANTHROPIC_API_KEY");
        const model = get("AGENT_MODEL") || "claude-opus-4-8";

        const runners: AgentRunner[] = [];
        const labels: string[] = [];

        // 1) Real metered Anthropic key (sk-ant-api…) goes first if present.
        if (apiKey && apiKey.startsWith("sk-ant-api")) {
          runners.push(new AnthropicAgentRunner(apiKey, model));
          labels.push(`anthropic:${model}`);
        }

        // 2) Any number of OpenAI-compatible FREE providers, in priority order:
        //    LLM_* (primary), then LLM_*_2, LLM_*_3, LLM_*_4. Each needs its own
        //    API_KEY + BASE_URL + MODEL (e.g. Groq, Gemini, Cerebras, OpenRouter).
        for (const sfx of ["", "_2", "_3", "_4"]) {
          const key = get(`LLM_API_KEY${sfx}`);
          const base = get(`LLM_BASE_URL${sfx}`);
          const mdl = get(`LLM_MODEL${sfx}`);
          const provider = get(`LLM_PROVIDER${sfx}`) || "openai-compatible";
          if (key && base && mdl) {
            runners.push(new OpenAiCompatibleAgentRunner(key, mdl, base, provider));
            labels.push(`${provider}:${mdl}`);
          }
        }

        if (runners.length === 0) {
          if (apiKey && apiKey.startsWith("sk-ant-oat")) {
            Logger.warn(
              "Agents: ignoring ANTHROPIC_API_KEY — it is a subscription token " +
                "(sk-ant-oat…), not an API key. Using mock. For free live agents " +
                "set LLM_BASE_URL + LLM_API_KEY + LLM_MODEL (e.g. Groq/Gemini).",
              "BrainModule",
            );
          } else {
            Logger.log(
              "Agents: mock runner (set LLM_* for free live execution, or a real " +
                "sk-ant-api key)",
              "BrainModule",
            );
          }
          return new MockAgentRunner();
        }

        if (runners.length === 1) {
          Logger.log(`Agents: LLM-backed via ${labels[0]}`, "BrainModule");
          return runners[0];
        }

        Logger.log(
          `Agents: ${runners.length} LLM providers (fallback chain): ${labels.join(" -> ")}`,
          "BrainModule",
        );
        return new FallbackAgentRunner(runners, labels);
      },
    },
  ],
  exports: [BrainService],
})
export class BrainModule {}
