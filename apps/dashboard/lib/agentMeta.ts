import {
  Telescope,
  ClipboardList,
  Ruler,
  Code2,
  ShieldCheck,
  Server,
  FileText,
  Bot,
  type LucideIcon,
} from "lucide-react";

/**
 * Per agent-type identity: a color + icon + @handle. Shared by the agent
 * avatars, roster, profiles, activity feed, and the live "agents working"
 * visualization so every surface speaks the same visual language.
 */
export interface AgentTypeMeta {
  label: string;
  handle: string;
  color: string; // hex, used for avatar tint, ring, banner, connectors
  Icon: LucideIcon;
}

export const AGENT_TYPE_META: Record<string, AgentTypeMeta> = {
  RESEARCH: { label: "Research", handle: "research", color: "#1d9bf0", Icon: Telescope },
  PRODUCT_MANAGER: { label: "Product", handle: "product", color: "#7856ff", Icon: ClipboardList },
  ARCHITECT: { label: "Architect", handle: "architect", color: "#f7b928", Icon: Ruler },
  DEVELOPER: { label: "Developer", handle: "dev", color: "#00ba7c", Icon: Code2 },
  QA: { label: "QA", handle: "qa", color: "#f4212e", Icon: ShieldCheck },
  DEVOPS: { label: "DevOps", handle: "devops", color: "#00b8d4", Icon: Server },
  DOCUMENTATION: { label: "Docs", handle: "docs", color: "#f91880", Icon: FileText },
};

export function agentMeta(type?: string | null): AgentTypeMeta {
  return (
    (type && AGENT_TYPE_META[type]) || {
      label: type ?? "Agent",
      handle: (type ?? "agent").toLowerCase(),
      color: "#71767b",
      Icon: Bot,
    }
  );
}

/**
 * Friendly labels + colors for the action types agents emit. Drives the
 * action-type chips and the workload meters.
 */
export const ACTION_META: Record<string, { label: string; color: string }> = {
  "research.scan": { label: "Market scan", color: "#1d9bf0" },
  "opportunity.create": { label: "Opportunity", color: "#1d9bf0" },
  "github.repo.create": { label: "Repo created", color: "#7856ff" },
  "github.profile.update": { label: "Profile update", color: "#00b8d4" },
  "code.generate": { label: "Code commit", color: "#00ba7c" },
  "task.create": { label: "Task opened", color: "#f7b928" },
  "task.update": { label: "Task update", color: "#f7b928" },
  "approval.request": { label: "Approval requested", color: "#f4212e" },
  "permission.denied": { label: "Denied (no permission)", color: "#71767b" },
  "deploy.production": { label: "Prod deploy", color: "#00ba7c" },
  "deploy.feature": { label: "Feature deploy", color: "#00ba7c" },
  "autonomy.tick": { label: "Cycle", color: "#71767b" },
};

export function actionMeta(action: string): { label: string; color: string } {
  return ACTION_META[action] ?? { label: action, color: "#71767b" };
}
