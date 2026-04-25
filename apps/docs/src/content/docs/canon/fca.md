---
title: FCA — Fractal Component Architecture
description: The structural layer of Fractal Co-Design. What a component is, how the same pattern repeats at every scale, the 10 principles, and worked examples.
---

A design methodology for complex systems based on a single structural pattern — the **component** — that repeats at every scale of software, from a pure function to a network of organizations.

## Core thesis

Software at every scale is made of the same thing: bounded units that expose an interface, hide an architecture, accept dependencies through ports, and carry their own documentation. A pure function does this. A module does this. A package does this. A service does this. A platform does this.

Most design methodologies target one scale — microservices for the network layer, clean architecture for the application layer, SOLID for the class layer. FCA recognizes that these are all instances of the same pattern and names it once: the **component**. By applying component discipline at every level, each level reinforces the next. Pure functions make modules testable. Testable modules make packages composable. Composable packages make services reliable.

The key insight: **the discipline that open-source library authors apply — clear contracts, backwards compatibility, independent testing, provider patterns for external dependencies — is not a package-level practice. It is a universal structural discipline that applies fractally.** The reason most codebases rot is that they apply this discipline at one level (usually the package or service level) and skip it at every other level. FCA removes that inconsistency.

## Sections

| Section | Summary |
|---------|---------|
| [01 — The Component](/fractal-co-design/canon/fca/01-the-component/) | The eight structural parts: Interface, Boundary, Port, Domain, Architecture, Verification, Observability, Documentation |
| [02 — The Levels](/fractal-co-design/canon/fca/02-the-levels/) | L0 (Function) through L5 (System) — how each part manifests at every scale, the recursion, promotion and demotion |
| [03 — Layers and Domains](/fractal-co-design/canon/fca/03-layers-and-domains/) | The two decomposition axes — layers create components, domains create directories |
| [04 — Functional Programming](/fractal-co-design/canon/fca/04-functional-programming/) | Why purity at L0 matters, Effect systems as FCA at the function level |
| [05 — Principles](/fractal-co-design/canon/fca/05-principles/) | 10 concrete rules: interface discipline, ports, verification, co-location, observability, progressive disclosure |
| [06 — Common Patterns](/fractal-co-design/canon/fca/06-common-patterns/) | Port patterns, verification patterns, observability patterns, configuration patterns, documentation patterns, technology picks by level |
| [07 — Applied Example](/fractal-co-design/canon/fca/07-applied-example/) | Task management platform — the fractal demonstrated from L0 through L5 with concrete code |

### Advice

Opinionated guidance for specific situations. Not the spec — the lived experience of applying FCA in particular contexts.

| Topic | Summary |
|-------|---------|
| [01 — Multiagent Systems](/fractal-co-design/canon/fca/advice/01-multiagent-systems/) | Applying FCA when LLM agents are first-class participants in the codebase |
| [02 — Co-Design Dynamics](/fractal-co-design/canon/fca/advice/02-co-design-dynamics/) | How surface co-design plays out in practice — what works, what fails |
| [03 — Recursive Semantic Algorithms](/fractal-co-design/canon/fca/advice/03-recursive-semantic-algorithms/) | Algorithms that operate over FCA-shaped data — recursion patterns, semantic preservation |

## When to apply

FCA adds overhead. It is not worth the cost for:
- Prototypes and experiments (build the monolith, extract components when boundaries stabilize)
- Single-use scripts and tools
- Projects with a single developer who will never hand off the code

It is worth the cost when:
- Multiple consumers will compose the same logic differently
- The system will be maintained across many sessions by agents or humans without full context
- Verification speed matters — independent component tests are faster than integration tests
- The team practices parallel development — component boundaries are natural parallelization seams
- You want to reason about backwards compatibility and migration paths
