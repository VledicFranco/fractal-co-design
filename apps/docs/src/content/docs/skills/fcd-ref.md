---
title: fcd-ref
description: The foundation skill — Fractal Co-Design unified reference. Combines FCA structure with ECD process into one design discipline.
---

> **Trigger:** load this before any other `fcd-*` skill, or whenever you want the agent to behave with full FCD discipline across a session.

`fcd-ref` is the foundation. It combines **FCA** (structure) and **ECD** (process) into a single behavioral discipline: port-first temporal ordering, composition-theorem priority, surface-before-architecture sequencing.

## When to use

Load `/fcd-ref` at the start of any session where you want the agent to *think* in FCD — not just answer FCD questions, but actually reorder its work to match the discipline. Every other `fcd-*` lifecycle skill assumes `fcd-ref` is already loaded; running them without it produces work that is FCA-shaped but not ECD-disciplined.

## What it changes

When loaded, the skill modifies how the agent approaches design and implementation work:

- **Port-first temporal discipline** — surfaces are co-designed and frozen before either side implements. The agent will refuse to write implementation code against an undefined or unfrozen port.
- **Composition theorem priority** — when in doubt, the agent prefers the option that preserves composability across surfaces over the option that is locally simpler.
- **Surface-before-architecture ordering** — domains are identified first, surfaces are co-designed second, internal architecture is constrained by the frozen surfaces.

**Canon reference:** [ECD — Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/) and [ECD — FCA Synthesis](/fractal-co-design/canon/ecd/03-fca-synthesis/).
