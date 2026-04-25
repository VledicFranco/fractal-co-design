# Canon — Fractal Co-Design

The single source of truth for FCD. Two complementary references:

## [`fca/`](./fca/) — Fractal Component Architecture

The **structural** layer. Defines what a component is, how components compose, and how the same discipline repeats at every scale.

Reading order:

1. [`01-the-component.md`](./fca/01-the-component.md) — the 8-part component model
2. [`02-the-levels.md`](./fca/02-the-levels.md) — L0–L5, what changes between scales
3. [`03-layers-and-domains.md`](./fca/03-layers-and-domains.md) — how layers and domains organize a system
4. [`04-functional-programming.md`](./fca/04-functional-programming.md) — FP roots and constraints
5. [`05-principles.md`](./fca/05-principles.md) — the principles that make FCA fractal
6. [`06-common-patterns.md`](./fca/06-common-patterns.md) — concrete patterns
7. [`07-applied-example.md`](./fca/07-applied-example.md) — end-to-end worked example
8. [`advice/`](./fca/advice/) — opinionated advice for specific situations

## [`ecd/`](./ecd/) — Extreme Co-Design

The **process** layer. Defines how teams make FCA tractable: surface-first ordering, port freezes, co-design rituals.

Reading order:

1. [`01-extreme-co-design.md`](./ecd/01-extreme-co-design.md) — the discipline
2. [`02-software-translation.md`](./ecd/02-software-translation.md) — applying it to software
3. [`03-fca-synthesis.md`](./ecd/03-fca-synthesis.md) — how ECD and FCA fit together

## [`prds/`](./prds/) — Canonical Product Requirement Documents

The **design record** layer. Historical PRDs that specified work which shipped in `@fractal-co-design/*` packages, preserved verbatim as durable design artifacts.

See [`prds/README.md`](./prds/README.md) for the full index. Currently:

- **PRD 053** — `@fractal-co-design/fca-index` library foundation
- **PRD 054** — fca-index MCP context tools
- **PRD 057** — fca-index language profiles (v0.4.0 → v1.0.0)

## How the canon is used

- **By the [`fcd-*` Claude skills](../skills/)** — each skill loads or references canon sections to inform agent behavior. Skills are the canon-in-action.
- **By the [docs site](../apps/docs/)** — public-facing rendering with diagrams.
- **By tools** — `@fractal-co-design/fca-index` (and future tools) implement canon concepts (8-part components, port detection, layer assertions).

## Contributing to canon

Substantive changes (new principles, restructured part model) need discussion via issue first — canon is the spec everything else depends on. Typo fixes and clarifications via PR. See [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
