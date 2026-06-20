import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.agent.findMany({ orderBy: { createdAt: "asc" } });
  }

  async findOne(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        tasks: { take: 10, orderBy: { updatedAt: "desc" } },
      },
    });
    if (!agent) throw new NotFoundException("Agent not found");
    return agent;
  }
}
