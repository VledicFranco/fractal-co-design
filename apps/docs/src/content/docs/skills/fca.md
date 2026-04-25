---
title: fca
description: FCA expert knowledge — applies Fractal Component Architecture principles when designing, reviewing, or refactoring software architecture.
---

> **Trigger:** the user references FCA directly, or asks about architecture, component design, domain boundaries, package structure, or layer stacks.

Fractal Component Architecture (FCA) expert knowledge. When loaded, the skill makes the agent reason about software the way an FCA practitioner does: domain decomposition, layer stacks, port patterns, co-located artifacts, and boundary enforcement.

## When to use

Load `/fca` when you want pure FCA expertise — architectural questions, domain boundary disputes, package structure decisions, refactoring reviews. It is the *knowledge* skill, not a lifecycle skill: it does not walk you through a process, it gives the agent the right vocabulary and instincts to answer FCA questions correctly.

For full FCD discipline (FCA + ECD process), load [`fcd-ref`](/fractal-co-design/skills/fcd-ref/) instead — it includes FCA knowledge plus the surface-first temporal ordering of ECD.

## What it knows

The skill loads FCA's core thesis (the same component pattern repeats at every scale), the eight structural parts of a component (Interface, Boundary, Port, Domain, Architecture, Verification, Observability, Documentation), the levels (L0 Function through L5 System), the layer/domain decomposition axes, and the 10 principles. Together these let the agent diagnose architectural problems and propose FCA-aligned solutions.

**Canon reference:** [FCA — The Component](/fractal-co-design/canon/fca/01-the-component/) and [FCA — Principles](/fractal-co-design/canon/fca/05-principles/).
