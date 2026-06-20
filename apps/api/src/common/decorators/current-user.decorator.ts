import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "@ongo/db";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/** Injects the authenticated user (set by JwtStrategy.validate) into a handler. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);
