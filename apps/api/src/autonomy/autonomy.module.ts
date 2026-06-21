import { Module } from "@nestjs/common";
import { BrainModule } from "../brain/brain.module";
import { GithubModule } from "../github/github.module";
import { AutonomyService } from "./autonomy.service";
import { AutonomyController } from "./autonomy.controller";

@Module({
  imports: [BrainModule, GithubModule],
  providers: [AutonomyService],
  controllers: [AutonomyController],
  exports: [AutonomyService],
})
export class AutonomyModule {}
