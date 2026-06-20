import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ActivityService } from "./activity.service";

@ApiTags("activity")
@ApiBearerAuth()
@Controller("activity")
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get()
  findRecent(@Query("limit") limit?: string) {
    return this.activity.findRecent(limit ? Number(limit) : 30);
  }
}
