---
title: fcd-surface
description: Co-design a shared surface (port interface) between two domains before either side implements. The core FCD ritual.
---

> **Trigger:** `/fcd-surface [domain A] [domain B] [description of what flows between them]`

The core FCD ritual. Co-designs the port interface between two domains, names it, defines typed signatures, assigns producer and consumer roles, freezes the contract, and produces a gate assertion plus a co-design record. Implements ECD Rule 3: *the port is frozen before implementation starts*.

## When to use

Use `fcd-surface` whenever two domains need to interact and a port interface does not yet exist (or exists but is not frozen). This is the skill that prevents the most common form of architectural rot: ports that drift because two teams optimized them independently to fit their own internal architecture.

If you are not sure whether a surface needs co-design, the [`fcd-debate`](/fractal-co-design/skills/fcd-debate/) skill includes a mandatory Surface Advocate that flags decisions affecting shared surfaces.

## What you get

A frozen port artifact: typed interface, producer and consumer assignments, co-design rationale, and a gate assertion that downstream commissions can check before they begin implementation. Once the surface is frozen, neither side can change it unilaterally — the port becomes a stable contract that both sides design against.

**Canon reference:** [ECD — Software Translation](/fractal-co-design/canon/ecd/02-software-translation/) and [FCA — The Component (Port section)](/fractal-co-design/canon/fca/01-the-component/).
