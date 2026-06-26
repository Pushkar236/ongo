# Paths Forward (Options — Not a Decision)

These are options for where OnGo goes next, with honest trade-offs. **Nothing
here is being implemented.** Awaiting direction.

The post-mortem's core finding drives all of these: _autonomy without
verification is automated mistake-making._ So every credible option adds a
verification gate, fixes the content-blindness, or removes autonomy from the
quality-critical path.

---

## Option A — Stop autonomous code-writing; keep autonomous _curation_

**What:** OnGo stops generating project code. It keeps doing the safe, valuable,
read-only things: sync your real GitHub repos to the showcase, keep the profile
README's "Featured Projects" fresh, surface researched opportunities for **you**
to act on.
**Pros:** Zero risk of junk in your repos. Immediately credible. Low cost.
**Cons:** Loses the "AI builds projects for me" ambition (for now).
**Best if:** You want your GitHub profile to look professional _today_ and treat
autonomous building as a later, harder phase.

## Option B — Human-in-the-loop building (review before commit)

**What:** Flip `code.generate` and `github.repo.create` to **MANDATORY**. The
agent proposes a repo or a file; you approve/reject in the dashboard before
anything lands. Add a diff preview to the Approval Center.
**Pros:** You get AI leverage _and_ a quality gate that's already in the
architecture. No bad commit can land unseen.
**Cons:** Not "hands-off"; you become the reviewer (which is the correct role for
quality).
**Best if:** You want AI to draft, but every public artifact to pass your eye.

## Option C — Add a real verification gate (CI-in-the-loop)

**What:** Before any generated file is committed, run it through a check:
type-check / build / lint / test in an ephemeral sandbox; reject and retry (or
escalate to you) on failure. Feed the open-ended agent **file contents**, not
just paths, so it stops guessing.
**Pros:** This is the actual missing piece for true autonomy. Output quality
jumps because broken code never ships.
**Cons:** Most engineering effort. Needs a sandbox/runner and a retry loop.
Slower per commit (correctly so).
**Best if:** You want to keep pursuing autonomous building and do it _right_.

## Option D — Upgrade the model on the quality-critical path

**What:** Keep free models for cheap tasks, but route `code.generate` and
research synthesis to a genuinely capable model (e.g. a paid Claude/GPT tier).
Pairs with B and/or C.
**Pros:** Removes the RC-1 capability ceiling. Biggest single quality lift per
unit effort.
**Cons:** Costs money. Doesn't _alone_ fix content-blindness/verification — needs
C to be fully safe.
**Best if:** You're willing to spend a little to make the output genuinely good.

## Option E — Narrow the scope to ONE great project, built carefully

**What:** Drop the "many repos" incubator. Pick one well-specified product and
have the agent build it incrementally with full context (contents, memory,
verification) under your review.
**Pros:** One polished, coherent, real project beats ten incoherent ones for a
portfolio — by a wide margin.
**Cons:** Less "factory," more "assistant on one thing."
**Best if:** The goal is a portfolio that impresses, not a green graph.

---

## My recommendation (for when you're ready to decide)

A staged combination, in order:

1. **Now:** Option A (curation only) so the profile is clean and credible
   immediately, and **clean up** the existing incoherent incubated repos
   (archive/delete the AI-slop ones).
2. **Next:** Option B + D (human-reviewed building with a capable model) — high
   quality, low engineering risk, uses the architecture you already have.
3. **Later:** Option C (CI-in-the-loop) to earn back real hands-off autonomy
   once the gate exists.
4. Consider **Option E** as the framing throughout: depth over breadth.

This sequences from "safe and credible today" → "good output with you in the
loop" → "genuinely autonomous and verified," spending effort only as each stage
proves out.

---

## Open questions for you

1. Do you want to **keep pursuing autonomous code-writing**, or pivot OnGo toward
   curation + research + outreach (and you build the projects)?
2. Are you willing to **spend a little on a capable model** for the
   quality-critical work, or stay strictly free?
3. Should we **clean up the existing incubated repos** that contain incoherent
   code (so they don't sit in your public history)?

Tell me which direction and I'll plan it properly before touching anything.
