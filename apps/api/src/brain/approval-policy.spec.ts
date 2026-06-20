import { ApprovalLevel, RiskLevel } from "@ongo/db";
import { classifyAction } from "./approval-policy";

describe("approval policy", () => {
  it("classifies routine actions as AUTO (L1)", () => {
    expect(classifyAction("docs.generate").level).toBe(ApprovalLevel.AUTO);
    expect(classifyAction("task.create").level).toBe(ApprovalLevel.AUTO);
  });

  it("classifies medium-risk actions as SUGGESTED (L2)", () => {
    expect(classifyAction("deploy.feature").level).toBe(
      ApprovalLevel.SUGGESTED,
    );
    expect(classifyAction("code.generate").level).toBe(ApprovalLevel.SUGGESTED);
  });

  it("classifies high-risk actions as MANDATORY (L3)", () => {
    expect(classifyAction("deploy.production").level).toBe(
      ApprovalLevel.MANDATORY,
    );
    expect(classifyAction("finance.charge").riskLevel).toBe(RiskLevel.HIGH);
  });

  it("denies-by-default: unknown actions require mandatory approval", () => {
    const policy = classifyAction("totally.unknown.action");
    expect(policy.level).toBe(ApprovalLevel.MANDATORY);
    expect(policy.riskLevel).toBe(RiskLevel.HIGH);
  });
});
