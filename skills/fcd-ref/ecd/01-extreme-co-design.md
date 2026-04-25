---
title: "Extreme Co-Design — Philosophy"
scope: fractal-co-design/ecd
evidence: Nvidia GTC 2025-2026, Lex Fridman #494, SC25 Fireside Chat, SemiAnalysis
---

# 01 — Extreme Co-Design

> *"In the last 10 years, Moore's Law would have progressed computing about 100 times. We progressed and scaled up computing by a million times. And so we're going to keep on doing that — through extreme co-design."*
> — Jensen Huang, Lex Fridman Podcast #494, 2025

---

## What It Is

Extreme Co-Design is the philosophy of designing every layer of a system simultaneously, treating the system as one optimization problem rather than a sequence of independent layers.

The word **extreme** is deliberate. It signals integration far beyond typical "co-design" (coordinating a chip team with a firmware team). For Nvidia, extreme co-design means the GPU die, CPU, memory subsystem, NVLink interconnect fabric, networking ASICs, power delivery, cooling, rack mechanical design, operating software stack, inference runtime, and even the specific AI algorithms are all treated as a **single engineering problem co-optimized together**.

## The Quantitative Evidence

- Moore's Law alone: ~100x compute improvement over 10 years
- Nvidia's actual delivery: ~1,000,000x over the same period
- **The 10,000x delta comes entirely from co-design, not from better components**

This is the primary argument for why co-design is necessary, not merely good practice. Per-component gains are linear. Cross-surface gains are multiplicative.

---

## Core Principles

### 1. Full-Stack Simultaneous Optimization

All layers are designed in the **same engineering cycle**. Cross-layer dependencies are surfaced and resolved before commitment, not after.

### 2. The Rack Is the Unit of Compute

Not the chip. Not the server. The **rack**. 72 GPUs connected via NVLink with no GPU-to-GPU direct cable within a server — all equidistant through the Switch fabric. The system is one distributed accelerator. You cannot use a component independently — it is designed to be a node in an integrated system.

**Translated:** The domain is the unit of delivery, not the service.

### 3. Moore's Law Substitution

When per-component gains plateau, the only path to continued exponential improvement is co-optimizing how components interact. The shared surface becomes the primary site of engineering investment.

### 4. Algorithmic Co-Design

The methodology extends to the consumers of the system. Mixture of Experts models are a co-designed outcome — hardware and software teams worked with model designers to ensure MoE routing maps efficiently onto NVLink-connected multi-GPU domains. The algorithm is co-designed with the infrastructure, not adapted to it after the fact.

### 5. Constraints as First-Class Design Inputs

Every component is co-designed to operate within system-level constraints (thermal envelope, power delivery, bandwidth). Constraints are not afterthoughts; they are traded against capability from day one.

### 6. Kernel-Surface Co-Optimization

At the execution layer, runtime code and hardware capabilities are developed in direct coordination — not after the substrate ships. The compiler toolchain is aware of hardware capabilities before commitment.

---

## Product Evidence

### GB200 NVL72 (Blackwell)

36 Grace CPUs + 72 Blackwell GPUs in a liquid-cooled rack, 130 TB/s aggregate NVLink5 bandwidth.

- Delivers **30x faster** trillion-parameter LLM inference vs. prior generation
- System has only ~2x the transistors
- **The 15x delta is entirely from co-design**

### Vera Rubin Platform

Six co-designed chips. Despite doubling NVLink bandwidth, cable and connector count did not change — a mechanical co-design achievement.

### NVLink Fusion

Extends the co-design surface to third-party components. The fabric is the shared surface, and third parties join it by accepting the co-design constraints. The point: the surface is not proprietary — it is the coordination mechanism.

### Sarvam AI Inference (2026)

Most granular published example:
1. Kernel + scheduling optimizations → 2x
2. Quantization scheme co-designed with hardware → additional 2x
3. **Total: 4x** — explicitly described as "extreme hardware-software co-design"

---

## The Management Dimension

Jensen Huang holds no one-on-one meetings. All sessions are cross-functional groups where problems are solved in the presence of everyone affected by the decision. This mirrors the engineering philosophy organizationally: a surface decision cannot be made by one side alone.

---

## Summary

Extreme Co-Design is not primarily a hardware concept. It is a **design philosophy about the relationship between layers**. The insight: performance gains are not additive across independently optimized layers — they are multiplicative when layers are co-optimized across their shared surfaces.

The hardware is the domain where Nvidia proved it at scale. The principle generalizes to any system where components interact through defined surfaces.

**→ [02 — Software Translation](02-software-translation.md)**
