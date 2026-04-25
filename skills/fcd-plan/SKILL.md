---
name: fcd-plan
description: >
  Decompose a PRD into FCA-partitioned commissions with mandatory Wave 0 (surfaces),
  topological ordering, and surface-to-wave mapping. The key FCD addition: Wave 0 is
  non-negotiable — all shared surfaces must be defined and frozen before any implementation
  wave begins. Supersedes forge-plan.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-plan [path to PRD or spec]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[path to PRD file, spec file, or GitHub issue number]"
fcd-lifecycle: plan
fcd-order: 5
---

# fcd-plan — Surface-First Commission Decomposition

> *"Wave 0 is always surfaces. Everything else threads through them."*

Takes a PRD and decomposes it into executable commissions along FCA domain boundaries.
The key FCD addition over forge-plan: **Wave 0 is mandatory and contains ALL shared surface
definitions** — port interfaces, canonical entities, gate assertions. No implementation wave
starts until its consumed surfaces are frozen.

```
PRD → Load & Survey → Decompose → Surface Enumeration & Co-Design →
  Topological Ordering → Wave Construction (Wave 0 mandatory) →
  Commission Cards → Verify Plan → Present to PO
```

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**Core principles:**
1. **FCA boundaries are commission boundaries.** One commission = one domain.
2. **Shared surfaces are orchestrator-owned.** Commissions never modify ports, types, or config.
3. **Wave 0 is non-negotiable.** All surfaces frozen before any implementation wave.
4. **Topological order, not chronological.** Dependencies drive sequencing, not PRD phase numbers.
5. **The plan is a DAG, not a list.** Independent work streams become parallel tracks.
6. **Commission scope is explicit.** Every commission has allowed_paths + forbidden_paths.
7. **The plan never writes code.** It produces cards, waves, and surface protocols.

---

## When to use

- PRD with multiple phases or deliverables spanning different FCA domains
- Work too large for a single `/fcd-commission` (> 5 tasks, multiple packages)
- You want conflict-free parallel execution with explicit shared surface management

## When NOT to use

- Single-domain PRDs with < 5 tasks — use `/fcd-commission` directly (solo mode)
- PRDs with no phases or acceptance criteria — stabilize via `/fcd-design` first
- Greenfield with no domain structure — use `/fcd-card` to establish domains first

---

## Phase 0 — Initialize

### 0.1 — Load PRD

Read the PRD at `$ARGUMENTS`. Extract into working memory:

| Field | Extract |
|-------|---------|
| Objective | What the PRD achieves |
| Phases | Each phase with deliverables and exit criteria |
| Success criteria | Numbered list — these become acceptance gates |
| Domains affected | Which FCA domains or packages change |
| Dependencies | Between phases (what blocks what) |
| Co-designed surfaces | Port interfaces from `fcd-design` Phase 3 (if the PRD came from fcd-design) |

**Hard gate:** If the PRD has no phases or no acceptance criteria:
> *"This PRD has no {phases|acceptance criteria}. I need both to plan. Add them first."*

Do NOT proceed. Do NOT fabricate phases or criteria.

### 0.2 — Load Project Card

Read `.method/project-card.yaml`. Extract: essence, build/test/lint commands, layer stack, packages, delivery rules.

### 0.3 — FCA Domain Survey

Enumerate the project's domain structure:

```bash
ls packages/*/src/domains/ 2>/dev/null     # domains
ls packages/*/src/ports/*.ts 2>/dev/null   # ports
ls packages/*/src/shared/ 2>/dev/null      # shared utilities
```

Produce an **FCA partition map**:

```
Domains (independent — commissionable in parallel):
  - sessions/     → owns: {files and concerns}
  - strategies/   → owns: {files and concerns}

Shared surfaces (orchestrator-owned):
  - ports/*.ts, shared/*.ts, */index.ts, package.json, tsconfig.json

Layer stack: L{N} → L{N-1} → ... → L0
```

### 0.4 — Session & Resumption

Create session: `.method/sessions/fcd-plan-{YYYYMMDD}-{HHMM}-{prd-slug}/`

Check for existing plan. If found: *"Found in-progress plan. Resume or start fresh?"*

**Exit gate (sigma_0):** PRD loaded with phases + criteria. Project card loaded. FCA partition map produced.

---

## Phase 1 — Decompose

Map PRD phases/deliverables to FCA domains, producing raw commission entries.

### 1.1 — Walk Each PRD Phase

For each phase, read deliverables, identify owning domain, group by domain. Each domain group becomes a candidate commission.

### 1.2 — Apply the 6 Decomposition Rules

**Rule 1:** One commission per FCA domain — never cross domains in a single commission.
**Rule 2:** Leaf domains before hub domains (topological order).
**Rule 3:** Shared surfaces are orchestrator-owned — extract to surface protocol.
**Rule 4:** Commission scope = allowed_paths + forbidden_paths (explicit, enforced).
**Rule 5:** Commission ACs traceable to PRD success criteria.
**Rule 6:** Cross-domain deliverables spawn multiple commissions with shared surface between them.

### 1.3 — Size Check

Target: **3-8 tasks** per commission. If > 8: split into sequential commissions in the same domain. If < 3: keep if it's the only work in that domain.

### 1.4 — Write Raw Commission List

**Exit gate (sigma_1):** Every deliverable assigned to a commission or surface protocol. No cross-domain commissions. Sizes within bounds.

---

## Phase 2 — Surface Enumeration & Co-Design

> **The FCD-critical phase.** This is where Wave 0 content is determined.

### 2.1 — Cross-Commission Dependency Scan

For each commission pair: does C-j need a type C-i produces? A port C-i implements? If yes: record the dependency and the shared surface.

### 2.2 — Enumerate All Shared Surfaces

Produce a catalog:

| Surface | Type | Change | Producers | Consumers | Status |
|---------|------|--------|-----------|-----------|--------|
| `{name}` | port / entity / config / barrel | {what changes} | C-{N} | C-{M} | frozen / needs-co-design / new |

### 2.3 — Check Existing Co-Design Records

Glob `.method/sessions/fcd-surface-*/record.md` AND `.method/sessions/forge-surface-*/record.md` for matching surfaces.

- **Frozen records found** → reuse. Surface goes to Wave 0 as "apply frozen interface."
- **Draft/unfrozen records found** → flag for `/fcd-surface` completion before planning proceeds.
- **No record** → new surface, must be co-designed.

### 2.4 — Co-Design Missing Surfaces

For each surface with status `new` or `needs-co-design`:

**If simple (< 10 lines):** Define inline. Name it, type it, assign producer/consumer, freeze it. Record in the plan.

**If medium/complex (>= 10 lines):** Invoke `/fcd-surface` for the full co-design ritual. The plan pauses until the surface is frozen.

**Anti-capitulation:** Never proceed to Phase 3 with unfrozen surfaces:
> *"Surface `{name}` between {A} and {B} is not yet frozen. Define and freeze it before planning implementation waves. Invoke `/fcd-surface {A} {B}`."*

### 2.5 — Wave 0 Content Assembly

Collect everything that goes into Wave 0:

- All port interface files (new or modified)
- All shared entity types (new or modified in canonical types package)
- All gate assertion additions to architecture tests
- All barrel export updates
- All config changes needed by multiple commissions

**Every item must have a verification:** `{build_command}` passes, TypeScript compiles, existing tests pass.

**Exit gate (sigma_2):** All shared surfaces frozen. Wave 0 fully defined. No unfrozen surfaces remain.

---

## Phase 3 — Topological Ordering

### 3.1 — Build the Dependency DAG

For each commission: `depends_on` (data/interface dependencies) and `independent_of`. PRD phase numbers do NOT imply dependencies — only data/interface needs count.

### 3.2 — Detect Cycles

If cycle exists:
> *"Dependency cycle: C-{A} → ... → C-{A}. Options: (1) introduce a port that breaks the cycle, (2) merge if same domain, (3) redesign."*

Do NOT proceed with a cyclic plan.

### 3.3 — Compute Topological Order

Kahn's algorithm. Levels naturally form wave boundaries.

### 3.4 — Priority Within Equivalent Nodes

When multiple commissions share a topological level: downstream unblock count > commission size > AC complexity.

**Exit gate (sigma_3):** DAG acyclic. Topological order computed. Every commission's dependencies precede it.

---

## Phase 4 — Wave Construction

### 4.1 — Wave Assignment

**Wave 0:** Always shared surface preparation (orchestrator-only, no commissions). Content from Phase 2.5.

For subsequent waves: take commissions whose dependencies are satisfied by previous waves. **Verify: no two commissions in the same wave touch the same domain.**

### 4.2 — Same-Domain Conflict Resolution

Two commissions in the same domain → different waves, sequential.

### 4.3 — Inter-Wave Surface Changes

If a commission in Wave N produces output that a Wave N+1 commission needs as a shared surface change:
- The orchestrator applies the surface change between waves
- This is NOT a Wave 0 item — it's a between-wave surface update
- It still requires the surface to be frozen (from Phase 2) — the implementation just fills in the concrete data

### 4.4 — Wave Summary Table

| Wave | Commissions | Domains | Surface Prep |
|------|------------|---------|-------------|
| 0 | — (orchestrator) | — | {all frozen surfaces: ports, types, gates} |
| 1 | C-1, C-2 | sessions, cli | — |
| 2 | C-3 | strategies | {inter-wave surface updates if any} |

**Exit gate (sigma_4):** Every commission in a wave. No same-domain parallel. Wave 0 defined and non-empty.

---

## Phase 5 — Commission Card Generation

### 5.1 — Card Structure

```yaml
- id: C-{N}
  phase: {PRD phase}
  title: "{description}"
  domain: "{FCA domain}"
  wave: {N}
  scope:
    allowed_paths:
      - "packages/{pkg}/src/domains/{domain}/**"
    forbidden_paths:
      - "packages/*/src/ports/*"
      - "packages/*/src/shared/*"
      - "packages/*/src/index.ts"
      - "packages/*/package.json"
  depends_on: [C-{M}]
  parallel_with: [C-{K}]
  consumed_ports:              # FCD addition: explicit port dependencies
    - name: "{PortName}"
      status: frozen
      record: ".method/sessions/fcd-surface-{slug}/record.md"
  produced_ports:              # FCD addition: what this commission implements
    - name: "{PortName}"
  deliverables: ["{file}"]
  documentation_deliverables: ["{domain}/README.md — {update}"]
  acceptance_criteria: ["{criterion} → PRD AC-{N}"]
  estimated_tasks: {N}
  branch: "feat/{prd-slug}-c{N}-{short-desc}"
  status: pending
```

### 5.2 — Scope Enforcement

`forbidden_paths` always includes all shared surfaces. Additional: other domains' directories.

### 5.3 — Port Traceability (FCD addition)

Every commission card lists:
- `consumed_ports`: ports it depends on, with frozen status and co-design record path
- `produced_ports`: ports it implements

This enables `fcd-commission` Phase 0 (port-freeze pre-check) to verify all consumed ports exist and are frozen before implementation starts.

### 5.4 — AC Traceability

Every commission AC must trace: Commission AC → PRD Success Criterion. Flag untraceable criteria.

### 5.5 — Documentation Deliverables

Structural changes require README updates. Deletions require reference removal. Flag missing doc deliverables.

**Exit gate (sigma_5):** Every commission has a complete card with scope, traceable criteria, port dependencies, and branch name.

---

## Phase 6 — Verify Plan

### 6.1 — Structural Checks

| Check | Pass Condition |
|-------|---------------|
| Single-domain commissions | Every commission touches exactly one domain |
| No wave domain conflicts | No wave has two commissions in the same domain |
| DAG acyclicity | No dependency cycles |
| Surface enumeration | Every cross-commission dep has a named, frozen surface |
| Scope completeness | Every commission has non-empty allowed + forbidden paths |
| Criteria traceability | Every commission AC traces to a PRD criterion |
| PRD coverage | Every PRD success criterion maps to at least one commission |
| Task count bounds | Every commission has 3-8 estimated tasks |
| **Wave 0 non-empty** | Wave 0 has at least one surface artifact (FCD addition) |
| **All consumed ports frozen** | Every commission's consumed_ports have status: frozen (FCD addition) |

### 6.2 — Completeness Checks

No orphan deliverables. No orphan criteria. Branch names unique. Documentation coverage.

### 6.3 — Risk Assessment

Critical path length, largest wave, surface change count, new port count.

**Mandatory check for new CI/test gates against existing codebases:** if the plan introduces a new gate (script, lint rule, scanner) that scans existing code paths, ASK before sealing the plan: "has the audit been run? what's the preexisting-violation count?"

- **Audit count = 0:** ship gate as full-scope (any violation fails).
- **Audit count > 0:** gate MUST be diff-scoped by default (only flags violations in PR-modified files), OR must ship with an explicit grandfather list that has a calibrated TTL/owner. **Do NOT ship a full-scope gate against a non-zero baseline** — it will fail the gate's own PR plus every unrelated PR until the baseline is cleaned, blocking the whole repo. Diff-scoped gates also degrade gracefully: modifying a grandfathered file drags its violations into scope at the right moment (when the author is already editing).

The risk-assessment column should explicitly call out: "this is a new gate against an existing codebase — diff-scoped or grandfather list required."

### 6.4 — Verification Report

```markdown
| Gate | Status |
|------|--------|
| Single-domain | PASS/FAIL |
| No wave conflicts | PASS/FAIL |
| DAG acyclic | PASS/FAIL |
| Surfaces enumerated | PASS/FAIL |
| Scope complete | PASS/FAIL |
| Criteria traceable | PASS/FAIL |
| PRD coverage | PASS/FAIL |
| Task bounds | PASS/FAIL |
| Wave 0 non-empty | PASS/FAIL |
| All ports frozen | PASS/FAIL |

Overall: {N}/10 gates pass
```

**Exit gate (sigma_6):** All 10 gates pass. Risk assessed.

---

## Phase 7 — Write & Present Plan

### 7.1 — Write Realization Plan

Write to `.method/sessions/{session_id}/realize-plan.md`:

```markdown
# Realization Plan — {PRD title}

## PRD Summary
{objective, success criteria}

## FCA Partition
| Commission | Domain | Wave | Title | Depends On | Consumed Ports |
|------------|--------|------|-------|------------|---------------|

## Wave 0 — Shared Surfaces (Mandatory)
{Every port interface, entity type, and gate assertion the orchestrator applies before Wave 1}

### Port Interfaces
{list with co-design record references}

### Entity Types
{canonical type additions/modifications}

### Gate Assertions
{architecture test additions}

### Verification
{build + type-check + existing tests pass after Wave 0 applied}

## Wave 1 — {title}
- C-1: {title} (domain)
- C-2: {title} (domain)

## Wave 2 — {title}
- C-3: {title} (domain)

## Commission Cards
{one card per commission, with consumed_ports and produced_ports}

## Acceptance Gates
{from PRD, mapped to commissions}

## Status Tracker
Total: {N} commissions, {M} waves (including Wave 0)
Completed: 0 / {N}
```

### 7.2 — Present to PO

> *"Realization plan: {M} commissions across {K} waves.*
> *Wave 0: {N} surfaces (ports, types, gates) — applied before implementation starts.*
> *Wave 1 ({count}): {titles}. Wave 2 ({count}): {titles}.*
> *All consumed ports frozen. {N} acceptance gates.*
> *Execute with: `/fcd-commission --orchestrate {plan path}`*
> *Proceed?"*

**Exit gate (sigma_7):** Plan written, presented, PO approved.

---

## Anti-Capitulation Rules

1. **Never skip Wave 0.** Even if there's only one surface change, it goes in Wave 0. *"Wave 0 is the fabric. Skipping it means implementation starts against assumptions."*

2. **Never allow a commission to modify shared surfaces.** That is orchestrator work.

3. **Never proceed with unfrozen surfaces.** If a surface is `needs-co-design`, invoke `/fcd-surface` before continuing. *"An unfrozen surface means both sides will implement against different assumptions."*

4. **Never produce commissions with open-ended scope.** Explicit allowed_paths and forbidden_paths.

5. **Never serialize independent work.** If commissions touch different domains with no data dependency, they're parallel.

6. **Refuse to plan a PRD with no phases or acceptance criteria.** No fabrication.

7. **Never plan without port traceability.** Every commission's consumed_ports must reference frozen co-design records. *"If you can't point to the frozen interface, the commission will discover it doesn't exist during implementation."*

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation |
| `fcd-design` | Upstream — PRDs from fcd-design include frozen surfaces from Phase 3 |
| `fcd-surface` | Invoked in Phase 2.4 for complex surfaces needing co-design |
| `fcd-commission` | Downstream — orchestrated mode consumes and executes the plan |
| `fcd-card` | Commission cards reference layer stack cards for new components |
| `fcd-review` | Post-execution review |
| `fcd-debate` | Council decisions with surface implications may generate additional Wave 0 items |
| `fcd-health` | Post-execution health check (planned) |

**Lifecycle position:**

```
... ──→ fcd-design ──→ [fcd-plan] ──→ fcd-commission ──→ fcd-review ──→ ...
```
