---
title: "FCA Advice: Co-Design Dynamics"
scope: fractal-component-architecture/advice
status: draft
evidence_tier: L3-L5 empirically grounded (Nvidia hardware, T1 software org), L0-L2 structurally derived
origin: Analysis of Nvidia Extreme Co-Design (GTC 2025-2026, Lex Fridman #494) translated to software via T1-ECD methodology (2026-03)
---

# Co-Design Dynamics

Guidance for applying FCA to systems where components are designed by **multiple agents over time** — teams, organizations, or LLM agents that must coordinate on shared surfaces before implementing independently.

## Domain Context

FCA's component model was designed for structural correctness: here are the 8 parts, here are the levels, here is what a well-formed component looks like. It describes the end state — the system at rest.

But components don't appear fully formed. They are designed, and the design process has properties that affect whether the resulting structure is correct. When a single person writes a library, the design process is internal — they hold the whole structure in their head. When multiple teams build a platform, or multiple agents implement a commission, the design process is distributed — and the **sequence and coordination of design decisions** becomes load-bearing.

**The core finding:** FCA's 8-part structural model is complete — no new primitives are needed. But three properties of the 8 parts are currently implicit and become critical when components are co-designed by distributed agents:

1. **The 8 parts have a dependency ordering.** Interface and Port definition logically precede Architecture implementation. This is structurally true even for solo developers, but invisible failures when violated alone become catastrophic failures when violated in multi-team contexts.
2. **Surface quality bounds system quality.** The quality of a higher-level component is bounded by the quality of its Ports, not its Architecture. This is a composition property, not a process preference.
3. **Shared surfaces are the product.** When two components communicate through a Port, the Port definition is the primary deliverable — the implementations on both sides are secondary. This inverts the intuitive priority.

> **Source:** Nvidia's Extreme Co-Design philosophy — Jensen Huang's claim that by designing every layer of a computing system simultaneously, Nvidia achieved 1,000,000x compute improvement over 10 years (vs. 100x from Moore's Law alone). The 10,000x delta is attributed to co-design of shared surfaces. Translated to software: the performance of a platform is not determined by individual service quality, but by the quality of surfaces where services touch.
>
> **References:**
> - Nvidia GTC 2025/2026 keynotes, Lex Fridman Podcast #494
> - Software translation: ov-t1/engineering/methodology/02-software-translation.md
> - FCA synthesis: ov-t1/engineering/methodology/03-fca-as-expression.md

## What Maps Cleanly

These aspects of co-design dynamics require no extension to FCA — the existing model handles them:

| FCA Concept | Co-Design Role | Notes |
|-------------|---------------|-------|
| **Port** | The shared surface between co-designing teams | FCA already defines ports as the only legal dependency injection point. Co-design dynamics just emphasizes: the port is the design artifact that matters most. |
| **Boundary** | Prevents unilateral coupling | FCA's boundary prevents one component from reaching into another's internals. This is already the structural mechanism that forces surface-through-port communication. |
| **Interface** | The contract both sides agree to | Interface-as-commitment (Principle 2) already captures the idea that interfaces are shared agreements, not implementation details. |
| **Verification** | Architecture gates (G-PORT, G-BOUNDARY, G-LAYER) | FCA's Structural Fitness Functions (06-common-patterns.md) already provide the mechanism for enforcing co-design contracts in CI. |
| **Documentation** | Co-located explanation of design decisions | FCA's co-location principle (Principle 8) already ensures design rationale lives with the component, not in a separate wiki. |

## What Requires Attention

### 1. The 8 Parts Have a Dependency Ordering

**The issue.** FCA lists the 8 parts as a set: Interface, Boundary, Port, Domain, Architecture, Verification, Observability, Documentation. The ordering in the document is presentational (outward-facing first, inward-facing second, spanning third). But there is a structural dependency DAG between them that constrains the design sequence.

**What's implicit.** You cannot implement Architecture without knowing your Ports — what dependencies will be injected? You cannot define Verification without an Interface to verify against. You cannot instrument Observability without knowing what Domain events matter. These dependencies exist whether you're a solo developer or a 500-person org.

**Why it matters for co-design.** A solo developer who defines Architecture before Ports can course-correct cheaply — they hold the whole structure in their head, the rework is local. Two teams that define Architecture before agreeing on the shared Port produce incompatible implementations. The rework is distributed, expensive, and creates drift points that persist.

**The dependency DAG:**

```
Domain ← what is this component about?
  ↓
Interface ← what does it expose?
Port ← what does it depend on?
  ↓
Boundary ← what can't it see?
Architecture ← how does it self-organize internally?
  ↓
Verification ← proof it works
Observability ← runtime signals it's working
Documentation ← explanation of the above
```

The first tier (Domain, Interface, Port) is **definitional** — it establishes what the component is. The second tier (Boundary, Architecture) is **structural** — it establishes how the component is built. The third tier (Verification, Observability, Documentation) is **evidential** — it establishes proof and signals.

**The design sequence principle:** Within each tier, parts can be designed in any order. Across tiers, the definitional tier precedes the structural tier, which precedes the evidential tier. This ordering is not a process preference — it's a logical dependency. Architecture that precedes Port definition is architecture built on assumptions about dependencies that haven't been agreed upon.

**Pattern: Port-First Design.**

When two components will share a surface:
1. Both sides agree on the Port definition (typed interface, event schema, API contract)
2. Both sides freeze the Port — unilateral modification is a new co-design event
3. Both sides implement Architecture against the frozen Port independently
4. Verification confirms each side satisfies the Port contract

This sequence is already implied by FCA's principles (Principle 3: Port pattern as standard seam). Co-design dynamics makes the temporal implication explicit.

> **References:**
> - Nvidia analog: NVLink connector spec finalized before chip tape-out — if connector is wrong, no chip design recovers
> - T1 evidence: 502 entity drift points traced to implementations starting before shared type definitions existed (ov-t1/engineering/methodology/04-t1-diagnosis.md)
> - FCA Principle 3: "Port pattern as standard seam" — already implies port precedes implementation

### 2. Surface Quality Bounds System Quality

**The issue.** FCA's composition model says higher-level components are composed of lower-level ones (L5 of L4s, L4 of L3s, etc.). But FCA doesn't state which parts of sub-components determine the quality of the composition.

**What's implicit.** The quality of an L4 service is bounded by the quality of its L3 package Ports, not by the quality of its L3 package Architectures. A correct Port with mediocre Architecture can be safely refactored — the Port contract protects consumers. A wrong Port with excellent Architecture is structural debt that compounds through every consumer.

**The composition theorem:** Improvements to shared surfaces (Ports, Interfaces) yield multiplicative gains across all consumers. Improvements to internal Architecture yield additive gains within one component. In a system of N components sharing a surface, fixing the surface improves N components simultaneously. Fixing one component's internals improves one.

**Why this matters practically.** Engineers intuitively prioritize Architecture — "let me refactor the internals, clean up the code, improve performance." Co-design dynamics says: **review the Port first**. A 10-minute Port review that catches an incorrect contract prevents months of distributed technical debt. A week-long Architecture refactor improves one component.

**The priority hierarchy:**

```
Port correctness > Interface clarity > Architecture quality

Why: Port errors propagate to every consumer (multiplicative cost).
     Interface ambiguity causes misuse by consumers (multiplicative cost).
     Architecture problems are local (additive cost).
```

This is not a value judgment — it's a structural property of composition. FCA already implies it (Ports are the only legal surface between components; Architecture is hidden behind Boundary), but the implication is not stated as a design priority.

> **References:**
> - Nvidia analog: NVLink fabric quality determines rack performance more than any individual GPU's transistor design
> - Hardware formulation: "The rack is the unit of compute" (Jensen Huang, GTC 2025) — translated: "The domain is the unit of delivery"
> - T1 evidence: 12 redesign hooks traced to surface failures, not implementation failures (ov-t1/engineering/methodology/04-t1-diagnosis.md)

### 3. Co-Design Is an Event, Not a State

**The issue.** FCA describes components as having Ports. It doesn't describe the act of defining a Port as requiring coordination between the port's provider and consumer.

**What's implicit.** A Port defined by one side and consumed by another without agreement is not a co-designed surface — it's a unilateral API. FCA's structure is correct (the Port exists, the Boundary enforces it), but the resulting system is fragile because the Port reflects one side's assumptions, not a negotiated contract.

**Why it matters.** In passive software (libraries), unilateral APIs work because the consumer adapts to the provider's design. In distributed systems (platforms, agent teams), both sides evolve independently. A unilateral Port accumulates drift as the consumer's needs diverge from the provider's assumptions. A co-designed Port is resilient because both sides' constraints are encoded in the definition.

**The distinction:**

| Property | Unilateral Port | Co-designed Port |
|----------|----------------|-----------------|
| Defined by | Provider only | Both provider and consumer |
| Consumer's constraints encoded? | No — consumer adapts | Yes — both sides agree |
| Drift resilience | Low — diverges as needs change | High — constraints from both sides |
| Modification process | Provider changes, consumer discovers | Either side proposes, both agree |

**Pattern: Co-Design Event.**

A co-design event is any synchronous or asynchronous interaction where both sides of a surface agree on its definition. It can be:
- A PR where both domain leads review a type definition
- A Slack thread where both teams discuss an event schema
- A 30-minute call where both sides sketch an API contract
- An LLM agent session where the orchestrator defines ports before spawning sub-agents

The output is always a **written, frozen Port definition**. "Frozen" means neither side modifies unilaterally — modifications trigger a new co-design event.

**What this is NOT.** Co-design events are not approval gates, design reviews, or process ceremonies. They are the minimal coordination required to produce a shared surface that both sides can implement against independently. The goal is to front-load the 10 minutes of surface agreement that prevents the 10 hours of post-implementation debugging.

> **References:**
> - Nvidia analog: GPU architects, NVLink engineers, runtime team, and model researchers in joint sessions before tape-out — surface defined with all stakeholders present
> - Jensen Huang's no-one-on-one policy: all meetings are group meetings because co-design requires multiple perspectives simultaneously
> - T1 Rule 3: "Port frozen before implementation starts" (ov-t1/engineering/methodology/07-team-methodology.md)
> - Agent analog: orchestrator defines commission interfaces before spawning sub-agents (advice/01-multiagent-systems.md, L3 Architecture)

## Structural Patterns

### Architecture Gates as Tape-Out Constraints (L3-L5 Verification Pattern)

**Classification:** Verification pattern — structural fitness functions that enforce co-design contracts in CI.

**What it is.** Architecture gate tests are fast (<1 second), zero-dependency tests that verify structural properties of the codebase. They are the software analog of hardware tape-out constraints — physical properties that must be true before a chip can be manufactured.

FCA already defines these in 06-common-patterns.md (G-PORT, G-BOUNDARY, G-LAYER). Co-design dynamics adds the insight: **gates enforce co-design contracts automatically**. Once a Port is frozen, a gate test prevents unilateral violation. The gate converts a social agreement (both teams agreed on this Port) into a structural constraint (CI blocks violations).

| Gate | Enforces | Co-Design Property |
|------|----------|-------------------|
| G-PORT | Domain code does not import external deps directly; injected through Ports | Prevents bypassing the co-designed surface |
| G-BOUNDARY | Domain code does not import from other domains at runtime | Prevents coupling that wasn't co-designed |
| G-LAYER | Lower layers do not import from higher layers | Prevents dependency inversions that break the composition DAG |
| G-ENTITY | Business entities use canonical definitions, not local redefinitions | Prevents drift from co-designed type contracts |

**G-ENTITY** is new — not in the current FCA patterns. It scans for local type definitions that duplicate canonical shared types. When a types package exists (e.g., `@org/types`), G-ENTITY blocks PRs that define `interface CartItem` locally instead of importing the canonical definition. This is the gate that prevents entity drift — the most common surface failure in platforms without co-design discipline.

**Pattern: Gate as Living Contract.**
```typescript
// architecture.test.ts — ships with every component
import { scanImports } from '@org/architecture-gates';

test('G-PORT: domain code uses ports, not direct deps', () => {
  const violations = scanImports('src/domain/**', {
    forbidden: ['node:fs', 'node:http', 'mongodb', 'redis', '@aws-sdk/*'],
    allowed: ['src/ports/**', '@org/types'],
  });
  expect(violations).toEqual([]);
});

test('G-BOUNDARY: no cross-domain runtime imports', () => {
  const violations = scanImports('src/domain/shipping/**', {
    forbidden: ['src/domain/commerce/**', 'src/domain/payments/**'],
  });
  expect(violations).toEqual([]);
});

test('G-ENTITY: no local entity redefinitions', () => {
  const localTypes = scanTypeDefinitions('src/**', {
    canonicalPackage: '@org/types',
    entities: ['CartItem', 'Address', 'Seller', 'Order', 'Shipment'],
  });
  expect(localTypes).toEqual([]);
});
```

> **References:**
> - Nvidia tape-out: physical constraints verified before manufacturing — software equivalent: structural constraints verified before merge
> - FCA Structural Fitness Functions: 06-common-patterns.md
> - G-ENTITY applied: T1's 502 entity drift points (4 definitions of CartItem, 9 of Address) — gate prevents recurrence

### Domain Delivery (L4-L5 Architecture Pattern)

**Classification:** Architecture pattern at L4-L5 — the unit of delivery is the domain, not the service.

**What it is.** A domain is "done" when all its layers are co-designed and verified: business logic implemented, type contracts published, API documented, deployment template applied, auth tier integrated, observability instrumented, CI/CD active. A service is "done" when its code compiles and deploys. Domain delivery is the FCA-correct framing because it treats the full layer stack as one component.

**Why it matters.** A service that deploys without its observability layer is like a function that compiles without its type signature — structurally incomplete. FCA's Principle 1 ("every layer produces a component") already implies that a half-layered service is a half-formed component. Domain delivery makes this explicit: the minimum viable component at L4 includes all 8 parts across all layers.

**The layer stack checklist:**

```
Domain delivery: [domain name]
  ☐ Business logic implemented
  ☐ Type contracts published to shared types package
  ☐ API contract defined (OpenAPI / event schema)
  ☐ Ports defined for all external dependencies
  ☐ Canonical deployment template applied
  ☐ Auth tier integrated (correct tier for domain)
  ☐ Structured logging instrumented
  ☐ Observability alarms configured
  ☐ Architecture gates passing
  ☐ Verification: unit + contract tests
  ☐ Documentation: README, decision records
```

This is not a process checklist — it's a structural completeness check derived from FCA's 8 parts applied to the domain's layer stack.

> **References:**
> - Nvidia "rack is the unit of compute": the rack is done when all layers (chip, packaging, interconnect, cooling, drivers, runtime) are co-designed and integrated
> - FCA Principle 1: "Every layer produces a component"
> - T1 Rule 4: "Domain delivery, not service delivery" (ov-t1/engineering/methodology/07-team-methodology.md)

## Anti-Patterns

### Implementation before Port definition

**Symptom:** Two teams start building their sides of an integration before agreeing on the API contract. Both assume a shape, discover incompatibility at integration time, then one side adapts under time pressure.

**Why it fails:** The Port that emerges from post-hoc adaptation reflects one side's implementation constraints, not a deliberate design. It accumulates technical debt from the start. Every future consumer of this Port inherits the original misalignment.

**FCA diagnosis:** Violation of the dependency DAG — Architecture (tier 2) was started before Port (tier 1) was settled. The structure is formally correct (a Port exists) but the Port was reverse-engineered from implementations rather than forward-designed from requirements.

### Unilateral surface changes

**Symptom:** One team changes a shared type definition, event schema, or API contract without notifying the consuming team. The consuming team discovers the change when their code breaks in staging or production.

**Why it fails:** A Port modified without both sides present is no longer a co-designed surface. It's a unilateral decision disguised as a shared contract. FCA's G-BOUNDARY gate won't catch this because the boundary is still respected — the violation is in the change process, not the resulting structure.

**Mitigation:** G-ENTITY and contract tests catch the structural consequence (consumer code fails against new schema). But the process failure — unilateral modification — requires an organizational norm: Port modifications are co-design events.

### Optimizing Architecture while Ports are wrong

**Symptom:** Engineers spend days refactoring internals of a service while its API contract has known issues (missing fields, inconsistent naming, wrong granularity). The Architecture improves but the surface — the thing consumers depend on — stays broken.

**Why it fails:** Architecture quality is additive (improves one component). Port quality is multiplicative (improves every consumer). Investing in Architecture while Ports are wrong is optimizing the wrong variable.

**FCA diagnosis:** This is the composition theorem in action. The priority hierarchy (Port > Interface > Architecture) is being violated. A 10-minute Port fix would yield more system-wide improvement than a week of Architecture refactoring.

### "We control both sides"

**Symptom:** Teams skip co-design because they own both the provider and consumer. "We don't need a formal Port definition — we can just change both sides."

**Why it fails:** "We control both sides" is true today. It may not be true next quarter. The Port definition is the only artifact that survives team reorganization, engineer departure, or domain transfer. Skipping it creates a coupling that is invisible in the code but load-bearing in the organization.

**FCA diagnosis:** Already identified in FCA 05-principles.md as an anti-pattern. Co-design dynamics adds: even when you control both sides, the co-design event (explicitly defining and freezing the Port) forces you to think about the surface deliberately. The act of definition is the value, not just the artifact.

## Applicability

This advice applies whenever FCA components are designed by **distributed agents** — meaning the designer of one component cannot hold the full context of adjacent components in working memory. This includes:

| Context | Why co-design dynamics matter |
|---------|------------------------------|
| Multi-team platforms (5+ teams) | Teams design independently; surfaces are the only coordination mechanism |
| LLM agent orchestration (L3-L4) | Agents implement commissions independently; port definitions from the orchestrator are the only shared context |
| Open-source ecosystems | Contributors don't have full context; published interfaces are the only stable surface |
| Long-lived codebases (2+ years) | Future maintainers are effectively different agents — the Port definition is the knowledge transfer mechanism |

This advice does NOT apply to:
- Solo developers building a single library (the dependency DAG is still structurally true but the coordination overhead is zero)
- Prototypes and experiments (co-design discipline is premature optimization before boundaries stabilize)
- Components with a single consumer (unilateral Port definition is acceptable when there's one consumer who can adapt)

## Relationship to FCA Core

This advice document does not extend FCA's model. The 8 parts, 6 levels, 2 decomposition axes, and 10 principles are unchanged. What this document makes explicit:

1. **The dependency DAG** between the 8 parts (already implied by the parts' definitions)
2. **The composition theorem** about surface vs. implementation quality (already implied by Port-as-only-legal-surface)
3. **The temporal consequence** of the above: Port definition precedes Architecture implementation (already implied by Principle 3)

These are structural truths that hold at every level and every scale. They become operationally critical — not just theoretically true — when components are co-designed by distributed agents. The advice exists because the implications are non-obvious and the failure mode (implementation before surface agreement) is the default behavior of both human teams and LLM agents.

## Open Questions

1. **Should the dependency DAG be promoted to the core principles?** It's structurally derivable from the existing 8-part definitions but never stated. Adding "Principle 0: Definitional parts (Domain, Interface, Port) precede structural parts (Boundary, Architecture)" would make the design sequence explicit. Counter-argument: the core principles are about structure, not sequence — adding a temporal principle changes their character.

2. **Is G-ENTITY a core pattern or domain-specific?** G-ENTITY (preventing local redefinitions of canonical types) is critical for platforms with shared type packages but irrelevant for single-package projects. It may belong in this advice document rather than in 06-common-patterns.md.

3. **Does the composition theorem generalize beyond Ports?** The claim "surface quality > implementation quality" is stated for Ports. Does it hold for other outward-facing parts (Interface clarity, Boundary enforcement)? Nvidia's evidence covers the full shared surface; FCA may need to state the hierarchy across all outward-facing parts.

4. **How does co-design dynamics interact with the multiagent advice?** The multiagent advice (01-multiagent-systems.md) addresses L3 temporal coordination for agent teams. This document addresses the design process for any distributed agents (human or LLM). The overlap is at L3-L4 where agent orchestrators define ports before spawning sub-agents. A unified treatment may be warranted if both documents mature.
