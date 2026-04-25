---
title: fcd-review
description: Adversarial quality review with port-priority lens. Surface compliance first, internal architecture second.
---

> **Trigger:** `/fcd-review [file path, PR number, or description of what to review]`

Adversarial quality review with the FCD port-priority lens. Spawns contrarian advisors to attack the work, then synthesizers to defend or sequence the findings — but with one defining inversion: **surface compliance is checked first, internal architecture second**. A clean architecture behind a broken port is net-negative; the review reflects that.

## When to use

Use `fcd-review` on any non-trivial PR, design artifact, or implementation slice. It supersedes the older `forge-review` skill. Every review cast includes a mandatory **Surface Compliance Advisor** whose job is to verify that every produced and consumed port matches its frozen contract.

The priority order is: **Port correctness > Interface clarity > Architecture quality**. Findings are reported in that order and triaged with that order in mind.

## What you get

A structured review with prioritized findings, a synthesized recommendation, and an explicit verdict on surface compliance. The Surface Compliance Advisor's report is independent — even if the rest of the review is glowing, a port violation flags the work for rework before merge.

**Canon reference:** [ECD — FCA Synthesis](/fractal-co-design/canon/ecd/03-fca-synthesis/) and [FCA — Principles](/fractal-co-design/canon/fca/05-principles/).
