---
title: fcd-debate
description: Multi-character expert council for adversarial debate, with a mandatory Surface Advocate that flags decisions impacting shared surfaces.
---

> **Trigger:** `/fcd-debate [problem or topic]`

A multi-character expert council that runs adversarial debate over a problem or decision. The defining FCD addition: a **mandatory Surface Advocate** in every council. The Advocate's job is to evaluate every proposed decision for its impact on shared surfaces — ports, entities, boundaries — and flag any decision that would create, modify, or bypass a surface for explicit co-design.

## When to use

Use `fcd-debate` when a decision is non-trivial and you want adversarial pressure before committing. Architecture choices, technology picks, refactor strategies, and design tradeoffs are all good candidates. It supersedes the older `forge-debate` skill.

The Surface Advocate is what makes the skill FCD-aligned rather than just generic adversarial debate. Most architectural drift starts with a small decision that quietly modifies a surface; the Advocate catches those before they become commitments.

## What you get

A structured debate transcript with positions, counter-positions, and a synthesis. When the Surface Advocate flags a surface impact, the synthesis routes that thread to [`fcd-surface`](/fractal-co-design/skills/fcd-surface/) for explicit co-design rather than letting the surface drift inside the debate's conclusion.

**Canon reference:** [ECD — Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/) and [FCA — Common Patterns](/fractal-co-design/canon/fca/06-common-patterns/).
