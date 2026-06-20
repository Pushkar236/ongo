import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Role } from "@ongo/db";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { LeadsService } from "./leads.service";

@ApiTags("leads")
@Controller("leads")
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @ApiOperation({ summary: "Public marketplace intake — submit a project request." })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Get()
  findAll() {
    return this.leads.findAll();
  }

  @ApiOperation({ summary: "Convert a lead into a tracked Opportunity." })
  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Post(":id/convert")
  convert(@Param("id") id: string) {
    return this.leads.convert(id);
  }
}
