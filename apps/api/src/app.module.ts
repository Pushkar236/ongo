import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AgentsModule } from "./agents/agents.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { OpportunitiesModule } from "./opportunities/opportunities.module";
import { ApprovalsModule } from "./approvals/approvals.module";
import { ActivityModule } from "./activity/activity.module";
import { BrainModule } from "./brain/brain.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthController } from "./health/health.controller";

import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Read the monorepo-root .env first (turbo runs each app from its own dir),
      // then any app-local override.
      envFilePath: ["../../.env", ".env"],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AgentsModule,
    ProjectsModule,
    TasksModule,
    OpportunitiesModule,
    ApprovalsModule,
    ActivityModule,
    BrainModule,
    WorkflowsModule,
    DashboardModule,
  ],
  controllers: [HealthController],
  providers: [
    // Order matters: rate-limit → authenticate → authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
