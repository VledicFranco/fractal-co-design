---
name: fcd-review
description: >
  Adversarial quality review with port-priority lens. Spawns contrarian advisors to attack,
  then synthesizers to defend/sequence — but checks surface compliance FIRST, internal
  architecture SECOND. The FCD inversion: Port correctness > Interface clarity > Architecture
  quality. Includes a mandatory Surface Compliance Advisor in every review cast.
  Supersedes forge-review. Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-review [file path, PR, or artifact to review]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[file path, PR number, or description of what to review]"
fcd-lifecycle: review
fcd-order: 7
---

# fcd-review — Port-Priority Adversarial Review

> *"Check the ports first. A clean Architecture behind a broken port is net-negative."*

End-to-end adversarial review: attack → defend → decide. The FCD addition: reviews follow the **composition theorem priority** — Port correctness before Interface clarity before Architecture quality. Every review cast includes a mandatory **Surface Compliance Advisor**.

```
Artifact → [Phase A: Advisors attack (port-first)] → Review Report
  → [Phase B: Synthesizers defend] → Action Plan (port findings prioritized)
```

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**Modes:**
- **Standard (default):** Full pipeline — advisors + synthesizers
- **Advisors-only (`--advisors-only`):** Just the attack phase
- **Synthesize (`--synthesize`):** Just the defense phase (provide existing review report)

**When to use:**
- After `/fcd-commission` completes — review before merge
- PRD review before planning
- Architecture design review
- Any high-stakes artifact where adversarial critique adds value

**When NOT to use:**
- Trivial artifacts — overhead of 7-9 agents isn't justified
- When only a quick check is needed — just read the code yourself

---

## Phase 0 — Initialize

### 0.1 — Target Identification

Resolve the artifact from `$ARGUMENTS`:
- File path → read the file
- PR number → fetch PR diff and description
- Directory → treat as multi-file review
- Description → ask for specific artifact path

### 0.2 — Surface Context Loading (FCD addition)

Before designing advisors, load surface context:

1. **Co-design records:** Glob `.method/sessions/fcd-surface-*/record.md` for surfaces relevant to the artifact's domain
2. **Frozen ports:** Read port interface files in `ports/` or equivalent
3. **Architecture gates:** Read `architecture.test.ts` for existing assertions
4. **Shared types:** Check if artifact uses canonical types or local redefinitions

This context informs the Surface Compliance Advisor and shapes the review priorities.

**Exit gate (sigma_0):** Artifact loaded. Surface context gathered. Ready for cast design.

---

## Phase A — Advisors (Port-First Attack)

### A.1 — Cast Design

Design 3-5 contrarian advisors. The cast MUST include:

**Mandatory: Surface Compliance Advisor**
```
[Name] — Surface Compliance
Expertise: FCA boundaries, port contracts, entity canonicality
Conviction: "Every cross-domain interaction must go through a co-designed, frozen port"
Blind spot: May flag technically compliant but pragmatically fine boundary crossings
Voice: Precise, structural
Checks:
  - Do cross-domain imports go through ports, not internal files? (G-BOUNDARY)
  - Are external deps accessed through ports? (G-PORT)
  - Are shared types imported from canonical package, not redefined locally? (G-ENTITY)
  - Do produced ports match frozen co-design records?
  - Are consumed ports used as specified in the frozen interface?
  - Does any code unilaterally modify a frozen port contract?
Quality Dimensions (score each 0-5, empirically validated — exp-spl-design):
  - Decomposition (35%): Are the domains the right ones? Do boundaries follow ontological clusters?
  - Port Quality (30%): Are interfaces typed, minimal, well-named? No speculative methods?
  - Documentation (20%): Clear, accurate, useful for a new developer?
  - Surface-First (15%): Were ports defined as the primary deliverable, not derived from architecture?
Port Minimality Check (empirical — LLMs systematically over-specify ports):
  - For each method on a port: does the consumer actually call it?
  - Is the return type the narrowest the consumer needs? (boolean vs full entity)
  - Are there redundant methods? (exists() + getById() when consumer only calls exists())
```

**Remaining advisors (2-4):** Tailored to the artifact's risk surface. Common archetypes:
- **Security Advisor** — injection, auth bypass, secrets exposure
- **Reliability Advisor** — error handling, circuit breakers, failure modes
- **Performance Advisor** — hot paths, unnecessary allocations, N+1 queries
- **Domain Expert** — business logic correctness for the specific domain
- **Test Coverage Advisor** — verification gaps, untested paths

**Anti-capitulation:** If the PO tries to remove the Surface Compliance Advisor: *"The Surface Compliance Advisor is mandatory in FCD reviews. Port correctness is multiplicative — a missed boundary violation affects every consumer. This advisor stays."*

### A.2 — Dispatch Advisors

Launch all advisors as parallel sub-agents. Each advisor receives:
- The artifact under review
- Surface context (co-design records, frozen ports, gate assertions)
- Their specific checklist and conviction

### A.3 — Collect & Report

As advisors complete, collect findings. Produce the **Review Report** with findings sorted by **FCD priority**:

```markdown
# Review Report — {artifact}

## Priority 1: Port & Surface Findings
{Surface Compliance Advisor findings — these are reviewed FIRST}

## Priority 2: Interface Findings
{Findings about public APIs, exported types, naming}

## Priority 3: Architecture Findings
{Internal structure, patterns, code quality}

## Priority 4: Domain-Specific Findings
{Business logic, security, performance, testing}
```

Each finding has:
- ID: `F-{advisor_initial}-{N}`
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- Category: PORT / INTERFACE / ARCHITECTURE / DOMAIN
- Description + evidence
- Suggested fix

**FCD rule:** Port/Surface findings of MEDIUM+ severity automatically escalate to HIGH. A boundary violation is never "just medium" — it affects every consumer.

**Exit gate (sigma_A):** Review Report produced with all findings categorized and prioritized by FCD hierarchy.

---

## Phase B — Synthesizers (Defend & Sequence)

### B.1 — Synthesizer Cast

4 synthesizers with fixed postures:

| Posture | Role |
|---------|------|
| **Defender** | Pushes back on overreach, concedes genuine gaps |
| **Pragmatist** | Accepts valid concerns, proposes lighter fixes |
| **Strategist** | Sequences: fix-now vs defer vs ops-runbook |
| **Integrator** | Merges overlapping findings, spots contradictions |

### B.2 — Dispatch Synthesizers

Each synthesizer gets ALL findings + the original artifact. They assess independently.

### B.3 — Consensus Matrix

Tally votes per finding across synthesizers.

### B.4 — Action Plan (Port-Priority Ordered)

The Action Plan sections follow FCD priority:

```markdown
# Action Plan — {artifact}

## 1. Port & Surface Fixes (Fix Now — Non-Negotiable)
{Boundary violations, port contract breaks, entity drift — these are always Fix Now}

## 2. Interface Fixes (Fix Now or Defer)
{Public API issues — fix if shipping, defer if internal}

## 3. Architecture Improvements (Defer or Acknowledge)
{Internal refactoring — usually defer unless blocking}

## 4. Domain Fixes (By Severity)
{Business logic, security (Fix Now), performance (Defer), testing (Defer)}

## Implementation Checklist
{Ordered by priority — port fixes first}
```

**FCD rule:** Port & Surface findings that reach consensus as "Fix Now" cannot be downgraded to "Defer." A frozen port violation must be fixed before merge. The only exception: if the fix requires a new `/fcd-surface` session (breaking change), it can be deferred to a follow-up PR with the surface session as a prerequisite.

**Exit gate (sigma_B):** Action Plan produced with port-priority ordering. All Fix Now items actionable.

---

## Phase C — Present & Triage

Present summary:

```
**FCD Review Complete**

Phase A: {N} advisors, {M} findings
  Port/Surface: {P} findings ({severities})
  Interface: {I} findings
  Architecture: {A} findings
  Domain: {D} findings

Phase B: Consensus
  Fix Now: {N} ({port fixes first})
  Defer: {N}
  Acknowledge: {N}
  Reject: {N}

Port compliance: {PASS if zero port Fix Now items | FAIL if any}
```

> *"Want to adjust any decisions? Or proceed with fixes (port fixes applied first)?"*

If approved, apply Fix Now items in FCD priority order: ports first, then interfaces, then architecture.

---

## Anti-Capitulation Rules

1. **Surface Compliance Advisor is mandatory.** Never remove, never skip. Port findings are multiplicative.

2. **Port findings at MEDIUM+ automatically escalate to HIGH.** A boundary violation is never "just medium."

3. **Port Fix Now items cannot be downgraded to Defer.** A frozen port violation ships to every consumer. Fix it or schedule a `/fcd-surface` session.

4. **Review in FCD priority order.** Port → Interface → Architecture → Domain. Not the reverse.

5. **Never approve an artifact with G-BOUNDARY violations.** Cross-domain runtime imports are structural failures, not style issues.

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation |
| `fcd-commission` | Upstream — review after commission completes |
| `fcd-surface` | Port findings may trigger new co-design sessions |
| `fcd-health` | Review findings feed domain health assessment (planned) |
| `fcd-govern` | Governance may invoke reviews as part of steering (planned) |
| `fcd-design` | PRD reviews use the same pipeline |

**Lifecycle position:**

```
... ──→ fcd-commission ──→ [fcd-review] ──→ fcd-govern / fcd-health
```
