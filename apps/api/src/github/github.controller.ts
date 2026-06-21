import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { GithubService } from "./github.service";

@ApiTags("github")
@ApiBearerAuth()
@Controller("github")
export class GithubController {
  constructor(private readonly github: GithubService) {}

  @ApiOperation({ summary: "GitHub connection + configured repos." })
  @Get("status")
  status() {
    return this.github.status();
  }

  @ApiOperation({ summary: "Live maintenance scan of configured repos." })
  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Get("scan")
  async scan() {
    return { findings: await this.github.maintenanceScan() };
  }
}
