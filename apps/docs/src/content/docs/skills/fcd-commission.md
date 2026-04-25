---
title: fcd-commission
description: Implement against frozen ports. Includes a mandatory port-freeze pre-check gate. Supports solo and orchestrated multi-agent modes.
---

> **Trigger:** `/fcd-commission [task or PRD path]` or `/fcd-commission --orchestrate [PRD path]`

The implementation skill. Before writing any code, `fcd-commission` runs a Phase 0 gate that verifies every consumed port is defined and frozen. If a required surface is undefined or unfrozen, the skill **refuses to implement** and routes the work back to [`fcd-surface`](/fractal-co-design/skills/fcd-surface/).

## When to use

Use `fcd-commission` for any non-trivial implementation work. It has two modes:

- **Solo** — single-agent, single-domain. Best for the inside of one component, where the port surfaces it consumes are already frozen.
- **Orchestrated** — multi-agent, multi-domain via sub-agents. Best for executing a wave plan from [`fcd-plan`](/fractal-co-design/skills/fcd-plan/), where multiple slices implement in parallel.

The ECD addition is the Phase 0 gate. This is what makes FCD's surface-first discipline real at execution time — the skill enforces it instead of trusting the agent to remember.

## What you get

A complete, port-aligned implementation that respects every frozen surface as a hard constraint. Internal architecture, naming, and verification are determined by the agent (or sub-agents in orchestrated mode); the surfaces are not negotiable. Output is a clean PR-ready set of changes with the port-freeze checks recorded.

**Canon reference:** [FCA — The Component](/fractal-co-design/canon/fca/01-the-component/) and [ECD — FCA Synthesis](/fractal-co-design/canon/ecd/03-fca-synthesis/).
