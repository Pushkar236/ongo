import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { BrainService } from "./brain.service";
import { DispatchActionDto } from "./dto/dispatch-action.dto";
import { LlmConfigDto } from "./dto/llm-config.dto";
import { KNOWN_ACTION_TYPES } from "./approval-policy";

@ApiTags("brain")
@ApiBearerAuth()
@Controller("brain")
export class BrainController {
  constructor(private readonly brain: BrainService) {}

  @ApiOperation({
    summary: "Agent action intake — the single gateway for all agent work.",
  })
  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR, Role.AGENT)
  @Post("actions")
  dispatch(@Body() dto: DispatchActionDto) {
    return this.brain.dispatch(dto);
  }

  @ApiOperation({ summary: "List action types the policy recognizes." })
  @Get("actions/catalog")
  catalog() {
    return { actionTypes: KNOWN_ACTION_TYPES };
  }

  @ApiOperation({
    summary:
      "Switch the LLM provider live (persists across redeploys). Returns the " +
      "active runner chain.",
  })
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post("llm")
  setLlm(@Body() dto: LlmConfigDto) {
    return this.brain.setLLMConfig(dto);
  }
}
