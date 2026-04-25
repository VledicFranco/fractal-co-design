---
title: ECD — Extreme Co-Design
description: The process layer of Fractal Co-Design. Surface-first ordering, port freezes, and the co-design rituals that make FCA tractable in teams.
---

Design philosophy for achieving superlinear gains through full-stack simultaneous optimization of shared surfaces. Originated at Nvidia for hardware; translated here to software engineering.

## Documents

| # | Document | Contents |
|---|----------|----------|
| [01](/fractal-co-design/canon/ecd/01-extreme-co-design/) | **Extreme Co-Design** | Philosophy, evidence, core principles — what it is and why it works |
| [02](/fractal-co-design/canon/ecd/02-software-translation/) | **Software Translation** | What surfaces, temporal discipline, and organizational mandates mean for software |
| [03](/fractal-co-design/canon/ecd/03-fca-synthesis/) | **FCA + ECD Synthesis** | How FCA operationalizes ECD — the dependency DAG, composition theorem, gate tests |

## Reading order

**Quick start:** Read the thesis in [01](/fractal-co-design/canon/ecd/01-extreme-co-design/), then jump to [03](/fractal-co-design/canon/ecd/03-fca-synthesis/) for the synthesis with FCA.

**Full argument:** Read in order. Each document builds on the previous.

## Core claim

Performance gains are not additive across independently optimized layers — they are **multiplicative** when layers are co-optimized across their shared surfaces. The interface between components is more important than the implementation within them.
