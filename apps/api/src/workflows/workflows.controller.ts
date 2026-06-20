import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { WorkflowsService } from "./workflows.service";

class RunWorkflowDto {
  @IsString()
  pipeline!: string;
}

@ApiTags("workflows")
@ApiBearerAuth()
@Controller("workflows")
export class WorkflowsController {
  constructor(private readonly workflows: WorkflowsService) {}

  @Get()
  list() {
    return this.workflows.list();
  }

  @ApiOperation({ summary: "List runnable agent pipelines." })
  @Get("catalog")
  catalog() {
    return this.workflows.catalog();
  }

  @ApiOperation({
    summary: "Run a pipeline — chains agents through the Brain, step by step.",
  })
  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Post("run")
  run(@Body() dto: RunWorkflowDto) {
    return this.workflows.run(dto.pipeline);
  }
}
