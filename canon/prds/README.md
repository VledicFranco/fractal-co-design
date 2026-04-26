# Canonical PRDs

Product Requirement Documents that have been promoted to FCD canon. These PRDs specified work that landed in `@fractal-co-design/*` packages and serve as the durable design record.

PRDs here are **historical specifications preserved verbatim**. They describe the design intent, constraints, gates, and decisions that shaped each release. Implementation references in older PRDs may point to the upstream `@methodts/*` packages — the migration note at the top of each file maps the upstream package to its current `@fractal-co-design/*` equivalent.

## Index

| PRD | Title | Status | Notes |
|-----|-------|--------|-------|
| [053](053-fca-index-library.md) | `@methodts/fca-index` — FCA-Indexed Context Library | Complete | Wave 0–4 build of the indexer (scanner, store, query, coverage, CLI). Now ships as `@fractal-co-design/fca-index@1.0.0`. |
| [054](054-fca-index-mcp-tools.md) | `@methodts/mcp` context tools — FCA context query + coverage check | Complete | MCP-side `context_query` / `coverage_check` / `context_detail` tools that wrap fca-index ports. |
| [057](057-fca-index-language-profiles.md) | `@methodts/fca-index` — Language profiles (v0.4.0) | Complete | Polyglot scanning via `LanguageProfile`. Five built-in profiles (typescript, scala, python, go, markdown-only). Shipped in v0.4.0, carried into v1.0.0. |

## Adding a new canonical PRD

PRDs become canonical when they've shipped and the resulting code is part of `@fractal-co-design/*`. Move (or copy verbatim) the PRD here and add:

1. A migration note at the top tying it to the package + version it spec'd.
2. An index row above.
3. Cross-links from the relevant `apps/docs/src/content/docs/tools/<tool>/` page where useful.
