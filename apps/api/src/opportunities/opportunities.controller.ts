import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { OpportunityStatus, Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { OpportunitiesService } from "./opportunities.service";

class UpdateOpportunityStatusDto {
  @IsEnum(OpportunityStatus)
  status!: OpportunityStatus;
}

@ApiTags("opportunities")
@ApiBearerAuth()
@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunities: OpportunitiesService) {}

  @Get()
  findAll() {
    return this.opportunities.findAll();
  }

  @Roles(Role.FOUNDER, Role.ADMIN, Role.OPERATOR)
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateOpportunityStatusDto,
  ) {
    return this.opportunities.updateStatus(id, dto.status);
  }
}
