import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@ApiBearerAuth()
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  // Public: powers the marketing site's auto-updating showcase. Declared
  // before ":id" so "showcase" isn't captured as a project id.
  @Public()
  @ApiOperation({ summary: "Public list of featured projects for the website" })
  @Get("showcase")
  showcase() {
    return this.projects.showcase();
  }

  @Get()
  findAll() {
    return this.projects.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.projects.findOne(id);
  }

  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }
}
