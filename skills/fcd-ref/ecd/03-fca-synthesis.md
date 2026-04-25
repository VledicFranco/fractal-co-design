---
title: "FCA + ECD Synthesis"
scope: fractal-co-design/ecd
evidence: Structural analysis of FCA component model mapped to ECD principles; validated against enterprise platform (12 co-design failures diagnosed, all traceable to temporal/organizational violations of FCA structure)
---

# 03 — FCA as the Structural Expression of Extreme Co-Design

> *FCA describes what a well-formed system looks like at rest. Extreme Co-Design says when and how it gets that way.*

---

## The Alignment

FCA and ECD arrive at the same conclusions from opposite directions.

**FCA** starts from structure: *what is the right shape for software at every scale?* Its answer — the component, repeating fractally — is a structural claim about the final artifact.

**ECD** starts from performance: *why do some systems deliver superlinear gains while others deliver linear ones?* Its answer — co-optimize every layer simultaneously — is a temporal and organizational claim about the design process.

They are two descriptions of the same thing: one from the outside (what it looks like), one from the inside (how it got there).

---

## The Mapping

| ECD Concept | FCA Equivalent | What it enforces |
|-------------|----------------|-----------------|
| The rack is the unit of compute | The **domain** is the unit of delivery | Delivery complete when all layers co-designed and green |
| Full-stack simultaneous optimization | **Layer stack** per domain (all designed together) | Schema + contract + deployment + observability + auth co-designed, not sequential |
| Interconnect fabric | **Port interfaces** (typed, explicit) | The only legal surface between domains; co-designed |
| Tape-out constraint | **Architecture gate tests** (G-PORT, G-BOUNDARY, G-LAYER) | Structural violations cannot ship — enforced in CI |
| Pre-tape-out surface sprint | **Shared surface definition** (Phase 0) | Ports, types, and schemas frozen before implementation starts |
| Algorithmic co-design | **Entity canonical design** (shared types package) | Entities defined at the domain boundary, not derived from implementation |
| Proprietary fabric | **Directory boundary + import rules** | Cross-domain import is a boundary violation, not just bad practice |
| Third-party integration | **Port-based external adapters** | External deps accessed through ports, not direct imports |

---

## What FCA Already Gets Right

FCA's 8-part component structure — Interface, Boundary, Port, Domain, Architecture, Verification, Observability, Documentation — is already a co-design specification:

- **Interface** = the type contract other components see
- **Port** = the injection point where external dependencies are co-designed
- **Boundary** = enforcement that makes the surface inviolable
- **Verification** = proof the co-designed surface works in isolation
- **Observability** = runtime signal the surface functions as designed

FCA's 10 principles encode ECD's organizational insight:
- *"Interface discipline — treat exports as a library API"* = define the surface before the implementation
- *"Port pattern as the standard seam"* = every cross-component interaction is a co-designed surface
- *"Enforce boundaries through structure"* = make the constraint structural, not conventional

---

## What FCA Gains from ECD

### 1. The Temporal Sequence — The Dependency DAG

FCA's 8 parts are listed as a set. But there is a structural dependency DAG between them that constrains the design sequence:

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
Observability ← runtime signals
Documentation ← explanation
```

Three tiers:
- **Tier 1 — Definitional:** Domain, Interface, Port — establishes what the component IS
- **Tier 2 — Structural:** Boundary, Architecture — establishes how it is BUILT
- **Tier 3 — Evidential:** Verification, Observability, Documentation — establishes PROOF

**The design sequence principle:** Within each tier, parts can be designed in any order. Across tiers, Tier 1 precedes Tier 2, which precedes Tier 3. Architecture that precedes Port definition is architecture built on assumptions about dependencies that haven't been agreed upon.

### 2. The Organizational Mandate — Co-Design Events

FCA describes components as having Ports. It doesn't describe the act of defining a Port as requiring coordination between provider and consumer.

ECD makes this explicit: **the co-design moment is an organizational event**. It requires both sides of a surface to participate in defining it simultaneously. A Port defined by one side and consumed by another without agreement is not a co-designed surface — it's a unilateral decision that will eventually produce friction.

A co-design event can be:
- A PR where both domain leads review a type definition
- A thread where both teams discuss an event schema
- A 30-minute call where both sides sketch an API contract
- An agent session where the orchestrator defines ports before spawning sub-agents

The output is always a **written, frozen Port definition**.

---

## The Composition Theorem

> Improvements to shared surfaces (Ports, Interfaces) yield **multiplicative** gains across all consumers. Improvements to internal Architecture yield **additive** gains within one component.

In a system of N components sharing a surface, fixing the surface improves N components simultaneously. Fixing one component's internals improves one.

**The priority hierarchy:**

```
Port correctness > Interface clarity > Architecture quality

Why: Port errors propagate to every consumer (multiplicative cost).
     Interface ambiguity causes misuse by consumers (multiplicative cost).
     Architecture problems are local (additive cost).
```

This is not a value judgment — it's a structural property of composition. FCA already implies it (Ports are the only legal surface between components; Architecture is hidden behind Boundary), but the implication is not stated as a design priority.

---

## Architecture Gates as Tape-Out Constraints

In hardware, a connector violation is immediately obvious. In software, a Port contract violation compiles, deploys, and surfaces as a runtime bug.

FCA's architecture gate tests are the software equivalent of the physical constraint:

| Gate | Enforces | ECD Analog |
|------|----------|-----------|
| **G-PORT** | No direct external dep access in domain code | No chip-to-chip connection bypassing the fabric |
| **G-BOUNDARY** | No cross-domain runtime imports | No GPU communicating with memory without going through NVLink |
| **G-LAYER** | No upward layer dependencies | No low-level silicon aware of high-level system behavior |
| **G-ENTITY** | Business entities use canonical definitions, not local redefinitions | No connector with a non-standard pinout |

G-ENTITY is the gate that prevents entity drift. When a shared types package exists, G-ENTITY blocks PRs that define local types duplicating canonical ones. This is the gate that enforces canonical surfaces.

---

## The FCA Guarantee, Restated Through ECD

FCA's structural guarantee: *domains that communicate only through ports cannot produce merge conflicts.*

Through the ECD lens, this becomes stronger:

> **Domains that communicate only through well-defined ports can be implemented in parallel by independent agents without coordination overhead.**

The port IS the coordination. Everything after the port definition is independent implementation. This is why the shared surface sprint must happen before any implementation wave — if a port doesn't exist yet, two implementors that need it will collide. If the port exists and is frozen, they run in parallel without friction.

---

## The Combined Framework

FCA + ECD together produce three properties that neither has alone:

**Structural clarity (FCA):** A well-formed component at every level. Clear interfaces, typed ports, enforced boundaries, co-located verification.

**Temporal discipline (ECD):** Ports defined before implementations. Shared surfaces frozen before parallel work begins. Co-design events before code is written.

**Organizational alignment (ECD):** Surface decisions made with both affected sides present. No unilateral port definitions. No adapter-shaped wrappers hiding an undefined contract.

The result: a system where gains are multiplicative — because the surfaces between components are as carefully designed as the components themselves.

This combined framework is **Fractal Co-Design (FCD)**.
