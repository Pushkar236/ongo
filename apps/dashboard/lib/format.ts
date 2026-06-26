export function inr(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "now"; // clamp tiny/negative (clock skew) to "now"
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Agent type → an X-style @handle, e.g. PRODUCT_MANAGER → "@product_manager". */
export function handleFor(type?: string | null): string {
  return `@${(type ?? "agent").toLowerCase()}`;
}

/** Turn an action type into a short human verb phrase for the timeline. */
const ACTION_VERBS: Record<string, string> = {
  "research.scan": "ran a market scan",
  "opportunity.create": "surfaced an opportunity",
  "github.repo.create": "created a repo",
  "github.profile.update": "refreshed the GitHub profile",
  "code.generate": "wrote code",
  "task.create": "opened a task",
  "task.update": "updated a task",
  "approval.request": "requested approval",
  "permission.denied": "was denied (no permission)",
  "deploy.production": "requested a production deploy",
  "deploy.feature": "deployed a feature",
  "autonomy.tick": "ran an autonomy cycle",
};

export function actionVerb(action: string): string {
  return ACTION_VERBS[action] ?? action.replace(/\./g, " ");
}
