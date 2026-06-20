import { AgentType } from "@ongo/db";

export interface PipelineStep {
  agentType: AgentType;
  actionType: string;
  title: string;
  payload?: Record<string, unknown>;
}

export interface PipelineDef {
  key: string;
  name: string;
  description: string;
  steps: PipelineStep[];
}

/**
 * Predefined agent pipelines. Each step is dispatched through the OnGo Brain,
 * so deny-by-default permissions, the approval policy, the audit trail, and
 * materialization all apply uniformly — a workflow is just an ordered series
 * of Brain actions across specialist agents.
 */
export const PIPELINES: Record<string, PipelineDef> = {
  "opportunity-to-tasks": {
    key: "opportunity-to-tasks",
    name: "Opportunity → Roadmap",
    description:
      "Research surfaces an opportunity, the PM drafts a spec, then breaks it into tasks.",
    steps: [
      {
        agentType: "RESEARCH",
        actionType: "research.scan",
        title: "Scan the market for an opportunity",
        payload: { title: "Auto-discovered opportunity", demandScore: 74 },
      },
      {
        agentType: "PRODUCT_MANAGER",
        actionType: "prd.generate",
        title: "Draft a product spec for the opportunity",
      },
      {
        agentType: "PRODUCT_MANAGER",
        actionType: "task.create",
        title: "Break the spec into the first build task",
        payload: { title: "Implement MVP scope" },
      },
    ],
  },
  "ship-feature": {
    key: "ship-feature",
    name: "Build → Test → Ship",
    description:
      "Developer produces a change, QA tests it, DevOps requests a production deploy (gated).",
    steps: [
      {
        agentType: "DEVELOPER",
        actionType: "code.generate",
        title: "Produce the code change",
      },
      {
        agentType: "QA",
        actionType: "test.run",
        title: "Run the test suite",
      },
      {
        agentType: "DEVOPS",
        actionType: "deploy.production",
        title: "Deploy to production",
        payload: { environment: "production" },
      },
    ],
  },
};
