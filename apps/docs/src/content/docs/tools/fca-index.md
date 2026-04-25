---
title: fca-index
description: Semantic-search index over FCA-compliant codebases. Token-efficient component retrieval for agents — single typed queries, less than 20% the cost of grep-based search.
---

`@fractal-co-design/fca-index` indexes FCA-compliant projects using a hybrid SQLite + Lance embedding store over co-located documentation. Agents retrieve relevant code context with a single typed query at less than 20% of the token cost of recursive grep + read.

## The problem it solves

Agents navigating a codebase spend 30–60% of their token budget on file-search heuristics: recursive greps, directory listings, manifest reads, dead-end reads. In a 50-component FCA project, finding the three components relevant to a task can require 30+ file reads.

`fca-index` replaces that flow with a semantic index. After a one-time scan, a typed query returns a ranked list of component descriptors — paths, part locations, and documentation excerpts — without reading any source files. The agent reads only the files it selects from the results.

## How it works

1. **Scan.** The scanner walks your project, detects FCA components (using language profiles), extracts co-located documentation, and scores per-component coverage across the eight FCA structural parts.
2. **Embed.** Each component's documentation is embedded via Voyage AI and persisted in a local SQLite + Lance index at `.fca-index/`.
3. **Query.** Natural-language queries are embedded and matched against the index. Results are ranked `ComponentContext` records — paths, parts, levels, excerpts. Filterable by FCA part, level, and minimum coverage score.
4. **Coverage check.** A separate query reports overall and per-component documentation coverage. The index has two operating modes: `discovery` (below threshold, results are best-effort) and `production` (above threshold, results are trusted).

## Operating modes

| Mode | Condition | Effect |
|------|-----------|--------|
| `discovery` | `overallCoverageScore < threshold` (default 0.8) | Results include coverage warnings; index is best-effort |
| `production` | `overallCoverageScore >= threshold` | Results are trusted; index covers the full codebase |

Check the mode before trusting query results.

## Install

```bash
npm install @fractal-co-design/fca-index
```

The CLI binary `fca-index` and the standalone MCP server `fca-index-mcp` are installed alongside the library API.

A `VOYAGE_API_KEY` environment variable is required for embedding (scan + query). Get a key at [voyageai.com](https://voyageai.com).

## Reference docs

- **[Getting Started](/fractal-co-design/tools/fca-index/getting-started/)** — install, scan, query, and check coverage. Programmatic API, configuration, and per-test ports walkthrough.
- **[Language Profiles](/fractal-co-design/tools/fca-index/language-profiles/)** — built-in profiles (TypeScript, Scala, Python, Go, markdown-only), polyglot scanning, authoring custom profiles.
- **[MCP Tools](/fractal-co-design/tools/fca-index/mcp-tools/)** — `context_query`, `context_detail`, `coverage_check` MCP tools. Standalone deployment via `fca-index-mcp`.
- **[Architecture](/fractal-co-design/tools/fca-index/architecture/)** — layer placement, domain map, port boundaries, architectural gates.

## Status

- **License:** Apache-2.0
- **Stability:** v1.0 — production-ready. Public ports are frozen and follow semver.
- **Source:** [`packages/fca-index/`](https://github.com/VledicFranco/fractal-co-design/tree/main/packages/fca-index)
- **Migration history:** Migrated from `@methodts/fca-index@0.4.x` (full git history preserved). The `@methodts/` line is deprecated — install `@fractal-co-design/fca-index@1.0.0+` instead.
