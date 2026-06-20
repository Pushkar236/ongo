import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Role, TaskStatus } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateTaskDto, UpdateTaskStatusDto } from "./dto/create-task.dto";
import { TasksService } from "./tasks.service";

@ApiTags("tasks")
@ApiBearerAuth()
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  @ApiQuery({ name: "status", enum: TaskStatus, required: false })
  findAll(@Query("status") status?: TaskStatus) {
    return this.tasks.findAll(status);
  }

  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasks.create(dto);
  }

  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasks.updateStatus(id, dto.status);
  }
}
