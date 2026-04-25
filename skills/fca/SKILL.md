---
name: fca
description: >
  Fractal Component Architecture (FCA) expert knowledge. Applies FCA principles when designing,
  reviewing, or refactoring software architecture — domain decomposition, layer stacks, port patterns,
  co-located artifacts, boundary enforcement. Use when the user asks about architecture, component
  design, domain boundaries, package structure, or references FCA directly.
user-invocable: true
---

# Fractal Component Architecture (FCA)

You are an expert in Fractal Component Architecture. FCA is a design methodology where **one structural pattern — the component — repeats at every scale** of software, from a pure function to a network of organizations.

## Core Thesis

The discipline that open-source library authors apply (clear contracts, backwards compatibility, independent testing, provider patterns) applies fractally at every level. Most codebases fail because they apply it at one level and skip the rest. FCA removes that inconsistency.

## Quick Reference

**8 structural parts** of every component:

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

**6 levels:**

| Level | Unit | Interface | Boundary | Port |
|-------|------|-----------|----------|------|
| L0 | Function | Type signature | Lexical scope | Function parameter |
| L1 | Module | Exported symbols | Module scope | Constructor injection |
| L2 | Domain | `index.ts` + README | Directory boundary | Provider interface |
| L3 | Package | `package.json` + public API | Package boundary | Exported provider interface |
| L4 | Service | HTTP endpoints / OpenAPI | Network boundary | HTTP client, env vars |
| L5 | System | Public SDK | Org boundary | API gateway, OAuth |

**Two decomposition axes:**
- **Layers** (vertical): "What should this NOT know about?" — determines dependency direction
- **Domains** (horizontal): "What concepts cohere?" — determines clustering

**Well-formed component = one domain at one layer.**

## 10 Principles (Summary)

1. Every layer produces a component
2. Interface discipline — treat exports as a library API
3. Port pattern as the standard seam for external deps
4. Every component ships verification affordances
5. Top-level components are pure composition (wiring only)
6. Verify independently, integrate minimally
7. Enforce boundaries through structure (directory = architecture)
8. Co-locate all artifacts (impl, types, tests, config, docs, observability, examples)
9. Every component is observable
10. Progressive disclosure through README indexing

## When Designing or Reviewing Architecture

Apply this checklist:

- [ ] Is each component well-formed? (one domain, one layer)
- [ ] Do dependencies flow downward only? (no circular deps)
- [ ] Are external deps accessed through ports, not direct imports?
- [ ] Are artifacts co-located with their component? (not in central dirs)
- [ ] Can each component's tests run without other components?
- [ ] Does directory structure enforce the boundaries? (import errors, not runtime checks)
- [ ] Is the top-level component pure composition? (wiring only, no business logic)

## Deep Reference

For the full FCA specification, read these files in this skill's directory:

- [reference/01-the-component.md](reference/01-the-component.md) — The 8 structural parts
- [reference/02-the-levels.md](reference/02-the-levels.md) — L0–L5 with artifacts per level
- [reference/03-layers-and-domains.md](reference/03-layers-and-domains.md) — Decomposition axes
- [reference/04-functional-programming.md](reference/04-functional-programming.md) — FP alignment
- [reference/05-principles.md](reference/05-principles.md) — The 10 principles in full detail
- [reference/06-common-patterns.md](reference/06-common-patterns.md) — Port, verification, config, observability, documentation, **architecture gate testing** patterns
- [reference/07-applied-example.md](reference/07-applied-example.md) — Full worked example applying FCA

Read the relevant reference files when you need deep detail on a specific FCA concept. The summaries above are sufficient for most architectural decisions.

## Architecture Gate Testing

FCA boundaries should be enforced by automated tests, not just code review. Three standard gates:

| Gate | Principle | Checks |
|------|-----------|--------|
| **G-PORT** | P3 | No direct `fs`/`js-yaml`/`child_process` in domain production code |
| **G-BOUNDARY** | P7 | No cross-domain runtime imports (type-only ok, ports/shared ok) |
| **G-LAYER** | P5 | No upward layer dependencies (L0 never imports L1+) |

**Implementation:** A single `architecture.test.ts` that scans imports and asserts rules. Zero deps, runs in < 1 second, co-located at the component root. Known exceptions documented as a `Set<string>` with tracking comments — the exception list IS the debt tracker.

See [reference/06-common-patterns.md](reference/06-common-patterns.md) for full pattern with code examples.

## Anti-Patterns to Flag

- **"We control both sides"** — justifies skipping interface discipline
- **God component** — everything depends on one thing
- **Artifact-type directories** — `tests/`, `types/`, `config/` at root instead of co-located
- **Central documentation** — drifts because it's not co-located with the code
- **Port-shaped wrappers** — wraps a dep without defining a real interface
- **Observability as afterthought** — bolted on instead of structural
