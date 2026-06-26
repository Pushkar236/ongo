# Evidence & Code Paths

A direct map from each failure symptom to the code that caused it, so the
post-mortem can be verified line by line.

---

## Symptom → Cause map

| Symptom | Root cause | Where in code |
|---|---|---|
| Generic ideas ("AI automation") | Research agent got no grounding (original version); fix never deployed | `agent-prompt.ts` `buildResearchPrompt()`, `autonomy.service.ts` `fetchSignals()` (both written, **not built/deployed**) |
| Broken code committed to repos | No build/type/test gate before commit | `autonomy.service.ts` `runProjectDevelopment()` — commits after only `sanitizeDevPath` + length check |
| Files don't fit together | Open-ended phase sees file **names**, not **contents** | `runProjectDevelopment()` open-ended branch → `github.listRepoFiles(repo)` returns paths only |
| Same project re-derived every cycle | No project memory; only a 1-line description as context | `brain.dispatch({ payload: { description: project.description } })` — no history threaded in |
| Failures looked like successes | Fallback stubs always commit something | `DEV_PLAN[].fallback(...)` in `autonomy.service.ts` |
| No human checkpoint before public artifacts | Creative actions are SUGGESTED, not MANDATORY | `approval-policy.ts` — `code.generate` + `github.repo.create` both `SUGGESTED` |
| High-frequency junk | 5-min interval × per-tick incubate+develop | `autonomy.service.ts` `intervalMs` default `5*60*1000`, `tick()` runs all phases |

---

## Key code references

### No verification before commit
`apps/api/src/autonomy/autonomy.service.ts` — `runProjectDevelopment()`:
the only checks between model output and a real commit are:
```
const safe = this.sanitizeDevPath(out.path);     // path safety only
if (!content || content.length < 20) { ... }      // length only
...
await this.github.putFile(repo, path, content, `feat: ${path} (OnGo dev agent)`, sha);
```
No `tsc`, no build, no test, no lint. Correctness is never checked.

### Open-ended phase is content-blind
Same function, open-ended branch:
```
const files = await this.github.listRepoFiles(repo);   // paths only — not contents
... payload: { existingFiles: files, instruction: "...choose the SINGLE next most valuable file..." }
```
The agent must reference files whose contents it cannot see → invents their
exports/signatures.

### Approval policy: creative actions auto-execute
`apps/api/src/brain/approval-policy.ts`:
```
"code.generate":       { level: SUGGESTED, riskLevel: MEDIUM },  // executes, just flags
"github.repo.create":  { level: SUGGESTED, riskLevel: MEDIUM },  // executes, just flags
```
Compare to the MANDATORY tier (`deploy.production`, `db.production.change`,
`github.pr.merge`) which blocks. The quality-critical creative work sits in the
execute-then-log tier.

### Fallbacks hide failure
`DEV_PLAN` (top of `autonomy.service.ts`): every scaffold step has a `fallback`
used when "the model output is unusable" — so a failed generation still produces
a commit indistinguishable from a good one.

### Weak model chain (runtime, set via `/brain/llm`)
Observed live chain (from prior diagnostics):
`groq:openai/gpt-oss-120b → groq:qwen/qwen3-32b → groq:llama-3.3-70b-versatile → openrouter:openai/gpt-oss-120b`.
All free/low-tier; none reliable for autonomous multi-file engineering (RC-1).

### Tool-calling layer (written, not deployed)
`apps/api/src/brain/agent-tools.ts` + `openai-agent-runner.ts` add
`search_hackernews` / `search_github` / `search_npm`. Sound (zero-SSRF, fixed
hosts), but **uncommitted** and would not have fixed RC-2/RC-3/RC-4 (verification,
content-blindness, memory).

---

## What is verified vs. inferred

- **Verified by reading code:** the missing verification gate, the content-blind
  open-ended phase, the SUGGESTED classification of creative actions, the
  fallback masking, the 5-min cadence, the undeployed grounding/tooling.
- **Inferred (consistent with the above, not independently re-run):** the exact
  content of the bad commits in the live repos. To confirm specifics, inspect the
  incubated repos' commit history directly — happy to do that on request.
