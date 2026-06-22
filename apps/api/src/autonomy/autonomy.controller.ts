import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { AutonomyConfigDto } from "./dto/autonomy-config.dto";
import { AutonomyService } from "./autonomy.service";

@ApiTags("autonomy")
@ApiBearerAuth()
@Controller("autonomy")
export class AutonomyController {
  constructor(private readonly autonomy: AutonomyService) {}

  @ApiOperation({ summary: "Autonomy engine status + last tick report." })
  @Get("status")
  status() {
    return this.autonomy.status();
  }

  @ApiOperation({ summary: "Run one autonomy cycle now." })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("tick")
  tick() {
    return this.autonomy.tick("manual");
  }

  @ApiOperation({
    summary: "Incubate one new project now — turns a discovered opportunity " +
      "into a fresh (private) GitHub repo + Project.",
  })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("incubate")
  incubate() {
    return this.autonomy.incubateOnce();
  }

  @ApiOperation({
    summary: "Tune runtime config (e.g. cycle intervalMs). Persists across redeploys.",
  })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("config")
  config(@Body() dto: AutonomyConfigDto) {
    return this.autonomy.setConfig(dto);
  }

  @ApiOperation({ summary: "Start the 24/7 engine." })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("start")
  start() {
    this.autonomy.start();
    return this.autonomy.status();
  }

  @ApiOperation({ summary: "Stop the 24/7 engine." })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("stop")
  stop() {
    this.autonomy.stop();
    return this.autonomy.status();
  }
}
