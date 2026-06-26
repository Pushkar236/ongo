# OnGo — Research & Post-Mortems

This folder documents investigations into how OnGo's autonomous engine behaved,
what went wrong, and the evidence behind it. It is analysis only — no code is
changed from here.

## Index

| Document                                                                 | What it covers                                                                                                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [postmortem-hagent-allucination.md](./postmortem-agent-hallucination.md) | **Why the agents hallucinated** — root causes of generic ideas + incoherent generated repos, grounded in the actual code paths. The primary report. |
| [evidence-and-codepaths.md](./evidence-and-codepaths.md)                 | The specific files, functions, and lines that produced each failure — a map from symptom → code.                                                    |
| [paths-forward.md](./paths-forward.md)                                   | Options for fixing it (not a decision). Awaiting your direction before any are implemented.                                                         |

## TL;DR

The **platform** is well-built: every action routes through OnGo Brain, the
approval policy and audit trail are real, and the data model is sound. The
**failure is the executor**: weak free LLMs were asked to do open-ended,
multi-file software engineering **with no verification gate** and **no project
memory**, on a **high-frequency loop**. The result was confident, structurally
broken output committed straight to real GitHub repos — which actively works
against the goal (a strong, credible GitHub profile).

**Status:** Autonomous building is **paused**. No pending changes were deployed.
Awaiting your instructions on which direction to take next.
