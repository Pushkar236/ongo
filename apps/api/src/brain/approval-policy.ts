import { ApprovalLevel, RiskLevel } from "@ongo/db";

export interface ActionPolicy {
  level: ApprovalLevel;
  riskLevel: RiskLevel;
}

/**
 * The human-in-the-loop policy table. Maps an agent action type to its
 * approval level + risk. This is the single place the platform decides what
 * an agent may do autonomously vs. what a human must sign off on.
 *
 *  L1 AUTO      — execute immediately, log it
 *  L2 SUGGESTED — execute, but record a flagged approval for review
 *  L3 MANDATORY — DO NOT execute; create a pending approval and wait
 */
const POLICY: Record<string, ActionPolicy> = {
  // ── Level 1: automatic ─────────────────────────────────────────────
  "research.scan": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "opportunity.create": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "report.generate": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "prd.generate": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "task.create": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "task.update": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "docs.generate": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "changelog.update": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "test.run": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },
  "github.issue.triage": { level: ApprovalLevel.AUTO, riskLevel: RiskLevel.LOW },

  // ── Level 2: suggested (executes, flagged for review) ──────────────
  "project.create": { level: ApprovalLevel.SUGGESTED, riskLevel: RiskLevel.LOW },
  "architecture.plan": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.LOW,
  },
  "architecture.change": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  "security.review": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.LOW,
  },
  "code.generate": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  "pr.create": { level: ApprovalLevel.SUGGESTED, riskLevel: RiskLevel.MEDIUM },
  "deploy.feature": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  // GitHub writes are outward-facing → execute but surface for review.
  "github.issue.comment": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  "github.issue.create": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  "github.pr.review": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.MEDIUM,
  },
  // Refreshing your own profile README — outward-facing but reversible.
  "github.profile.update": {
    level: ApprovalLevel.SUGGESTED,
    riskLevel: RiskLevel.LOW,
  },

  // ── Level 3: mandatory (blocked until a human approves) ────────────
  "deploy.production": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.HIGH,
  },
  "infra.purchase": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.HIGH,
  },
  "finance.charge": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.HIGH,
  },
  "db.production.change": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.HIGH,
  },
  "client.communicate": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.MEDIUM,
  },
  // Merging code into a real repo is irreversible-ish → human signs off.
  "github.pr.merge": {
    level: ApprovalLevel.MANDATORY,
    riskLevel: RiskLevel.HIGH,
  },
};

/**
 * Classify an action. Deny-by-default: an unknown action type is treated as
 * the most cautious tier (mandatory approval, high risk) so nothing slips
 * through unreviewed.
 */
export function classifyAction(actionType: string): ActionPolicy {
  return (
    POLICY[actionType] ?? {
      level: ApprovalLevel.MANDATORY,
      riskLevel: RiskLevel.HIGH,
    }
  );
}

export const KNOWN_ACTION_TYPES = Object.keys(POLICY);
