import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AgentRunner, MockAgentRunner } from "./agent-runner";
import { AnthropicAgentRunner } from "./anthropic-agent-runner";
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

        // Refuse OAuth/session tokens (sk-ant-oat…) — those belong to Claude
        // Code / claude.ai subscriptions and must NOT power a backend app
        // (terms-of-service violation + account risk). Accept only real,
        // metered API keys (sk-ant-api…).
        if (apiKey && apiKey.startsWith("sk-ant-oat")) {
          Logger.warn(
            "Agents: ignoring ANTHROPIC_API_KEY — it is an OAuth/subscription " +
              "token (sk-ant-oat…), not an API key. Using mock runner. " +
              "Provide a real API key (sk-ant-api…) from console.anthropic.com.",
            "BrainModule",
          );
          return new MockAgentRunner();
        }

        if (apiKey && apiKey.startsWith("sk-ant-api")) {
          Logger.log(`Agents: LLM-backed (${model})`, "BrainModule");
          return new AnthropicAgentRunner(apiKey, model);
        }

        Logger.log(
          "Agents: mock runner (set a real ANTHROPIC_API_KEY for live execution)",
          "BrainModule",
        );
        return new MockAgentRunner();
      },
    },
  ],
  exports: [BrainService],
})
export class BrainModule {}
