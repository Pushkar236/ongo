import { Module } from "@nestjs/common";
import { AgentRunner, MockAgentRunner } from "./agent-runner";
import { BrainController } from "./brain.controller";
import { BrainService } from "./brain.service";

@Module({
  controllers: [BrainController],
  providers: [
    BrainService,
    // Swap MockAgentRunner for an LLM-backed runner in a later phase.
    { provide: AgentRunner, useClass: MockAgentRunner },
  ],
  exports: [BrainService],
})
export class BrainModule {}
