import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ActorType, Prisma } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public marketplace intake. Honeypot-filtered; logged to the audit trail. */
  async create(dto: CreateLeadDto) {
    // Silently absorb bot submissions (honeypot) without creating a lead.
    if (dto.company && dto.company.trim()) {
      return { ok: true };
    }

    const lead = await this.prisma.lead.create({
      data: {
        source: "marketplace",
        type: dto.type ?? "WEBSITE",
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        request: { message: dto.message } as Prisma.InputJsonValue,
        status: "NEW",
      },
    });

    await this.prisma.activityLog.create({
      data: {
        actorType: ActorType.SYSTEM,
        actorName: "Marketplace",
        action: "lead.intake",
        entity: "Lead",
        entityId: lead.id,
        metadata: { type: lead.type, from: dto.contactEmail ?? "anonymous" },
      },
    });

    return { ok: true, id: lead.id };
  }

  findAll() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { opportunity: { select: { id: true, title: true } } },
    });
  }

  /** Promote an inbound lead into a tracked Opportunity for the pipeline. */
  async convert(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException("Lead not found");
    if (lead.status === "CONVERTED")
      throw new BadRequestException("Lead already converted");

    const req = (lead.request ?? {}) as { message?: string };
    const message = req.message ?? "Inbound marketplace request";

    const opportunity = await this.prisma.opportunity.create({
      data: {
        title:
          message.length > 60 ? `${message.slice(0, 57)}…` : message,
        market: "Marketplace (inbound)",
        description: message,
        demandScore: 55,
        estRevenue: 0,
        competition: "MEDIUM",
        recommendation: "Inbound request — qualify and send a quote.",
        status: "NEW",
      },
    });

    await this.prisma.lead.update({
      where: { id },
      data: { status: "CONVERTED", opportunityId: opportunity.id },
    });

    return { lead: id, opportunityId: opportunity.id };
  }
}
