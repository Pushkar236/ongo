import { Injectable } from "@nestjs/common";
import { OpportunityStatus } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.opportunity.findMany({
      orderBy: [{ demandScore: "desc" }, { createdAt: "desc" }],
      include: { sourceAgent: { select: { name: true, type: true } } },
    });
  }

  updateStatus(id: string, status: OpportunityStatus) {
    return this.prisma.opportunity.update({ where: { id }, data: { status } });
  }
}
