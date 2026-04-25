---
name: fcd-ref
description: >
  Fractal Co-Design (FCD) — unified reference and behavioral discipline for designing,
  prototyping, and implementing software. Combines FCA (structure) with ECD (process) into
  a single design methodology. When loaded, modifies how the agent approaches all design
  and implementation work: port-first temporal discipline, composition theorem priority,
  surface-before-architecture ordering. Use when designing, reviewing, or implementing
  any software component. The fcd-ref skill is the foundation — all fcd-* lifecycle skills
  depend on it.
user-invocable: true
disable-model-invocation: false
---

# Fractal Co-Design (FCD) Reference

**FCA** (structure) + **ECD** (process) = **FCD** (the complete design discipline).

> *The performance of a software platform is not determined by the quality of its individual services. It is determined by the quality of the surfaces where those services touch each other.*

## What FCD Is

FCD is a design methodology that combines two frameworks:

- **Fractal Component Architecture (FCA)** — structural: one component pattern repeats at every scale. 8 parts, 6 levels, 10 principles. Tells you WHAT a well-formed system looks like. Reference: `fca/`
- **Extreme Co-Design (ECD)** — temporal + organizational: shared surfaces are designed before implementation, with both sides present. Tells you WHEN and HOW to get there. Reference: `ecd/`

Neither is sufficient alone. FCA without ECD produces correct structures that nobody follows (the temporal sequence is implicit). ECD without FCA produces good intentions without structural enforcement (the gates don't exist). FCD is the synthesis.

---

## Quick Reference

### The 8 Parts of Every Component (FCA)

| Part | Direction | Purpose |
|------|-----------|---------|
| Interface | Outward | What consumers interact with |
| Boundary | Outward | Enforces encapsulation |
| Port | Outward | Where external deps are injected |
| Domain | Inward | Concepts that cohere ontologically |
| Architecture | Inward | How component self-organizes |
| Verification | Both | Proven correct in isolation |
| Observability | Both | What it's doing now and has done |
| Documentation | Both | Co-located explanation |

### The Dependency DAG (FCA + ECD)

The 8 parts have a design sequence — not just a list:

```
Tier 1 — DEFINITIONAL (design FIRST)
  Domain ← what is this component about?
  Interface ← what does it expose?
  Port ← what does it depend on?

Tier 2 — STRUCTURAL (design SECOND)
  Boundary ← what can't it see?
  Architecture ← how does it self-organize?

Tier 3 — EVIDENTIAL (design THIRD)
  Verification ← proof it works
  Observability ← runtime signals
  Documentation ← explanation
```

Within each tier, order is flexible. Across tiers, the sequence is mandatory. Architecture that precedes Port definition is architecture built on unverified assumptions.

### The Composition Theorem (FCA + ECD)

```
Port correctness > Interface clarity > Architecture quality

Why: Port errors propagate to every consumer (multiplicative cost).
     Interface ambiguity causes misuse (multiplicative cost).
     Architecture problems are local (additive cost).
```

When reviewing or designing: **check the Port first**. A 10-minute Port review prevents months of distributed debt. A week of Architecture refactoring improves one component.

### The 6 Levels (FCA)

| Level | Unit | Interface | Boundary | Port |
|-------|------|-----------|----------|------|
| L0 | Function | Type signature | Lexical scope | Function parameter |
| L1 | Module | Exported symbols | Module scope | Constructor injection |
| L2 | Domain | `index.ts` + README | Directory boundary | Provider interface |
| L3 | Package | `package.json` + public API | Package boundary | Exported provider interface |
| L4 | Service | HTTP endpoints / OpenAPI | Network boundary | HTTP client, env vars |
| L5 | System | Public SDK | Org boundary | API gateway, OAuth |

### Architecture Gates (FCA + ECD)

| Gate | Enforces | ECD Analog |
|------|----------|-----------|
| **G-PORT** | No direct external dep access in domain code | No bypassing the fabric |
| **G-BOUNDARY** | No cross-domain runtime imports | No direct cross-domain coupling |
| **G-LAYER** | No upward layer dependencies | No dependency inversions |
| **G-ENTITY** | Canonical types, not local redefinitions | No non-standard connector pinouts |

Gates run in CI in < 1 second. They are the tape-out constraint — code that violates a co-designed surface cannot be merged.

---

## Behavioral Discipline

**When this skill is loaded, apply these rules to all design and implementation work:**

### Rule 1 — Port-First Design

Before implementing any component that interacts with other components:
1. Identify which domains are involved
2. Define the Port interfaces between them (typed, explicit)
3. Freeze the ports — both sides agree
4. THEN implement Architecture against the frozen ports

**The port is the first deliverable, not the last.** Implementation that starts before ports are defined will produce surfaces that reflect implementation accidents, not deliberate design.

### Rule 2 — Surface Drives Architecture

When designing a feature or system:
```
Domain identification → Surface definition → Architecture → Implementation
                        ↑ THIS is the main design work
```

Not:
```
Architecture → Surface definition → Implementation
↑ THIS produces surfaces that reflect implementation choices
```

The difference: when surfaces drive architecture, implementations on both sides are constrained by co-designed contracts and can proceed in parallel. When architecture drives surfaces, the surface reflects one side's assumptions and the other side adapts — creating hidden coupling.

### Rule 3 — Both Sides Present

When defining a Port that connects two domains:
- The producer's constraints must be encoded in the interface
- The consumer's constraints must be encoded in the interface
- Neither side defines the Port unilaterally

A Port defined by one side and consumed by another without agreement is not a co-designed surface — it's a unilateral API that will drift.

### Rule 4 — Domain Delivery

A domain is "done" when all its layers are co-designed and green:

```
☐ Business logic implemented
☐ Type contracts published to shared types package
☐ API contract defined (OpenAPI / event schema / typed interface)
☐ Ports defined for all external dependencies
☐ Deployment template applied (canonical)
☐ Auth tier integrated
☐ Structured logging + observability instrumented
☐ Architecture gates passing
☐ Verification: unit + contract tests
☐ Documentation: README, decision records
```

Shipping a service without its observability or types is not shipping — it's accumulating surface debt.

### Rule 5 — Composition Theorem Applied

When reviewing code, PRs, or designs — check in this order:
1. **Ports** — are cross-domain surfaces correctly defined, typed, and frozen?
2. **Interfaces** — are public APIs clear, non-leaking, and stable?
3. **Architecture** — is the internal structure clean?

Most engineers instinctively check #3 first. FCD inverts this. A clean Architecture behind a broken Port is net-negative for the system. A mediocre Architecture behind a correct Port is safely improvable.

### Rule 6 — Gate Enforcement

Every new component ships with architecture gate tests. Not optional. Not "we'll add them later." The gate test is written alongside the first meaningful code.

Known exceptions are documented as a typed set with tracking comments — the exception list IS the debt tracker.

---

## Routing — When to Use What

| Situation | Skill | Why |
|-----------|-------|-----|
| Onboarding to unfamiliar codebase | `fcd-diagnose` (planned) | Understand co-design failures before touching code |
| Two domains need to communicate | `fcd-surface` | Define the shared surface before either side implements |
| Starting a new component | `fcd-card` | 5-question layer stack card (20 min) |
| Multi-phase feature or product | `fcd-design` | Full PRD with surface-first architecture |
| Decomposing a PRD into work | `fcd-plan` | Commissions with mandatory Wave 0 (surfaces) |
| Implementing within boundaries | `fcd-commission` | Solo or orchestrated, with port-freeze pre-check |
| Reviewing code or design | `fcd-review` | Port-priority lens, surface compliance first |
| Contentious design decision | `fcd-debate` | Multi-perspective with Surface Advocate |
| Project governance check | `fcd-govern` (planned) | Surface audit, flywheel tracking |
| Domain health assessment | `fcd-health` (planned) | 8-part completeness, port-weighted scoring |

**Lifecycle order:**

```
fcd-diagnose → fcd-surface → fcd-card → fcd-design → fcd-plan → fcd-commission → fcd-review
     ↑ understand    ↑ define     ↑ specify              ↑ plan       ↑ execute       ↑ review
     │                                                                                    │
     └────────────────────────── fcd-health + fcd-govern (feedback loop) ←─────────────────┘
```

**Fallback:** Until a `fcd-*` skill exists, the corresponding `forge-*` skill can be used. The forge skills have partial ECD integration. The fcd-* skills will supersede them with full ECD discipline baked in.

---

## Anti-Patterns

### From ECD

- **Implementation before Port definition** — two teams start building before agreeing on the API contract. The Port that emerges reflects one side's implementation constraints, not deliberate design.
- **Unilateral surface changes** — one team changes a shared type or API without the consuming team present. The Port is no longer co-designed.
- **Optimizing Architecture while Ports are wrong** — engineers spend days refactoring internals while the API contract has known issues. Architecture quality is additive; Port quality is multiplicative.
- **"We control both sides"** — justifies skipping interface discipline. Even when one team owns both domains, the Port discipline prevents future coupling when teams change.

### From FCA

- **God component** — everything depends on one thing
- **Artifact-type directories** — `tests/`, `types/`, `config/` at root instead of co-located with their component
- **Port-shaped wrappers** — wraps a dep without defining a real interface
- **Observability as afterthought** — bolted on instead of structural from day one
- **Central documentation** — drifts because it's not co-located with the code it describes

---

## Deep Reference

For the full FCA specification (structural model):
- [fca/01-the-component.md](fca/01-the-component.md) — The 8 structural parts
- [fca/02-the-levels.md](fca/02-the-levels.md) — L0–L5 with artifacts per level
- [fca/03-layers-and-domains.md](fca/03-layers-and-domains.md) — Decomposition axes
- [fca/04-functional-programming.md](fca/04-functional-programming.md) — FP alignment
- [fca/05-principles.md](fca/05-principles.md) — The 10 principles in full detail
- [fca/06-common-patterns.md](fca/06-common-patterns.md) — Port, verification, config, observability, gate testing patterns
- [fca/07-applied-example.md](fca/07-applied-example.md) — Full worked example

For the full ECD specification (temporal + organizational model):
- [ecd/01-extreme-co-design.md](ecd/01-extreme-co-design.md) — Philosophy and evidence
- [ecd/02-software-translation.md](ecd/02-software-translation.md) — Software surfaces, temporal and organizational dimensions
- [ecd/03-fca-synthesis.md](ecd/03-fca-synthesis.md) — How FCA + ECD combine, dependency DAG, composition theorem

For domain-specific advice:
- [fca/advice/01-multiagent-systems.md](fca/advice/01-multiagent-systems.md) — FCA for LLM agent teams
- [fca/advice/02-co-design-dynamics.md](fca/advice/02-co-design-dynamics.md) — FCA for distributed design (the formal bridge between FCA and ECD)

Read reference files when you need deep detail. The quick reference and behavioral discipline above are sufficient for most work.
