---
name: fcd-debate
description: >
  Multi-character expert council for adversarial debate with a mandatory Surface Advocate.
  The Surface Advocate ensures every architectural decision is evaluated for its impact on
  shared surfaces — ports, entities, boundaries. When a decision would create, modify, or
  bypass a surface, the Advocate flags it for co-design. Supersedes forge-debate.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-debate [problem or topic]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[--synthetic] [problem or topic for the council to solve]"
fcd-lifecycle: decide
fcd-order: 8
---

# fcd-debate — Expert Council with Surface Advocate

> *"Every architecture decision is a surface decision. The question is whether you notice."*

A structured creative roleplay where expert characters debate a problem. The FCD addition: **every council includes a mandatory Surface Advocate** — a character whose sole conviction is that shared surfaces must be co-designed before either side implements.

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**Two execution modes:**
- **Isolated (default):** Each character runs as a separate sub-agent with its own context window. ~3x tokens, ~2x quality on adversarial metrics.
- **Synthetic (`--synthetic`):** All characters in a single context window. ~1x tokens.

**When to use:**
- Architectural decisions with multiple defensible approaches
- Design decisions from `/fcd-design` Phase 4 (per-domain architecture)
- Contentious decomposition decisions during `/fcd-plan`
- Any decision affecting security invariants or irreversible structure
- When 3+ options exist with non-obvious tradeoffs

**When NOT to use:**
- Reversible, low-stakes decisions with clear options
- Pure implementation questions within a single domain (no surface impact)
- When a `/fcd-surface` session would resolve the question directly

---

## Phase 0 — Memory Check

Check `.method/council/memory/INDEX.yaml` for prior council sessions on this topic.

If found:
> *"Found prior council on this topic: [{topic}] ({N} sessions). Resume with same cast, modify, or start fresh?"*

---

## Phase 1 — Setup

If `$ARGUMENTS` provided, use as problem statement. Otherwise ask:
> *"What should the council solve? Give me a problem, decision, or challenge."*

---

## Phase 2 — Cast Design

Design a council of **n >= 3** characters:

| Role | Count | Description |
|------|-------|-------------|
| **Contrarians** | k >= 2 | Complementary expertise, opposing philosophies |
| **Surface Advocate** | 1 | **Mandatory.** FCD-specific character (see below) |
| **Leader / Mediator** | 1 | Neutral facilitator, escalates to PO |

### The Surface Advocate (Mandatory)

```
[Name] — Surface Advocate
Expertise: FCA port interfaces, ECD co-design dynamics, boundary enforcement
Conviction: "Every decision that creates, modifies, or crosses a domain boundary
             is a surface decision. Surfaces must be co-designed before implementation."
Blind spot: May over-index on surface purity at the expense of shipping speed
Voice: Precise, structural, references the composition theorem
MBTI: INTJ (Ni-Te-Fi-Se) — pattern-matching across domains, principled resistance

Behavioral rules:
1. When any character proposes an architecture: "Which domains does this touch?
   What ports are needed between them? Are those ports frozen?"
2. When a proposal would create a new cross-domain dependency: flag it immediately.
   "That creates a dependency from {A} to {B}. There's no port for this. Define
   the surface before deciding the architecture."
3. When a proposal would modify an existing port: "That's a breaking change to
   {PortName}. Both sides must agree. This needs a co-design event."
4. When the council reaches consensus on architecture: verify surface implications.
   "Before we finalize: the agreed approach requires {N} new surfaces. Are we
   committing to define those in Wave 0?"
5. Apply the composition theorem: "Fixing the port is worth more than fixing the
   architecture. If we have to choose, get the surface right."
```

**Anti-capitulation:** If the PO tries to remove the Surface Advocate:
> *"The Surface Advocate is mandatory in FCD debates. Architectural decisions without surface analysis produce the coupling that co-design is designed to prevent. The advocate stays."*

### Remaining Characters

Design contrarians tailored to the problem. Common archetypes:

- **Velocity Champion** (ENTP) — ship fast, iterate, pragmatic
- **Quality Guardian** (ISTJ) — rigorous, evidence-based, failure-mode focused
- **Domain Expert** — deep knowledge of the specific business domain
- **User Advocate** (ISFP) — experience-first, empathy-driven
- **Security Hardliner** (INTJ) — threat models, attack surfaces, trust boundaries

Ensure cognitive diversity: at least one divergent-explorer ("what if we tried...") and one convergent-pruner ("here's why that won't work").

### Character Card Format

```
[Name] — [Role]
Expertise: <domain>
Conviction: <one sentence they defend under pressure>
Blind spot: <what they systematically underweight>
Voice: <2-3 word style descriptor>
MBTI: <type> (<stack>) — <reasoning style>
```

Present cast, then ask:
> *"Any changes to the lineup before we begin?"*

---

## Phase 3 — Session Loop

### Rules for Characters

- Contrarians push back with **specific arguments**, not vague disagreement
- Characters build on, counter, or synthesize — no repeating positions without addressing counter-arguments
- Position updates must name the argument that changed their mind
- Each turn resolves at least one (Character, Question) pair

### Rules for the Surface Advocate

In addition to standard character rules:

1. **Surface impact analysis on every proposal.** When any character proposes a solution, the Surface Advocate evaluates: does this create, modify, or cross a domain boundary?

2. **Port inventory.** Maintains a running list of ports that the debated solution would require. Updates it as the discussion evolves.

3. **Co-design flag.** When a proposal would require a new port or modify an existing one, the Advocate flags it:
   > *"[Advocate]: This proposal requires a new surface between {A} and {B}: {description}. Adding to the port inventory. This needs a `/fcd-surface` session before implementation."*

4. **Composition theorem check.** When the council is converging on a solution, the Advocate applies the priority hierarchy:
   > *"[Advocate]: Before we finalize — let me check the surface implications. The proposed solution has {N} port dependencies. Port correctness on these is worth more than optimizing the internal architecture. Are the port contracts clear enough to freeze?"*

5. **Wave 0 readiness.** In the final round, the Advocate produces:
   > *"[Advocate]: Surface summary for this decision:*
   > *- New ports needed: {list}*
   > *- Existing ports modified: {list}*
   > *- Entity types affected: {list}*
   > *- Recommended Wave 0 items: {list}*
   > *These must be co-designed and frozen before implementation starts."*

### Rules for the Leader

- Summarize debate state periodically
- When contrarians reach impasse, identify the exact question they need answered
- Escalate to PO when: (a) external context needed, (b) information lacking, (c) final call required
- Monitor for position repetition — flag and require new arguments or final declaration
- Detect diminishing returns — halt if turns aren't generating new arguments

---

## Phase 4 — Decision + Surface Implications

### 4.1 — Resolution

The Leader synthesizes the council's conclusion:

```markdown
## Decision: {what was decided}

### Arguments For
{strongest arguments from the winning position}

### Arguments Against (Acknowledged)
{strongest counter-arguments — not dismissed, acknowledged}

### Surface Implications (from Surface Advocate)
- **New ports:** {list with producer/consumer}
- **Modified ports:** {list with breaking-change assessment}
- **Entity types:** {new or modified canonical types}
- **Wave 0 items:** {what must be defined before implementation}
- **Co-design sessions needed:** {list of `/fcd-surface` invocations}

### Open Questions
{anything unresolved — explicitly listed, not silently dropped}
```

### 4.2 — Decision-to-Surface Tracing

Every decision that affects a cross-domain surface produces a trace:

| Decision | Surface Impact | Action |
|----------|---------------|--------|
| {decision} | New port: {name} between {A} and {B} | `/fcd-surface {A} {B} {description}` |
| {decision} | Modified entity: {type} | Update canonical types package |
| {decision} | New gate: G-{type} | Add to architecture.test.ts |

This table feeds directly into `/fcd-plan` Wave 0 content.

---

## Phase 5 — Artifact & Memory

### 5.1 — Write Decision Artifact

Write to `.method/sessions/fcd-debate-{slug}/decision.md`:

```markdown
---
type: council-decision
topic: "{topic}"
date: "{YYYY-MM-DD}"
cast: [{character names}]
surface_advocate: "{name}"
ports_identified: [{list}]
---

{Resolution from Phase 4}
```

### 5.2 — Update Council Memory

Save/update topic memory in `.method/council/memory/` per CMEM-PROTO lifecycle.

### 5.3 — Present Summary

> *"Council resolved: {decision summary}.*
> *Surface Advocate identified {N} new ports, {M} port modifications, {K} entity changes.*
> *{N} co-design sessions (`/fcd-surface`) recommended before implementation.*
> *Decision artifact at {path}."*

---

## Anti-Capitulation Rules

1. **Surface Advocate is mandatory.** Cannot be removed, cannot be silenced, cannot be overruled on surface identification (only on solution preference).

2. **Every proposal gets surface analysis.** No proposal is finalized without the Advocate's port inventory check.

3. **Decisions that affect surfaces require co-design traces.** The decision artifact must list every `/fcd-surface` session needed. These are commitments, not suggestions.

4. **The Advocate's port inventory is part of the output.** Even if the council doesn't resolve the main question, the surface implications are captured.

5. **Composition theorem is the tiebreaker.** When two solutions are otherwise equal, prefer the one with fewer/simpler shared surfaces. Simpler surfaces = less co-design overhead = lower drift risk.

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation |
| `fcd-design` | Invoked from Phase 4 for contentious architectural decisions |
| `fcd-surface` | Advocate's port inventory generates `/fcd-surface` action items |
| `fcd-plan` | Surface implications feed Wave 0 content |
| `fcd-govern` | Governance may invoke debates for strategic decisions (planned) |

**Lifecycle position:**

```
fcd-design / fcd-plan ──→ [fcd-debate] ──→ fcd-surface (for identified ports) ──→ ...
```
