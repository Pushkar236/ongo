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
        const apiKey = config.get<string>("ANTHROPIC_API_KEY");
        const model =
          config.get<string>("AGENT_MODEL")?.trim() || "claude-opus-4-8";
        if (apiKey && apiKey.startsWith("sk-")) {
          Logger.log(
            `Agents: LLM-backed (${model})`,
            "BrainModule",
          );
          return new AnthropicAgentRunner(apiKey, model);
        }
        Logger.log(
          "Agents: mock runner (set ANTHROPIC_API_KEY for real execution)",
          "BrainModule",
        );
        return new MockAgentRunner();
      },
    },
  ],
  exports: [BrainService],
})
export class BrainModule {}
