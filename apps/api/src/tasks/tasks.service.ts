import { Injectable } from "@nestjs/common";
import { Prisma, TaskStatus } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      include: { assignedAgent: true, project: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        projectId: dto.projectId,
        assignedAgentId: dto.assignedAgentId,
      } as Prisma.TaskUncheckedCreateInput,
    });
  }

  updateStatus(id: string, status: TaskStatus) {
    return this.prisma.task.update({ where: { id }, data: { status } });
  }
}
