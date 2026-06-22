import { Controller, Get, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AgentsService } from "./agents.service";

@ApiTags("agents")
@ApiBearerAuth()
@Controller("agents")
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  findAll() {
    return this.agents.findAll();
  }

  // Declared before ":id" so "analytics" isn't captured as a param.
  @Get("analytics")
  analytics() {
    return this.agents.analytics();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.agents.findOne(id);
  }
}
