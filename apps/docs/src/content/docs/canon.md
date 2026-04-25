---
title: Canon
description: The single source of truth for Fractal Co-Design — the FCA structural reference and the ECD process reference.
---

The canon is the methodology itself, in plain Markdown. Two complementary references — both required reading if you want to use FCD seriously, but each useful on its own.

## [FCA — Fractal Component Architecture](/fractal-co-design/canon/fca/)

The **structural** layer. Defines what a component is, how components compose, and how the same discipline repeats at every scale of software.

Eight chapters take you from the 8-part component model through layers, domains, FP roots, the 10 principles, common patterns, and a fully worked applied example. Three advice documents cover multiagent systems, co-design dynamics, and recursive semantic algorithms.

**Start here:** [01 — The Component](/fractal-co-design/canon/fca/01-the-component/).

## [ECD — Extreme Co-Design](/fractal-co-design/canon/ecd/)

The **process** layer. Defines how teams make FCA tractable in practice: surface-first ordering, port freezes, co-design rituals.

Three chapters: the philosophy and evidence, the translation from hardware co-design to software engineering, and the synthesis that shows how FCA operationalizes ECD's principles.

**Start here:** [01 — Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/).

## How the canon is used

- **By the [`fcd-*` Claude skills](/fractal-co-design/skills/)** — each skill loads or references canon sections to inform agent behavior. The skills are the canon-in-action.
- **By this docs site** — the markdown rendered here is the same markdown stored in [`canon/`](https://github.com/VledicFranco/fractal-co-design/tree/main/canon) at the repo root. There is no duplication.
- **By tools** — `@fractal-co-design/fca-index` (and future tools) implement canon concepts (8-part components, port detection, layer assertions).

## Contributing

Substantive changes (new principles, restructured part model) need discussion via issue first — canon is the spec everything else depends on. Typo fixes and clarifications via PR. See [CONTRIBUTING.md](https://github.com/VledicFranco/fractal-co-design/blob/main/CONTRIBUTING.md).
