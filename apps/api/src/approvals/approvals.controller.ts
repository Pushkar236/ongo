import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { ApprovalStatus, Role } from "@ongo/db";
import {
  CurrentUser,
  type AuthUser,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { ApprovalsService } from "./approvals.service";

class DecisionDto {
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags("approvals")
@ApiBearerAuth()
@Controller("approvals")
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @Get()
  @ApiQuery({ name: "status", enum: ApprovalStatus, required: false })
  findAll(@Query("status") status?: ApprovalStatus) {
    return this.approvals.findAll(status);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.approvals.findOne(id);
  }

  // Only humans with authority can resolve approvals — never an AGENT.
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post(":id/approve")
  approve(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: DecisionDto,
  ) {
    return this.approvals.approve(id, user.id, dto.note);
  }

  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post(":id/reject")
  reject(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: DecisionDto,
  ) {
    return this.approvals.reject(id, user.id, dto.note);
  }
}
