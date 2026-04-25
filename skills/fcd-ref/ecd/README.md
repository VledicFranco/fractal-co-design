---
title: Extreme Co-Design Reference
scope: fractal-co-design/ecd
---

# Extreme Co-Design (ECD) Reference

Design philosophy for achieving superlinear gains through full-stack simultaneous optimization of shared surfaces. Originated at Nvidia for hardware; translated here to software engineering.

## Documents

| # | Document | Contents |
|---|----------|----------|
| [01](01-extreme-co-design.md) | **Extreme Co-Design** | Philosophy, evidence, core principles — what it is and why it works |
| [02](02-software-translation.md) | **Software Translation** | What surfaces, temporal discipline, and organizational mandates mean for software |
| [03](03-fca-synthesis.md) | **FCA + ECD Synthesis** | How FCA operationalizes ECD — the dependency DAG, composition theorem, gate tests |

## Reading Order

**Quick start:** Read the thesis in 01, then jump to 03 for the synthesis with FCA.

**Full argument:** Read in order. Each document builds on the previous.

## Core Claim

Performance gains are not additive across independently optimized layers — they are **multiplicative** when layers are co-optimized across their shared surfaces. The interface between components is more important than the implementation within them.
