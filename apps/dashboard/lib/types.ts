// Shapes returned by the OnGo Brain API (subset the dashboard consumes).

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "FOUNDER" | "ADMIN" | "OPERATOR" | "AGENT";
  status: string;
}

export interface Overview {
  activeProjects: number;
  activeAgents: number;
  openTasks: number;
  pendingApprovals: number;
  deploymentsToday: number;
  newOpportunities: number;
  totalRevenue: number;
}

export interface Approval {
  id: string;
  actionType: string;
  title: string;
  level: "AUTO" | "SUGGESTED" | "MANDATORY";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO_APPROVED";
  impactAnalysis?: string | null;
  createdAt: string;
  requestedByAgent?: { name: string; type: string } | null;
}

export interface ActivityItem {
  id: string;
  actorType: "AGENT" | "HUMAN" | "SYSTEM";
  actorName?: string | null;
  action: string;
  entity?: string | null;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  role: string;
  status: string;
  description?: string | null;
  permissions: string[];
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  status: string;
  type: string;
  repoUrl?: string | null;
  deploymentStatus: string;
  revenue: string | number;
  _count?: { tasks: number; deployments: number };
}

export interface Opportunity {
  id: string;
  title: string;
  market: string;
  demandScore: number;
  estRevenue: string | number;
  competition: string;
  recommendation?: string | null;
  status: string;
  sourceAgent?: { name: string; type: string } | null;
}
