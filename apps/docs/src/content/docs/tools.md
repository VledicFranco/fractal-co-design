---
title: Tools
description: TypeScript packages that implement Fractal Co-Design concepts. Token-efficient agent retrieval, port-graph extraction, layer assertion, and more.
---

The `packages/` directory hosts TypeScript tools that implement FCD canon concepts directly. Each tool is independently installable from npm under the `@fractal-co-design/*` scope.

## Available tools

### [`@fractal-co-design/fca-index`](/fractal-co-design/tools/fca-index/) — v1.0

A semantic-search index over FCA-compliant codebases for token-efficient agent retrieval. Scans your project, builds a SQLite + Lance embedding store over component documentation, and exposes typed queries (`context_query`, `context_detail`, `coverage_check`) so agents can pull only the architectural context they need instead of re-reading whole packages.

- **Library** — programmatic API with ports-injected factory for custom wiring
- **CLI** — `fca-index scan | query | coverage`
- **MCP server** — standalone `fca-index-mcp` consumable by any MCP client (Claude Code, etc.)
- **Polyglot scanning** — built-in language profiles for TypeScript, Scala, Python, Go, and markdown-only repos

[Read the docs →](/fractal-co-design/tools/fca-index/)

## Roadmap

- **v1.1+** — additional tools (port-freeze checker, surface-design-record generator, multi-repo FCA dashboard) as the methodology stabilizes.

Want to propose a tool? Open an issue on [GitHub](https://github.com/VledicFranco/fractal-co-design/issues) — new tools follow the FCD design lifecycle (`fcd-design` → `fcd-plan` → commissions).
