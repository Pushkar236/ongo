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

  /**
   * Public, lean view for the marketing site — only featured projects, and
   * only the fields safe to expose (no internal tasks/payloads).
   */
  showcase() {
    return this.prisma.project.findMany({
      where: { featured: true },
      orderBy: [{ stars: "desc" }, { pushedAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        tagline: true,
        repoUrl: true,
        liveUrl: true,
        imageUrl: true,
        tech: true,
        stars: true,
        status: true,
        type: true,
        deploymentStatus: true,
        pushedAt: true,
        updatedAt: true,
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
