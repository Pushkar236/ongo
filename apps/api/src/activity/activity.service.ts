import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  findRecent(limit = 30) {
    return this.prisma.activityLog.findMany({
      take: Math.min(limit, 100),
      orderBy: { createdAt: "desc" },
    });
  }
}
