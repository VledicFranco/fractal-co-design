---
title: fcd-card
description: Layer stack card — the lightest FCD specification. Five questions in 20 minutes structured by the FCD dependency DAG.
---

> **Trigger:** `/fcd-card [component name or description]`

The lightest specification in the FCD family. A layer stack card answers five questions in about 20 minutes and produces a tier-ordered description of a new component — Tier 1 (Domain, Ports) first, Tier 2-3 (Config, Auth, Observability) following from them.

## When to use

Use `fcd-card` when you need a quick spec for a new component but a full PRD would be overkill. It implements ECD Rule 1: *no new service without a complete layer stack proposal*. The card is enough to start surface co-design, schedule commissions, or argue about whether the component should exist at all.

If the work warrants a full PRD with phases, surface choreography, and acceptance gates, use [`fcd-design`](/fractal-co-design/skills/fcd-design/) instead.

## What you get

A short, structured artifact that names the component's domain, its ports (consumed and produced), its configuration requirements, its authentication needs, and its observability obligations — in the dependency order the FCD DAG specifies. Tier 1 (Domain, Ports) is the primary deliverable; Tier 2-3 (Config, Auth, Observability) is filled in once Tier 1 is stable.

**Canon reference:** [FCA — The Component](/fractal-co-design/canon/fca/01-the-component/) and [ECD — Software Translation](/fractal-co-design/canon/ecd/02-software-translation/).
