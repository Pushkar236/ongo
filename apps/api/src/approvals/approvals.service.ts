import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ApprovalStatus, Prisma } from "@ongo/db";
import { PrismaService } from "../prisma/prisma.service";
import { BrainService } from "../brain/brain.service";

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly brain: BrainService,
  ) {}

  findAll(status?: ApprovalStatus) {
    return this.prisma.approval.findMany({
      where: status ? { status } : undefined,
      include: { requestedByAgent: { select: { name: true, type: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: { requestedByAgent: true, decidedBy: true },
    });
    if (!approval) throw new NotFoundException("Approval not found");
    return approval;
  }

  /** Approve a pending action → the Brain executes the originally-blocked work. */
  async approve(id: string, userId: string, note?: string) {
    const approval = await this.requirePending(id);
    const result = await this.brain.executeApproved(approval);
    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        decidedByUserId: userId,
        decidedAt: new Date(),
        decisionNote: note,
        payload: {
          ...(approval.payload as Record<string, unknown>),
          result,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /** Reject a pending action → nothing executes; recorded for the audit trail. */
  async reject(id: string, userId: string, note?: string) {
    await this.requirePending(id);
    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        decidedByUserId: userId,
        decidedAt: new Date(),
        decisionNote: note,
      },
    });
  }

  private async requirePending(id: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException("Approval not found");
    if (approval.status !== ApprovalStatus.PENDING)
      throw new BadRequestException(
        `Approval is already ${approval.status.toLowerCase()}`,
      );
    return approval;
  }
}
