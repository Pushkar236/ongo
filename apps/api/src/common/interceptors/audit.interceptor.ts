import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ActorType } from "@ongo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../decorators/current-user.decorator";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Global audit trail. Every successful mutation by an authenticated human is
 * written to activity_logs. Agent actions are logged separately by the Brain,
 * so we skip the /brain route here to avoid double-counting.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;
    const url: string = req.originalUrl ?? req.url ?? "";

    const shouldAudit =
      MUTATING.has(method) &&
      !url.includes("/auth/") &&
      !url.includes("/brain/");

    return next.handle().pipe(
      tap(() => {
        if (!shouldAudit) return;
        const user = req.user as AuthUser | undefined;
        this.prisma.activityLog
          .create({
            data: {
              actorType: ActorType.HUMAN,
              actorId: user?.id ?? null,
              actorName: user?.email ?? "anonymous",
              action: `${method} ${url}`,
              metadata: {},
            },
          })
          .catch((err) =>
            this.logger.warn(`audit write failed: ${String(err)}`),
          );
      }),
    );
  }
}
