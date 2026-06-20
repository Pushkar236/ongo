import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { tasks: true, deployments: true } },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { include: { assignedAgent: true }, orderBy: { updatedAt: "desc" } },
        repositories: true,
        deployments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  create(dto: CreateProjectDto) {
    const slug =
      dto.slug ??
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        type: dto.type,
        status: dto.status,
      } as Prisma.ProjectCreateInput,
    });
  }
}
