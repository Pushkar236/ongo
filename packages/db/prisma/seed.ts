/**
 * Seed the OnGo Brain with a founder account, the seven specialist agents,
 * and enough sample data for the Founder Dashboard to look alive.
 *
 * Run: pnpm --filter @ongo/db seed
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

// Default founder credentials (override via env for non-dev environments).
const FOUNDER_EMAIL = process.env.SEED_FOUNDER_EMAIL ?? "founder@ongo.ai";
const FOUNDER_PASSWORD = process.env.SEED_FOUNDER_PASSWORD ?? "OnGoFounder!2026";

// Action types each agent is permitted to request (deny-by-default in the Brain).
const AGENTS = [
  {
    name: "Atlas",
    type: "RESEARCH" as const,
    role: "Research Agent",
    description: "Analyzes trends, finds opportunities, detects market problems.",
    permissions: ["research.scan", "opportunity.create", "report.generate"],
  },
  {
    name: "Mosaic",
    type: "PRODUCT_MANAGER" as const,
    role: "Product Manager Agent",
    description: "Generates PRDs and roadmaps, breaks work into tasks.",
    permissions: ["prd.generate", "task.create", "project.create"],
  },
  {
    name: "Vitruvius",
    type: "ARCHITECT" as const,
    role: "Architect Agent",
    description: "System design, security review, technology decisions.",
    permissions: ["architecture.plan", "architecture.change", "security.review"],
  },
  {
    name: "Forge",
    type: "DEVELOPER" as const,
    role: "Developer Agent",
    description: "Generates and refactors code, opens pull requests.",
    permissions: ["code.generate", "pr.create", "task.update"],
  },
  {
    name: "Sentinel",
    type: "QA" as const,
    role: "QA Agent",
    description: "Automated testing, regression checks, quality gates.",
    permissions: ["test.run", "report.generate", "task.update"],
  },
  {
    name: "Helm",
    type: "DEVOPS" as const,
    role: "DevOps Agent",
    description: "Deployments, monitoring, infrastructure management.",
    permissions: ["deploy.feature", "deploy.production", "infra.purchase"],
  },
  {
    name: "Quill",
    type: "DOCUMENTATION" as const,
    role: "Documentation Agent",
    description: "Generates docs, maintains changelogs, updates status.",
    permissions: ["docs.generate", "changelog.update", "report.generate"],
  },
];

async function main() {
  console.log("🌱 Seeding OnGo Brain…");

  // Founder
  const passwordHash = await bcrypt.hash(FOUNDER_PASSWORD, 12);
  const founder = await prisma.user.upsert({
    where: { email: FOUNDER_EMAIL },
    update: {},
    create: {
      email: FOUNDER_EMAIL,
      passwordHash,
      name: "OnGo Founder",
      role: "FOUNDER",
    },
  });
  console.log(`  ✓ Founder: ${founder.email}`);

  // Agents
  const agents: Record<string, string> = {};
  for (const a of AGENTS) {
    const existing = await prisma.agent.findFirst({ where: { type: a.type } });
    const agent = existing
      ? await prisma.agent.update({ where: { id: existing.id }, data: a })
      : await prisma.agent.create({ data: a });
    agents[a.type] = agent.id;
  }
  console.log(`  ✓ ${AGENTS.length} agents`);

  // Sample project
  const project = await prisma.project.upsert({
    where: { slug: "ongo-platform" },
    update: {},
    create: {
      name: "OnGo Platform",
      slug: "ongo-platform",
      description: "The internal build of the OnGo operating platform itself.",
      status: "ACTIVE",
      type: "INTERNAL",
      repoUrl: "https://github.com/Pushkar236/ongo",
      deploymentStatus: "LIVE",
      revenue: 0,
    },
  });

  // A couple of tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Draft Q3 product roadmap",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: project.id,
        assignedAgentId: agents.PRODUCT_MANAGER,
      },
      {
        title: "Add regression suite for auth flow",
        status: "PENDING",
        priority: "MEDIUM",
        projectId: project.id,
        assignedAgentId: agents.QA,
      },
    ],
  });

  // Opportunity surfaced by the Research agent
  await prisma.opportunity.create({
    data: {
      title: "AI booking assistant for clinics",
      market: "Healthcare SMB",
      description:
        "Small clinics struggle with no-shows; an AI scheduler + reminders could cut them 30%.",
      demandScore: 78,
      estRevenue: 450000,
      competition: "MEDIUM",
      recommendation: "Build a focused MVP for 3 pilot clinics.",
      status: "REVIEWING",
      sourceAgentId: agents.RESEARCH,
    },
  });

  // A pending MANDATORY approval (so the Approval Center has something to show)
  await prisma.approval.create({
    data: {
      actionType: "deploy.production",
      title: "Deploy OnGo Platform v2 to production",
      level: "MANDATORY",
      riskLevel: "HIGH",
      status: "PENDING",
      requestedByAgentId: agents.DEVOPS,
      impactAnalysis:
        "Promotes the v2 build to the live environment. Affects all users; DB migration included.",
      payload: { projectId: project.id, environment: "production", commitSha: "deadbeef" },
    },
  });

  // Seed revenue + activity so the dashboard charts render
  await prisma.revenue.create({
    data: { projectId: project.id, amount: 120000, type: "MILESTONE", note: "Pilot retainer" },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorType: "AGENT",
        actorId: agents.RESEARCH,
        actorName: "Atlas (Research)",
        action: "opportunity.create",
        entity: "Opportunity",
        metadata: { title: "AI booking assistant for clinics" },
      },
      {
        actorType: "AGENT",
        actorId: agents.DEVOPS,
        actorName: "Helm (DevOps)",
        action: "approval.request",
        entity: "Approval",
        metadata: { actionType: "deploy.production", level: "MANDATORY" },
      },
      {
        actorType: "SYSTEM",
        actorName: "OnGo Brain",
        action: "seed.complete",
        metadata: { agents: AGENTS.length },
      },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Login: ${FOUNDER_EMAIL} / ${FOUNDER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
