---
name: fcd-surface
description: >
  Co-design a shared surface (port interface) between two domains before either side
  implements. The core FCD ritual: names the surface, defines typed interfaces, assigns
  producer/consumer roles, freezes the contract, produces gate assertion + co-design record.
  Implements ECD Rule 3: the port is frozen before implementation starts.
  Part of the FCD skill family (fcd-*). Foundation: fcd-ref.
  Trigger: "/fcd-surface [domain A] [domain B] [what flows between them]"
user-invocable: true
disable-model-invocation: false
argument-hint: "[domain A] [domain B] [description of what data/control flows between them]"
fcd-lifecycle: define
fcd-order: 2
---

# fcd-surface — Port Interface Co-Design

> *"The port is the product. The implementation is an implementation detail."*

Lightweight ritual for defining the typed contract between two domains BEFORE either side writes implementation code. 15-30 minutes. No implementation — only interface.

**Foundation:** Load `fcd-ref` for the behavioral discipline and reference material.

**When to use:**
- Two domains need to communicate and no port exists yet
- An existing port needs extension or a breaking change
- `fcd-card` Q2 revealed a consumed port that doesn't exist
- `fcd-diagnose` found an untyped cross-domain coupling
- `fcd-design` Phase 2 identified a cross-domain port need

**When NOT to use:**
- Both domains already have a well-defined, frozen port between them → just implement
- The surface is internal to a single domain → not a shared surface, no co-design needed
- The change is a full system redesign → use `fcd-design` for a PRD

---

## Phase 0 — Initialize

### 0.1 — Load Context

Read (extract key fields):
1. **CLAUDE.md** — layer stack, domain list, ports directory location
2. **Existing ports** — scan `ports/` (or equivalent) for current port interface files
3. **Architecture gate test** — read `architecture.test.ts` to understand current gate assertions and known exceptions

### 0.2 — Parse Input

`$ARGUMENTS` should contain two domain names and optionally a description of what flows between them.

- Two domains named → proceed
- One domain named → ask: *"Which other domain does {A} need to communicate with? Name the other side."*
- No domains named → ask: *"Which two domains need a shared surface? Name both."*
- Description provided → use as the initial scope statement
- No description → ask: *"What data or control needs to flow between {A} and {B}?"*

### 0.3 — Detect Surface Mode

- **New surface** — no existing port between these two domains
- **Extension** — a port exists but needs additional methods, fields, or event types
- **Breaking change** — an existing port's contract must change in incompatible ways

**Detection:** grep existing port files for type names referencing either domain. Check if either domain already imports from a shared port that connects them.

Present mode:
> *"This is a {new surface | extension of existing port `{name}` | breaking change to `{name}`}. Proceeding with co-design."*

**For breaking changes:** warn immediately:
> *"Breaking change detected. Both sides must update simultaneously. This may require a migration path. Proceed with caution."*

### 0.4 — Resumption Check

Check for `.method/sessions/fcd-surface-{slug}/record.md`. If found:
> *"Found an in-progress co-design session for {A} ↔ {B}. Resume or start fresh?"*

**Exit gate (sigma_0):** Two domains identified, existing ports scanned, surface mode detected.

---

## Phase 1 — Name & Scope

### 1.1 — Name the Surface

> *"What should this port be called? Convention: `{Concept}Port` for method interfaces, `{Concept}Event` for event schemas, `{Concept}Contract` for API contracts."*

The name should reflect what crosses the boundary, not which domain owns it.

**Anti-capitulation:** If the name is generic ("DataPort", "ServicePort", "HelperInterface"): *"That name describes every port. Name the specific concept that flows across this boundary."*

### 1.2 — Define Scope

> *"What specific data or control needs to flow between {A} and {B}?"*

Gather:
- **What flows:** types, events, function calls, queries
- **Direction:** A → B (unidirectional), B → A, or A ↔ B (bidirectional)
- **Frequency:** one-time call, stream of events, polling, subscription
- **Cardinality:** one-to-one, one-to-many, many-to-many

**Anti-capitulation:** If scope is vague ("they just need to talk"): *"What specific data does {A} need from {B}? Name the fields. If you can't name them, the surface isn't ready to be designed."*

### 1.3 — Determine Ownership

Every port has exactly one owner — the domain that defines and publishes the interface.

> *"Which domain OWNS this port? The owner defines the types; the other side implements or consumes them."*

**Heuristic:** The domain that provides the data/service usually owns the port. The domain that consumes it depends on it.

**Exit gate (sigma_1):** Surface named, scope defined (what flows, direction, frequency), ownership assigned.

---

## Phase 2 — Define Interface

This is the **primary deliverable** of the entire session. Per the FCD dependency DAG, this is Tier 1 (definitional) work — it logically precedes any Architecture on either side.

### 2.1 — Choose Interface Style

Based on the project's conventions:

| Style | When | Example |
|-------|------|---------|
| **TypeScript interface** | Synchronous method calls between domains | `export interface ShipmentPort { request(order: Order): Promise<Label> }` |
| **Event schema** | Asynchronous event-driven communication | `export type SessionCompletedEvent = { sessionId: string; result: AgentResult }` |
| **API contract** | HTTP boundary between services | OpenAPI schema fragment or typed request/response interfaces |

### 2.2 — Write the Type Definition

Write the actual TypeScript (or schema) for the port interface. Include:

- **All methods or event types** that cross the boundary
- **All parameter and return types** fully defined (no `any`, no `unknown` without justification)
- **Error types** for failure cases
- **JSDoc comments** on each method explaining its contract

```typescript
// ports/{surface-name}.ts

/**
 * {Surface description — what it enables, which domains it connects}
 *
 * Owner: {owning domain}
 * Consumer(s): {consuming domain(s)}
 * Direction: {A → B | A ↔ B}
 * Co-designed: {date}
 */
export interface {SurfaceName} {
  /** {method description} */
  methodName(param: ParamType): Promise<ReturnType>;
}

// Supporting types
export interface ParamType { ... }
export interface ReturnType { ... }

// Error types
export class {SurfaceName}Error extends Error { ... }
```

### 2.3 — Verify Completeness

Check:
- Every method has typed parameters and return type
- Error cases are represented (either as error types or union returns)
- No `any` types (if unavoidable, document why)
- Types don't leak domain internals (the interface should use domain-neutral vocabulary)
- **Composition theorem check:** is this interface minimal? Every method must justify its presence. Fewer methods = smaller surface = less drift risk.

### 2.4 — Consumer-Usage Minimality Check

> *Empirical finding (exp-spl-design): LLMs systematically over-specify port interfaces — adding methods the consumer doesn't need. In testing, `ProjectLookupPort` consistently got `getProject(): Promise<Project | null>` alongside `exists(): Promise<boolean>`, when the consumer only called `exists()`. The extra method increases coupling without providing consumer value.*

For each method on the interface, verify:
1. **Does the consumer actually need this method?** Trace the consumer's use case — if a method is "nice to have" but the consumer's current code path doesn't call it, remove it.
2. **Is the return type minimal?** Return the narrowest type the consumer uses. If the consumer only checks existence, return `boolean`, not the full entity.
3. **Could two methods be one?** If `getX()` and `existsX()` are both present and the consumer only calls one, keep only the one the consumer uses.

**Anti-capitulation:** If a method can't be justified by a concrete consumer code path: *"Which consumer code path calls `{method}`? If the answer is 'it might be useful later,' remove it. Ports grow — they never shrink. Add methods when consumers need them, not when producers can provide them."*

**Anti-capitulation:** If the interface uses types from one domain's internals: *"This interface references `{InternalType}` which is internal to {domain}. The port should define its own types or reference shared types. Internal types leak domain implementation details."*

**Exit gate (sigma_2):** Interface written with all methods typed, no `any`, no internal type leakage, every method justified by a consumer code path.

---

## Phase 3 — Producers & Consumers

### 3.1 — Map the Producer

The producer is the domain that IMPLEMENTS the interface (provides the service or emits the events).

> *"In {owning domain}: where will this port be implemented? Which file(s) will contain the concrete implementation?"*

Document:
- Implementation file path (existing or planned)
- How the port will be wired (constructor injection, composition root registration)

### 3.2 — Map the Consumer

The consumer is the domain that DEPENDS ON the interface (calls the methods or subscribes to events).

> *"In {consuming domain}: where will this port be consumed? Which file(s) will import and use it?"*

Document:
- Consumer file path (existing or planned)
- How the port will be injected (parameter, constructor, composition root)

**When triggered from fcd-card:** The consumer may be a planned component that doesn't exist yet. Accept "planned component in {domain}, at {expected path}" as a valid consumer mapping. The domain placement (fcd-card Q1) provides sufficient context to freeze the port — exact file paths are refined during implementation.

### 3.3 — Verify Both Sides

**Anti-capitulation:** If only one side is mapped: *"You've defined the producer but not the consumer (or vice versa). Both sides must be present when the surface is defined. Who consumes this on the other side?"*

**Exit gate (sigma_3):** Both producer and consumer mapped with file paths and wiring approach.

---

## Phase 4 — Freeze Contract

### 4.1 — Present the Surface for Agreement

Present the complete surface definition:

> *"Surface: `{SurfaceName}`*
> *Owner: {domain} | Direction: {A → B}*
> *Producer: {domain} at {file path}*
> *Consumer: {domain} at {file path}*
>
> *Interface:*
> ```typescript
> {the interface definition}
> ```
>
> *Both sides agree to this contract. Changes after freeze require a new `/fcd-surface` session."*

### 4.2 — Freeze

The PO confirms the contract. From this point:
- Neither side may modify the interface unilaterally
- Adding new methods is an extension (re-invoke `/fcd-surface`)
- Changing existing methods is a breaking change (re-invoke `/fcd-surface` with migration plan)

Record the freeze timestamp.

**Exit gate (sigma_4):** Contract presented, PO confirmed, freeze timestamp recorded.

---

## Phase 5 — Gate Assertion

### 5.1 — Determine Gate Type

| Surface Type | Gate | Assertion |
|-------------|------|-----------|
| Cross-domain method call | G-BOUNDARY | Consumer imports from `ports/`, never from producer's internal files |
| External dependency wrapper | G-PORT | Domain code imports from port interface, never from the raw dependency |
| Event schema | G-BOUNDARY | Emitter uses bus port, not direct coupling to subscriber |

### 5.2 — Write the Assertion

Produce the test assertion to add to `architecture.test.ts` (or the project's gate test file):

```typescript
// In architecture.test.ts — {SurfaceName} co-design assertion

// G-BOUNDARY: {consumer domain} must access {producer domain} only through {SurfaceName} port
it('{consumer} does not import {producer} internals', () => {
  const violations = scanImports('{consumer path}', '{producer internal path pattern}');
  expect(violations).toEqual([]);
});
```

### 5.3 — Verify Gate Doesn't Already Exist

Check if the architecture test already has assertions covering this boundary. If so, note the existing assertion and determine if it needs updating.

**Exit gate (sigma_5):** Gate assertion written. Assertion is compatible with existing gate test structure.

---

## Phase 6 — Produce Co-Design Record

### 6.1 — Write the Record

Write to `.method/sessions/fcd-surface-{slug}/record.md`:

```markdown
---
type: co-design-record
surface: "{SurfaceName}"
date: "{YYYY-MM-DD}"
owner: "{domain}"
producer: "{domain}"
consumer: "{domain}"
direction: "{A → B | A ↔ B}"
status: frozen
mode: "{new | extension | breaking-change}"
---

# Co-Design Record — {SurfaceName}

## Interface

\`\`\`typescript
{full interface definition}
\`\`\`

## Producer
- **Domain:** {name}
- **Implementation:** `{file path}`
- **Wiring:** {injection approach}

## Consumer
- **Domain:** {name}
- **Usage:** `{file path}`
- **Injection:** {injection approach}

## Gate Assertion

\`\`\`typescript
{the assertion from Phase 5}
\`\`\`

## Agreement
- Frozen: {date}
- Changes require: new `/fcd-surface` session
```

### 6.2 — Write the Port File (if new surface)

For new surfaces, also write the port interface file to the project's ports directory:

```
{project ports dir}/{surface-name}.ts
```

For extensions, update the existing port file with the new methods/types.

### 6.3 — Present Summary

> *"Surface `{SurfaceName}` co-designed and frozen.*
> *Owner: {domain} | {A} → {B}*
> *Port file: {path} | Gate assertion ready*
> *Record: {session path}*
>
> *Both sides can now implement independently. The port IS the coordination."*

**Exit gate (sigma_6):** Co-design record written. Port file written (if new). Summary presented.

---

## Anti-Capitulation Rules

These rules are non-negotiable:

1. **Never freeze a surface where only one side's types are defined.** If the producer's interface exists but the consumer's usage isn't mapped, the surface is half-designed. *"Both sides must be present when the surface is defined."*

2. **Never allow a port-shaped wrapper.** A port that simply re-exports a dependency's API without defining a real interface is not a port — it's a pass-through. *"This interface mirrors {dep}'s API exactly. What abstraction does the port add? What could change behind it without affecting consumers?"*

3. **Never proceed without naming both domains.** A surface with one named side and "whatever needs it" on the other is not co-designed. *"Name the specific consumer. If you can't, the surface may not be needed yet."*

4. **Never allow `any` types without justification.** `any` in a port interface defeats the purpose of typed contracts. *"What is the actual type? If it's genuinely polymorphic, use a generic parameter, not `any`."*

5. **Never skip the freeze.** The freeze is what makes this co-design, not just design. Without an explicit freeze, the contract is a suggestion that either side can silently violate.

6. **Flag breaking changes loudly.** If extending an existing port requires changing a method signature or removing a field, this is a breaking change. Both sides must update simultaneously. *"This changes the existing `{method}` signature. That's a breaking change. Do both sides have a migration plan?"*

---

## Anti-Patterns

- **"We control both sides"** — justifies skipping interface discipline. Even when one team owns both domains, the port discipline prevents future coupling when teams change.
- **"Just use the event bus directly"** — the event bus is a transport, not an interface. Events still need typed schemas. The bus delivers the message; the port defines what the message IS.
- **"We'll type it later"** — an untyped surface is not a surface. It's a coupling point waiting to drift. Type it now or don't define it.
- **"One big interface"** — a port with 15 methods is a god-interface. Split by concern. If the surface serves multiple purposes, it's multiple surfaces.

---

## Session State

The co-design record at `.method/sessions/fcd-surface-{slug}/record.md` is the checkpoint. It contains the interface, producer/consumer mapping, gate assertion, and freeze status. If interrupted, resume by reading the record and continuing from the first incomplete phase.

---

## Integration with FCD Family

| Skill | Relationship |
|-------|-------------|
| `fcd-ref` | Foundation — behavioral discipline and reference |
| `fcd-card` | Q2 may trigger fcd-surface when a consumed port doesn't exist |
| `fcd-design` | Phase 2 invokes fcd-surface for each cross-domain port identified |
| `fcd-diagnose` | Diagnosis may recommend fcd-surface for untyped cross-domain couplings (planned) |
| `fcd-health` | Port dimension (Absent/Partial) → invoke fcd-surface to define missing ports (planned) |
| `fcd-plan` | Shared surface protocol references co-design records from fcd-surface |
| `fcd-commission` | Commissions execute within boundaries that fcd-surface defines |
| `fcd-review` | Reviews check that implementations respect frozen surface contracts |

**Lifecycle position:**

```
fcd-diagnose ──→ [fcd-surface] ──→ fcd-card ──→ fcd-design ──→ ...
```
