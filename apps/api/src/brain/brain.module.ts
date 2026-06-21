import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentRunner, MockAgentRunner } from "./agent-runner";
import { AnthropicAgentRunner } from "./anthropic-agent-runner";
import { OpenAiCompatibleAgentRunner } from "./openai-agent-runner";
import { BrainController } from "./brain.controller";
import { BrainService } from "./brain.service";

@Module({
  controllers: [BrainController],
  providers: [
    BrainService,
    {
      // Real LLM-backed agents when ANTHROPIC_API_KEY is set; mock otherwise.
      provide: AgentRunner,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>("ANTHROPIC_API_KEY")?.trim();
        const model =
          config.get<string>("AGENT_MODEL")?.trim() || "claude-opus-4-8";

        // 1) Real metered Anthropic key.
        if (apiKey && apiKey.startsWith("sk-ant-api")) {
          Logger.log(`Agents: LLM-backed via Anthropic (${model})`, "BrainModule");
          return new AnthropicAgentRunner(apiKey, model);
        }

        // 2) ANY OpenAI-compatible provider — this is the FREE path. Set
        //    LLM_BASE_URL + LLM_API_KEY + LLM_MODEL to use Groq, Google Gemini,
        //    OpenRouter, Together, a local Ollama, etc. No Anthropic billing.
        const llmKey = config.get<string>("LLM_API_KEY")?.trim();
        const llmBase = config.get<string>("LLM_BASE_URL")?.trim();
        const llmModel = config.get<string>("LLM_MODEL")?.trim();
        const llmProvider =
          config.get<string>("LLM_PROVIDER")?.trim() || "openai-compatible";
        if (llmKey && llmBase && llmModel) {
          Logger.log(
            `Agents: LLM-backed via ${llmProvider} (${llmModel})`,
            "BrainModule",
          );
          return new OpenAiCompatibleAgentRunner(
            llmKey,
            llmModel,
            llmBase,
            llmProvider,
          );
        }

        // 3) Reject OAuth/subscription tokens (sk-ant-oat…) — they belong to
        //    Claude Code / claude.ai and must NOT power a backend app.
        if (apiKey && apiKey.startsWith("sk-ant-oat")) {
          Logger.warn(
            "Agents: ignoring ANTHROPIC_API_KEY — it is a subscription token " +
              "(sk-ant-oat…), not an API key. Using mock. For free live agents " +
              "set LLM_BASE_URL + LLM_API_KEY + LLM_MODEL (e.g. Groq/Gemini).",
            "BrainModule",
          );
          return new MockAgentRunner();
        }

        // 4) No provider configured → deterministic mock.
        Logger.log(
          "Agents: mock runner (set LLM_* for free live execution, or a real " +
            "sk-ant-api key)",
          "BrainModule",
        );
        return new MockAgentRunner();
      },
    },
  ],
  exports: [BrainService],
})
export class BrainModule {}
