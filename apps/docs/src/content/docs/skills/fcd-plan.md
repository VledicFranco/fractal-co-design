---
title: fcd-plan
description: Decompose a PRD into FCA-partitioned commissions with mandatory Wave 0 (surfaces) and topological ordering.
---

> **Trigger:** `/fcd-plan [path to PRD file, spec file, or GitHub issue number]`

Takes a finished PRD (typically from [`fcd-design`](/fractal-co-design/skills/fcd-design/)) and decomposes it into a wave-ordered set of commissions partitioned along FCA boundaries. The defining FCD addition: **Wave 0 is non-negotiable** — every shared surface must be defined and frozen before any implementation wave begins.

## When to use

Use `fcd-plan` after you have a PRD but before any implementation starts. It produces the wave plan a multi-agent or multi-team execution will follow. It supersedes the older `forge-plan` skill.

If you only need a single-domain implementation, you may skip `fcd-plan` and go straight to [`fcd-commission`](/fractal-co-design/skills/fcd-commission/) (which still gates on port freeze). For genuinely multi-domain work, `fcd-plan` is required — it is what makes parallel execution possible without surface-related rework.

## What you get

A wave plan: Wave 0 enumerates every shared surface and assigns each to a [`fcd-surface`](/fractal-co-design/skills/fcd-surface/) commission. Subsequent waves contain implementation commissions, topologically ordered by surface dependency. Each commission is sized to fit a single agent or a small team, with explicit input ports (frozen, from earlier waves) and explicit output ports (which it owns).

**Canon reference:** [FCA — Layers and Domains](/fractal-co-design/canon/fca/03-layers-and-domains/) and [ECD — Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/).
