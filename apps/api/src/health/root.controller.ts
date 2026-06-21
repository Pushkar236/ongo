import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";

/**
 * Root landing route (outside the /api/v1 prefix). Without this, hitting the
 * bare host returns a bare 404 that looks like a broken deploy. This returns a
 * small signpost to the real entry points instead.
 */
@ApiExcludeController()
@Controller()
export class RootController {
  @Public()
  @Get()
  root() {
    return {
      service: "OnGo Brain",
      status: "ok",
      message: "API is running. See the links below.",
      api: "/api/v1",
      health: "/api/v1/health",
      docs: "/api/docs",
    };
  }
}
