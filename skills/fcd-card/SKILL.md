---
name: fcd-card
description: >
  Layer stack card for a new component — the lightest specification in the FCD family.
  Answers 5 questions in 20 minutes, structured by the FCD dependency DAG: Tier 1 (Domain,
  Ports) are the primary deliverables, Tier 2-3 (Config, Auth, Observability) follow from them.
  Implements ECD Rule 1: no new service without a complete layer stack proposal.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-card [component name or description]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[component name, service name, or description of what's being built]"
fcd-lifecycle: specify
fcd-order: 3
---

# fcd-card — Layer Stack Card

> *"20 minutes at the start saves hours of debug time."*

The minimum viable specification for a new component. Not a PRD — a 5-question checklist that ensures every new service, package, domain, or frontend app has its layer stack defined before code is written.

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**Key FCD difference from forge-card:** Q1 (Domain) and Q2 (Ports) are the **primary deliverables** — they are Tier 1 (definitional) in the FCD dependency DAG. Q3-Q5 (Config, Auth, Observability) are Tier 2-3 (structural/evidential) — they follow FROM Q1+Q2, not alongside them. If Q1+Q2 are wrong, Q3-Q5 are irrelevant.

**When to use:**
- Starting a new package, service, Lambda, domain, or frontend app
- Adding a new FCA domain to an existing project
- Re-carding an existing component to assess its current state
- Before any `/fcd-commission` that creates new infrastructure

**When NOT to use:**
- Modifying an existing component within its current boundaries → just implement
- Work that warrants a full PRD (multi-phase, cross-domain, migration) → use `/fcd-design`
- Defining a shared surface between two existing domains → use `/fcd-surface`

**Escalation signal:** If answering the 5 questions reveals the component touches 3+ domains, requires migration, or introduces a new layer — stop and invoke `/fcd-design` instead.

---

## Phase 0 — Initialize

### 0.1 — Load Project Context

Read (extract key fields, do not summarize):

1. **CLAUDE.md** — layer stack, domain list, key directories
2. **Existing domain structure** — scan for FCA domains (e.g., `src/domains/` or `packages/`)
3. **Existing ports** — scan `ports/` directory for current port interfaces

### 0.2 — Parse Input

If `$ARGUMENTS` is provided:
- Component name → use as the card subject
- File path → read file, infer component from its location and purpose
- Description → extract component name and intent
- Empty → ask: *"What component are you building? Give me a name and a one-sentence purpose."*

### 0.3 — Detect Mode

- **New component** — no existing files, domain may or may not exist yet
- **Re-card** — component exists; this is an assessment of its current layer stack
- **Detection:** check if `$ARGUMENTS` matches an existing directory or package name

Present mode:
> *"This is a {new component | re-card of existing component}. Proceeding with the 5-question interrogation."*

### 0.4 — Resumption Check

Check if `.method/sessions/fcd-card-{slug}/card.md` exists. If so:
1. Parse it — determine which questions (Q1-Q5) have non-empty answers
2. Present: *"Found an incomplete card for {component}. Q1-Q{N} answered, resuming from Q{N+1}."*
3. Resume from the first unanswered question

If the card exists and all 5 questions are answered, present: *"Card exists and is complete. Re-card to refresh, or view existing?"*

**Exit gate (sigma_0):** Project context loaded, component identified, mode detected, resumption state checked.

---

## Phase 1 — Tier 1: Definitional (PRIMARY DELIVERABLES)

> Per the FCD dependency DAG, these two questions establish WHAT the component IS. Everything else follows from them. Spend 70% of the card time here.

### Q1 — Domain Placement

> *"Which domain does this component belong to?"*

**If the project has an FCA domain structure:** present the existing domains as options. The answer must be one of them, or a proposal for a new domain.

**Anti-capitulation probes:**
- If answer is vague ("it's kind of shared"): *"Shared across what? Name the 2-3 domains. If it's truly cross-cutting, it belongs in `shared/` or `ports/`, not in a domain."*
- If answer is "new domain": *"What concepts cohere in this domain that don't belong in any existing one? Name the ontological cluster."*
- If answer names an existing domain: *"Good. Does this component's responsibility fall within that domain's current invariant, or does it extend it?"*

**For re-card mode:** verify the component IS in the domain its directory says. If not, flag the mismatch.

### Q2 — Port Interfaces

> *"What does this component expose? What does it consume?"*

This is the most important question on the card. Per the composition theorem, Port correctness > Architecture quality. Getting this wrong costs more than getting anything else wrong.

Structure the answer as two lists:

**Exposes (outward):**
- What typed interfaces does this component publish for others to consume?
- What events does it emit?
- What API endpoints does it serve?

**Consumes (inward):**
- What ports does it depend on? (existing port interfaces)
- What external services does it call? (must be through a port, not direct)
- What event types does it subscribe to?

**Anti-capitulation probes:**
- If exposes is empty: *"A component that exposes nothing is invisible. What do other components need from this?"*
- If consumes lists direct dependencies (e.g., "calls the database directly"): *"That's an implementation detail, not a port. What port interface wraps this dependency?"*
- If consumes is empty: *"No dependencies at all? Not even a filesystem, database, or config port? Pure functions are rare — verify this."*
- If a consumed dependency has no existing port: **stop and invoke `/fcd-surface`**: *"There's no port for {dep} yet. This component needs a co-designed surface before it can consume it. Invoking fcd-surface."*

**Exit gate (sigma_1a):** Domain placed, all ports identified, missing ports flagged for fcd-surface. This is the card's primary deliverable — if this is wrong, nothing else matters.

---

## Phase 2 — Tier 2-3: Structural + Evidential

> These questions follow FROM Q1+Q2. They define how the component is built (Tier 2) and how it proves it works (Tier 3). They cannot be answered correctly without Q1+Q2.

### Q3 — Configuration (Tier 2: Structural)

> *"What deployment model, environment variables, and configuration does this component need?"*

Cover:
- **Deployment:** Which template/pattern? (e.g., canonical SAM template, ECS, Vite frontend, npm package)
- **Environment variables:** List each with type, default, and purpose
- **Config schema:** Zod schema or equivalent? Where is it co-located?
- **Deviations:** What differs from the project's canonical setup? Why?

**Anti-capitulation probes:**
- If no env vars listed: *"Zero configuration? No ports, no feature flags, no mode switches? Verify."*
- If deployment model is "TBD" or "whatever works": *"The deployment model determines how this component is tested, monitored, and operated. Pick one now."*
- If deviations exist without justification: *"Deviation from canonical: {what}. Why? If there's no reason, use the canonical setup."*

### Q4 — Auth Tier (Tier 2: Structural)

> *"What authentication model does this component use?"*

Standard tiers (adapt to project):
- **Public** — no authentication required
- **Token-based** — JWT, session token, API key
- **Internal** — service-to-service, no user-facing auth
- **None** — pure library, no auth dimension

**Anti-capitulation probes:**
- If answer is "none" for a service with endpoints: *"This has HTTP endpoints but no auth? That's a security gap. Is it intentionally public?"*
- If answer introduces a new auth mechanism not in the project: *"The project uses {existing mechanisms}. You're proposing {new}. This needs a `/fcd-surface` for the auth port before implementation."*

### Q5 — Observability (Tier 3: Evidential)

> *"What events does this component emit? What alerts should fire on failure?"*

Cover:
- **Events:** What domain events are emitted? (to event bus, logs, or metrics)
- **Structured logging:** What fields are logged per request? (correlation ID, domain-specific fields)
- **Alerts:** What conditions should trigger an alert? (error rate, timeout rate, resource exhaustion)
- **Health check:** Is there a health endpoint? What does it verify?

**Anti-capitulation probes:**
- If events list is empty: *"A component with no observable events is a black box. What state changes should other components or humans know about?"*
- If no alerts defined: *"What failure looks like from outside? If this breaks at 3 AM, what should page someone?"*
- If no health check for a service: *"Services need health checks. What does 'healthy' mean for this component?"*

**Exit gate (sigma_1b):** All 5 questions answered with specific, non-vague content. No question has "TBD" or placeholder content.

---

## Phase 3 — Cross-Reference

### 3.1 — Domain Overlap Check

Compare the component's described responsibility against existing components in the same domain:
- Does this component duplicate functionality that already exists?
- Does it extend an existing component's scope in a way that should be a modification, not a new component?

If overlap found:
> *"This component's {responsibility} overlaps with {existing component} in the same domain. Should this be a modification to {existing} instead of a new component?"*

### 3.2 — Layer Conflict Check

Verify the component sits at the correct FCA layer:
- Does it import from higher layers? (violation)
- Does it depend on lower-layer components correctly? (through ports, not direct imports)
- Is its layer position consistent with its deployment model?

If conflict found:
> *"Layer conflict: this component at L{N} would depend on L{M} (higher). That violates FCA layer discipline. Either move it up or access the dependency through a port."*

### 3.3 — Escalation Assessment

Check whether this card should escalate to `/fcd-design`:
- Component touches 3+ domains → escalate
- Component requires migration from an existing system → escalate
- Component introduces a new FCA layer → escalate
- Component creates 2+ new port interfaces → consider escalation

If escalation warranted:
> *"This component's scope exceeds what a card can specify. Recommend escalating to `/fcd-design` for a full PRD. Reason: {specific trigger}."*

**Exit gate (sigma_2):** No unresolved overlaps, no layer violations, escalation decision made.

---

## Phase 4 — Produce Card

### 4.1 — Card Artifact Format

```yaml
---
type: layer-stack-card
component: "{component name}"
date: "{YYYY-MM-DD}"
mode: "{new | re-card}"
escalate_to_prd: {true | false}
---
```

```markdown
# Layer Stack Card — {component name}

**Purpose:** {one-sentence description}

## Tier 1 — Definitional (Primary)

### Q1 — Domain
- **Domain:** {domain name}
- **Layer:** L{N} ({layer description})
- **New domain:** {yes/no — if yes, ontological justification}

### Q2 — Ports
#### Exposes
- `{PortName}` — {description}
#### Consumes
- `{PortName}` — {description} ({existing | needs fcd-surface})

## Tier 2 — Structural

### Q3 — Configuration
- **Deployment:** {template/pattern}
- **Env vars:**
  - `{VAR_NAME}` — {type} — default: {value} — {purpose}
- **Deviations:** {none | list with justification}

### Q4 — Auth
- **Tier:** {Public | Token | Internal | None}
- **Mechanism:** {specific: JWT, API key, etc.}

## Tier 3 — Evidential

### Q5 — Observability
- **Events:** {list of domain events emitted}
- **Alerts:** {conditions that should page}
- **Health:** {endpoint and what it checks}

## Cross-Reference
- **Overlaps:** {none | list}
- **Layer conflicts:** {none | list}
- **Escalation:** {none | reason for fcd-design}
```

### 4.2 — Write Location

- **New component:** `.method/sessions/fcd-card-{slug}/card.md`
- **Re-card:** same location (overwrites previous card if exists)
- **As PR description:** if `--pr` flag provided, output to stdout for copy-paste

### 4.3 — Present to PO

> *"Layer Stack Card for {component}:*
> *Domain: {domain} (L{N}) | Ports: {N} exposed, {M} consumed | Auth: {tier}*
> *Observability: {N} events, {M} alerts | Escalation: {yes/no}*
>
> *Card written to {path}. Ready for review."*

**Exit gate (sigma_3):** Card artifact written to specified location. All sections populated.

---

## Phase 5 — Verify

### 5.1 — Completeness Check

| Check | Pass Condition |
|-------|---------------|
| Domain specified | Not empty, matches existing domain or justified new domain |
| Ports non-trivial | At least 1 exposed or 1 consumed port named |
| Config explicit | Deployment model named, env vars listed (even if empty list) |
| Auth specified | Tier named, not "TBD" |
| Observability specified | At least 1 event or 1 alert defined |
| No vague terms | Zero instances of: "TBD", "later", "maybe", "probably", "as needed" |

### 5.2 — FCA Compliance Check

| Check | Pass Condition |
|-------|---------------|
| Single domain | Component belongs to exactly one domain |
| Layer correct | No upward dependencies |
| Ports typed | Consumed ports are existing interfaces or flagged for `/fcd-surface` |
| Co-location | Component's files will live within its domain directory |

**Exit gate (sigma_4):** All completeness checks pass. All FCA compliance checks pass. Card is final.

---

## Anti-Capitulation Rules

1. **Never accept "TBD" for any of the 5 questions.** If the PO can't answer a question, the component isn't ready to be built. *"If you don't know which domain this belongs to, you don't know what you're building yet."*

2. **Never accept a component with zero ports.** Every component interacts with something. If the PO claims no ports, they're describing implementation details, not the component's surface.

3. **Never skip the cross-reference.** A new component that duplicates existing functionality wastes effort.

4. **Never approve a card that introduces direct dependencies.** If a consumed port doesn't exist yet, invoke `/fcd-surface` — don't let the component proceed with an untyped dependency.

5. **Flag scope creep to `/fcd-design`.** If answering the 5 questions reveals cross-domain impact, migration needs, or new layer requirements, escalate immediately.

6. **Tier 1 is non-negotiable.** Q1 and Q2 must be answered with full specificity before moving to Q3-Q5. If the PO wants to skip to config or deployment: *"Config follows from domain placement and port contracts. Let's nail those first."*

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation — behavioral discipline and reference |
| `fcd-surface` | Invoked when Q2 reveals a consumed port that doesn't exist yet |
| `fcd-design` | Escalation target when the card reveals cross-domain scope |
| `fcd-plan` | Consumes cards as input for commission card generation |
| `fcd-commission` | Cards are prerequisites for new-component commissions |
| `fcd-health` | Re-card mode is a lightweight version of health checking (planned) |
| `fcd-diagnose` | Diagnosis findings may recommend cards for undocumented components (planned) |

**Lifecycle position:**

```
fcd-diagnose ──→ fcd-surface ──→ [fcd-card] ──→ fcd-design ──→ ...
```
