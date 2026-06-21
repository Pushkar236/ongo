import { Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
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
