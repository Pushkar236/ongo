import { Module } from "@nestjs/common";
import { BrainController } from "./brain.controller";
import { BrainService } from "./brain.service";

@Module({
  controllers: [BrainController],
  // BrainService builds its own agent runner from DB LLM overrides layered over
  // env (see BrainService.rebuildRunner), so the provider can be switched live.
  providers: [BrainService],
  exports: [BrainService],
})
export class BrainModule {}
