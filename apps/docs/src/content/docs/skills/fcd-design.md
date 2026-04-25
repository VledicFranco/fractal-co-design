---
title: fcd-design
description: Surface-first PRD design. Domains identified first, shared surfaces co-designed second, internal architecture follows third — constrained by frozen ports.
---

> **Trigger:** `/fcd-design [problem description, feature name, file path, or GitHub issue number]`

A full PRD-class design skill that walks a problem through five stages: **Discovery → Domains → Surfaces → Architecture → Phases**. The key ECD inversion: surfaces (ports) are co-designed before any internal architecture is committed to. Architecture is the consequence of frozen surfaces, not a prerequisite for them.

## When to use

Use `fcd-design` when you need a real PRD — multi-domain work, non-trivial integration with existing systems, decisions a team will need to align on. It supersedes the older `forge-design` and `design-prd` skills.

For light-weight specs, use [`fcd-card`](/fractal-co-design/skills/fcd-card/) instead. To take a finished PRD and decompose it into implementable commissions, follow `fcd-design` with [`fcd-plan`](/fractal-co-design/skills/fcd-plan/).

## What you get

A complete PRD document with the five stages each filled in. The Domains stage names every component the work touches. The Surfaces stage co-designs every shared port. The Architecture stage is constrained by those frozen surfaces — it cannot bypass them or invent new ones implicitly. The Phases stage breaks delivery into commission-sized slices ordered so Wave 0 (surfaces) is always first.

**Canon reference:** [ECD — FCA Synthesis](/fractal-co-design/canon/ecd/03-fca-synthesis/) and [FCA — Layers and Domains](/fractal-co-design/canon/fca/03-layers-and-domains/).
