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
  newLeads: number;
  totalRevenue: number;
}

export interface Lead {
  id: string;
  source: string;
  type: string;
  status: string;
  contactName?: string | null;
  contactEmail?: string | null;
  request: { message?: string } | null;
  createdAt: string;
  opportunity?: { id: string; title: string } | null;
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

export interface Pipeline {
  key: string;
  name: string;
  description: string;
  steps: number;
}

export interface WorkflowRun {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  trigger?: string | null;
  steps: Array<{
    agentType: string;
    actionType: string;
    status: string;
    summary?: string;
  }>;
  createdAt: string;
}

export interface TickReport {
  at: string;
  trigger: "auto" | "manual";
  discovery: { ran: boolean; summary?: string };
  github: { scanned: boolean; findings: number; tasksOpened: number };
  showcase?: {
    synced: boolean;
    repos: number;
    featured: number;
    created: number;
    updated: number;
  };
  profile?: { attempted: boolean; updated: boolean; reason?: string };
  incubator?: {
    ran: boolean;
    created: boolean;
    repo?: string;
    reason?: string;
  };
  development?: {
    ran: boolean;
    committed: boolean;
    repo?: string;
    file?: string;
    reason?: string;
  };
  errors: string[];
}

export interface AutonomyStatus {
  enabled: boolean;
  running: boolean;
  intervalMs: number;
  tickCount: number;
  lastTickAt?: string;
  agentRunner?: string;
  llm?: {
    providerCount?: number;
    providers?: string[];
    primaryModel?: string | null;
  };
  github: { connected: boolean; repos: string[]; staleDays: number };
  incubator?: { enabled: boolean; max: number };
  lastReport?: TickReport | null;
}

export interface AgentAnalytics {
  summary: {
    totalAgentActions: number;
    opportunities: number;
    projects: number;
    incubatedRepos: number;
    devCommits: number;
  };
  agents: Array<{
    id: string;
    name: string;
    type: string;
    role: string;
    status: string;
    description?: string | null;
    lastActiveAt?: string | null;
    totalActions: number;
    actionsByType: Array<{ action: string; count: number }>;
    recentActions: Array<{
      action: string;
      entity?: string | null;
      createdAt: string;
    }>;
  }>;
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
