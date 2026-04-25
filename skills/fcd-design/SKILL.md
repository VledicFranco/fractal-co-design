---
name: fcd-design
description: >
  Design a complete PRD through surface-first architecture. The key ECD inversion: domains
  are identified first, shared surfaces (ports) are co-designed second, internal architecture
  follows third — constrained by the frozen ports. Discovery → Domains → Surfaces →
  Architecture → Phases. Supersedes forge-design and design-prd.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-design [problem description or feature name]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[problem description, feature name, file path, or GitHub issue number]"
fcd-lifecycle: specify
fcd-order: 4
---

# fcd-design — Surface-First PRD Design

> *"Surfaces drive architecture. Not the other way around."*

Designs a complete PRD through the FCD lens: discovery first, then domain identification, then shared surface definition, then internal architecture — constrained by the frozen ports. The key inversion from traditional design: surfaces are the **main design deliverable**, not a step within architecture.

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**When to use:**
- Multi-phase feature or product requiring coordinated design
- Work that touches 3+ domains (escalated from `/fcd-card`)
- New system or major refactor requiring architectural decisions
- Any work requiring a PRD before implementation

**When NOT to use:**
- Single component within one domain → use `/fcd-card`
- Defining one specific port between known domains → use `/fcd-surface`
- Already have a PRD and need to decompose it → use `/fcd-plan`

---

## Phase 0 — Initialize

### 0.1 — Load Context

Read (extract key fields):
1. **CLAUDE.md** — project structure, domain list, delivery rules
2. **Project card** (`.method/project-card.yaml`) — essence, source layout, packages
3. **Existing architecture** — domain directories, port interfaces, gate tests
4. **Prior sessions** — check `.method/sessions/fcd-design-{slug}/` for resumption

### 0.2 — Parse Input

- Problem description → use as discovery starting point
- Feature name → identify scope and affected domains
- File path → read as spec input
- GitHub issue → fetch and parse
- Empty → ask: *"What are you trying to build or solve? Describe the problem, not the solution."*

### 0.3 — Resumption Check

If `.method/sessions/fcd-design-{slug}/prd.md` exists, parse it and resume from the first incomplete phase.

**Exit gate (sigma_0):** Context loaded, input parsed, session created or resumed.

---

## Phase 1 — Discovery

> Understand the problem before proposing solutions. This phase is about the WHAT and WHY.

### 1.1 — Problem Statement

> *"What problem does this solve? Who has the problem? What happens if we don't solve it?"*

Write a 2-3 sentence problem statement. No solution language.

### 1.2 — Constraints

> *"What constraints exist? (time, tech, team, dependencies, backwards compatibility)"*

### 1.3 — Success Criteria

> *"How will we know this worked? Name 2-3 measurable outcomes."*

### 1.4 — Scope Boundaries

> *"What is explicitly OUT of scope? What adjacent problems are we NOT solving?"*

**Anti-capitulation:** If scope is vague or unbounded: *"A PRD without scope boundaries will grow until it collapses. Name at least one thing you're NOT doing."*

### 1.5 — Research Questions (if needed)

If the problem domain is unfamiliar, list questions that must be answered before design can proceed. Research these now — read code, grep patterns, check existing implementations.

**Exit gate (sigma_1):** Problem stated, constraints listed, success criteria defined, scope bounded.

---

## Phase 2 — Domain Identification

> This is the FCD inversion point. Traditional design jumps to architecture here. FCD identifies WHICH DOMAINS are involved first — because this determines where the surfaces are.

### 2.1 — Affected Domains

> *"Which existing domains does this work touch?"*

List each domain with:
- What changes in that domain (new component, modification, extension)
- Whether the domain's boundary shifts (new ports, new entities)

### 2.2 — New Domains

> *"Does this work require a new domain? What concepts would cohere in it?"*

A new domain is warranted when:
- The concepts don't belong in any existing domain
- Putting them in an existing domain would violate its invariant
- The work introduces a genuinely new ontological cluster

**Anti-capitulation:** If the answer is "new domain" without clear ontological justification: *"What concepts cohere here that don't fit in {existing domain}? A new domain is expensive — it creates new boundaries that need ports. Justify it."*

### 2.3 — Domain Map

Produce a visual or textual map showing:
- All affected domains (existing + new)
- Which pairs of domains need to communicate for this work
- **Each arrow is a potential surface that needs co-design**

```
Domain A ──→ Domain B    (new surface needed)
Domain A ──→ Domain C    (existing port sufficient)
Domain B ──→ Domain D    (existing port needs extension)
```

**Exit gate (sigma_2):** All affected domains identified, cross-domain interactions mapped, each interaction classified (new / existing / extension).

---

## Phase 3 — Surface Definition

> **This is the main design deliverable.** Not architecture — surfaces. The frozen ports from this phase constrain everything in Phase 4.

### 3.1 — Enumerate Required Surfaces

From the domain map (Phase 2.3), list every cross-domain interaction that needs a new or extended port.

### 3.2 — Co-Design Each Surface

Classify each surface by complexity, then apply the appropriate protocol:

**TRIVIAL (< 3 methods, unidirectional, both sides obvious):** Define inline in 1 paragraph — name, typed interface, producer/consumer, freeze. No separate session needed.

**STANDARD (3-10 methods, or bidirectional):** Use the compressed inline protocol:
1. Name + scope (fcd-surface Phase 1)
2. Write typed interface (fcd-surface Phase 2)
3. **Consumer-usage minimality check** — for each method, verify the consumer's code path actually calls it. Remove speculative methods. (See fcd-surface 2.4 for rationale.)
4. Freeze the contract (fcd-surface Phase 4)
Record the interface and freeze in the PRD. Gate assertions collected at end of Phase 3.

**Concrete example (STANDARD inline):**

> **Surface: `ProjectLookupPort`** — tasks domain needs to verify a project exists before creating a task.
>
> Owner: projects | Consumer: tasks | Direction: projects → tasks
>
> ```typescript
> export interface ProjectLookupPort {
>   /** Check if a project exists. Consumer only needs boolean — not the full entity. */
>   exists(projectId: string): Promise<boolean>;
> }
> ```
>
> *Minimality note: `getProject(): Promise<Project | null>` was considered but the consumer only checks existence. Returning the full entity would leak the projects domain's internal type and create unnecessary coupling. If tasks later needs project details, that's a new surface co-design.*
>
> Gate: G-BOUNDARY — tasks imports from `ports/project-lookup.ts`, never from `domains/projects/`.
> Status: **frozen**.

**COMPLEX (> 10 methods, breaking change, novel pattern):** Invoke `/fcd-surface` as a **separate session**. The design session pauses for this surface and resumes when the co-design record shows `status: frozen`.

**Scaling rule:** If the PRD requires > 3 surfaces, batch the STANDARD/COMPLEX ones as separate `/fcd-surface` sessions rather than inlining them all. Resume fcd-design at Phase 3.4 once all records exist. This prevents context exhaustion.

The key requirement: **every surface must be typed, frozen, and have a gate assertion before Phase 4 begins.**

### 3.3 — Entity Identification

> *"What shared entities does this work introduce or modify?"*

For each entity:
- Does a canonical definition already exist in the shared types package?
- If not, define the canonical type and note which domains will consume it
- If yes, does it need extension? (new fields, new variants)

**Anti-capitulation:** If entities are defined inline in a domain without checking the shared types package: *"Is `{Entity}` already defined canonically? Check before creating a local definition — that's how drift starts."*

### 3.4 — Surface Summary

Present all surfaces in a table:

| Surface | Owner | Producer → Consumer | Status | Gate |
|---------|-------|--------------------| -------|------|
| `{PortName}` | Domain A | A → B | frozen | G-BOUNDARY |
| `{EventName}` | Domain B | B → C | frozen | G-BOUNDARY |

**Exit gate (sigma_3):** All cross-domain surfaces defined, typed, and frozen. All shared entities canonically defined. Gate assertions ready. **This is the primary deliverable of the PRD.**

---

## Phase 4 — Per-Domain Architecture

> Now — and only now — design the internal architecture of each affected domain. Each domain's architecture is **constrained by the frozen ports from Phase 3**.

### 4.1 — For Each Affected Domain

Produce a domain-level design covering:

- **Layer placement** — what FCA level (L0-L5) for each new component?
- **Internal structure** — directory layout, module boundaries
- **Port implementations** — how will this domain implement the ports it produces?
- **Port consumption** — how will this domain inject the ports it consumes?
- **Verification strategy** — what tests, what gates?
- **Migration path** (if modifying existing code) — incremental steps, backwards compatibility

### 4.2 — Architecture Gate Plan

For each domain, define which gates must pass:
- G-PORT, G-BOUNDARY, G-LAYER (standard)
- G-ENTITY (if shared types package exists)
- Domain-specific gates (if any)

### 4.3 — Layer Stack Cards

For each new component, produce a `/fcd-card` (or inline the 5 questions). Cards reference the frozen ports from Phase 3 — Q2 (Ports) should be trivially answerable because the surfaces are already defined.

**Exit gate (sigma_4):** All domains have internal architecture defined. All new components have layer stack cards. All gates planned.

---

## Phase 5 — Phase Plan

> Sequence the work. ECD mandates: surfaces first (Wave 0), implementation after.

### 5.1 — Wave 0: Surfaces

**Always the first wave.** Contains:
- Shared types package updates (new entities)
- Port interface files (from Phase 3 co-design records)
- Gate assertion additions to `architecture.test.ts`
- Canonical template adoption (if needed)

Wave 0 changes no business logic. It creates the fabric.

### 5.2 — Subsequent Waves

Decompose the remaining work by domain:
- Each wave targets one domain (or independent domains in parallel)
- No wave implements against a port that wasn't frozen in Wave 0
- Dependencies between waves are explicit in the DAG

### 5.3 — Acceptance Gates

For each wave, define:
- What tests must pass
- What gates must be green
- What the definition of "done" is (domain delivery, not service delivery)

### 5.4 — Risk Assessment

Identify:
- Which surfaces are most likely to need revision (breaking change risk)
- Which domains have the highest implementation uncertainty
- What the fallback is if a domain's architecture doesn't work

**Exit gate (sigma_5):** Phase plan with Wave 0 (surfaces) + subsequent waves. All waves have acceptance gates. Dependencies explicit.

---

## Phase 6 — PRD Artifact

### 6.1 — Write the PRD

Write to `.method/sessions/fcd-design-{slug}/prd.md`:

```markdown
---
type: prd
title: "{title}"
date: "{YYYY-MM-DD}"
status: draft
domains: [{list of affected domains}]
surfaces: [{list of co-designed surfaces}]
---

# {Title}

## Problem
{from Phase 1}

## Constraints
{from Phase 1}

## Success Criteria
{from Phase 1}

## Scope
{inclusions and exclusions from Phase 1}

## Domain Map
{from Phase 2}

## Surfaces (Primary Deliverable)
{from Phase 3 — the frozen port definitions, entity types, gate assertions}

## Per-Domain Architecture
{from Phase 4 — constrained by the surfaces above}

## Phase Plan
{from Phase 5 — Wave 0 surfaces + subsequent waves}

## Risks
{from Phase 5}
```

### 6.2 — Present to PO

> *"PRD for {title}:*
> *{N} domains affected | {M} surfaces co-designed and frozen | Wave 0 + {K} implementation waves*
> *Primary deliverable: {M} typed port interfaces that enable parallel implementation.*
>
> *PRD written to {path}. Ready for review or handoff to `/fcd-plan`."*

**Exit gate (sigma_6):** PRD written with all phases populated. Surfaces frozen. Ready for planning.

---

## Anti-Capitulation Rules

1. **Never design architecture before surfaces.** If someone jumps to "how should we build this internally?" before the cross-domain ports are defined: *"Which domains need to talk? What flows between them? Define that first — architecture follows."*

2. **Never allow unfrozen surfaces in Phase 4+.** If a surface is "TBD" or "we'll figure it out during implementation": *"An unfrozen surface means both sides are implementing against assumptions, not agreements. Freeze it now."*

3. **Never skip Wave 0.** Every phase plan must start with a surfaces wave. If the PO wants to "just start coding": *"Wave 0 is 1-2 days of port definitions that prevent weeks of integration debugging. It's the cheapest work with the highest leverage."*

4. **Never let entities drift.** If the design introduces a new business entity, it must be defined canonically before any domain uses it locally. *"Where is the canonical definition of {Entity}? If it doesn't exist yet, define it in the shared types package first."*

5. **Architecture serves surfaces, not vice versa.** If the internal architecture of one domain would require changing a frozen port: *"The port was co-designed with both sides' constraints. If your architecture can't satisfy it, the architecture needs to change — not the port."*

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation — behavioral discipline and reference |
| `fcd-surface` | Invoked in Phase 3 for each cross-domain port |
| `fcd-card` | Phase 4 produces cards for new components; card escalation triggers design |
| `fcd-plan` | Downstream — decomposes the PRD into commissions |
| `fcd-commission` | Executes the plan |
| `fcd-review` | Reviews PRD quality and surface completeness |
| `fcd-debate` | Invoked for contentious architectural decisions |
| `fcd-review` | Reviews PRD quality, surface completeness, and phase correctness |
| `fcd-diagnose` | May trigger design when diagnosis reveals systemic issues (planned) |

**Lifecycle position:**

```
fcd-diagnose ──→ fcd-surface ──→ fcd-card ──→ [fcd-design] ──→ fcd-plan ──→ ...
```
