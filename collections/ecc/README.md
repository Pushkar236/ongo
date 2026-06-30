# ECC Collection (vendored reference)

A **reference copy** of the **ECC** agent harness — *"the agent harness operating
system for agentic work"* — imported into OnGo as a browsable collection.

- **Source:** https://github.com/affaan-m/ecc (MIT, by Affaan M · `ecc.tools`)
- **Imported:** 2026-06-26 · `git clone --depth 1` of `main`
- **Contents:** `agents/` (67) · `skills/` (277) · `commands/` (92)
- **License:** MIT — see [`LICENSE`](./LICENSE). Original docs in [`ECC-README.md`](./ECC-README.md).

## What this is (and isn't)

This is a **vendored, version-pinned reference** — the markdown definitions of
ECC's agents, skills, and commands, kept in the repo so they're browsable and
travel with OnGo. They are **NOT active** Claude Code components here (they live
outside `.claude/`, so the harness does not auto-load them).

## How to actually use ECC

To make ECC *active* in Claude Code (the intended, namespaced, updatable way),
install it as a plugin — do **not** also copy these files into `.claude/`
(don't stack install methods):

```
/plugin marketplace add affaan-m/ecc
/plugin install ecc@ecc
```

## Why it's here

ECC's `verification-loop`, `code-reviewer`, `quality-gate`, and `tdd-workflow`
are exactly the verification gate OnGo's autonomous building lacked (see
[`/Research`](../../Research)). This collection is the **blueprint** for OnGo's
future safe-building phase (Options B/C): model OnGo's runtime review/verify
agents on these patterns.

## Notable pieces

- **Agents:** `planner`, `code-reviewer`, `security-reviewer`, `build-error-resolver`,
  `e2e-runner`, `refactor-cleaner`, language reviewers (`typescript-reviewer`, …)
- **Skills:** `verification-loop`, `tdd-workflow`, `e2e-testing`, `api-design`,
  `deployment-patterns`, `security-review`, `market-research`
- **Commands:** `/plan`, `/code-review`, `/quality-gate`, `/multi-plan`, `/multi-execute`

> Not imported here: ECC's `hooks/` (auto-running scripts — security surface),
> `rules/`, `mcp-configs/`, and `scripts/`. Use the plugin install if you want those.
