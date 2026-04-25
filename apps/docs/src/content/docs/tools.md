---
title: Tools
description: TypeScript packages that implement Fractal Co-Design concepts. Coming in v0.2.
---

The `packages/` directory in the FCD repo will host TypeScript tools that implement canon concepts directly — 8-part component detection, port-graph extraction, layer assertion, semantic indexing for agent retrieval.

## Status

**v0.1 — empty.** Canon and skills are stable; tooling lands in the next release.

## v0.2 — `@fractal-co-design/fca-index`

A semantic-search index over FCA-compliant codebases for token-efficient agent retrieval. It builds a graph of components, layers, and ports, then exposes targeted queries (`getComponent`, `getPortConsumers`, `findLayerViolations`) so agents can pull only the architectural context they need instead of re-reading whole packages.

The package is migrating from the upstream `@methodts/fca-index@0.4` implementation. Documentation will land here once the package is published.

## Roadmap

- **v0.2** — `@fractal-co-design/fca-index` published, full reference docs, GlyphJS architecture diagrams embedded throughout the docs site.
- **v0.3+** — additional tools (port-freeze checker, surface-design-record generator, multi-repo FCA dashboard) as the methodology stabilizes.

Want to propose a tool? Open an issue on [GitHub](https://github.com/VledicFranco/fractal-co-design/issues) — new tools follow the FCD design lifecycle (`fcd-design` → `fcd-plan` → commissions).
