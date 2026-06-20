import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@ongo/db";
import { Roles } from "../common/decorators/roles.decorator";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles(Role.FOUNDER, Role.ADMIN)
  @Get()
  findAll() {
    return this.users.findAll();
  }
}
