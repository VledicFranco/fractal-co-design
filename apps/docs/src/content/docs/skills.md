---
title: Claude Skills
description: The fcd-* skill family for Claude Code — operationalizes Fractal Co-Design as user-invocable slash commands.
---

The `fcd-*` skill family encodes Fractal Co-Design into [Claude Code](https://claude.ai/code) as user-invocable slash commands. Each skill is single-purpose and aligned to one stage of the FCD lifecycle. Together they let an agent (or a human-in-the-loop) walk a problem from spec to merged-ready PR while keeping FCA structure and ECD process discipline intact.

## Install

The `@fractal-co-design/skills` CLI installer is in progress for v0.1. Until it ships, install manually:

```bash
git clone https://github.com/VledicFranco/fractal-co-design.git
cp -r fractal-co-design/skills/fca ~/.claude/skills/
cp -r fractal-co-design/skills/fcd-* ~/.claude/skills/
```

The skills become available as slash commands in Claude Code: `/fca`, `/fcd-ref`, `/fcd-card`, `/fcd-design`, `/fcd-plan`, `/fcd-surface`, `/fcd-commission`, `/fcd-debate`, `/fcd-review`.

## The family

The skills sit in two tiers — the foundation (`fca`, `fcd-ref`) and the lifecycle (everything else). Lifecycle skills depend on the foundation: load `fcd-ref` first if you want the agent to behave with FCD discipline across a session.

| Skill | Lifecycle | Purpose |
|---|---|---|
| [`fca`](/fractal-co-design/skills/fca/) | reference | Pure FCA expertise — architecture review, domain decomposition, layer questions. |
| [`fcd-ref`](/fractal-co-design/skills/fcd-ref/) | reference | Foundation — combined FCA + ECD discipline. Load this before any lifecycle skill. |
| [`fcd-card`](/fractal-co-design/skills/fcd-card/) | specify | Lightest spec — a 5-question layer stack card in 20 minutes. |
| [`fcd-design`](/fractal-co-design/skills/fcd-design/) | specify | Full PRD with surface-first architecture: domains → surfaces → architecture → phases. |
| [`fcd-plan`](/fractal-co-design/skills/fcd-plan/) | plan | Decompose a PRD into FCA-partitioned commissions with mandatory Wave 0 (surfaces). |
| [`fcd-surface`](/fractal-co-design/skills/fcd-surface/) | define | Co-design and freeze a port interface between two domains. |
| [`fcd-commission`](/fractal-co-design/skills/fcd-commission/) | execute | Implement against frozen ports, with a port-freeze pre-check gate. |
| [`fcd-debate`](/fractal-co-design/skills/fcd-debate/) | decide | Multi-character expert council for adversarial debate, with a mandatory Surface Advocate. |
| [`fcd-review`](/fractal-co-design/skills/fcd-review/) | review | Adversarial quality review — port compliance first, internal architecture second. |

## How they fit together

A typical FCD session walks the lifecycle in order:

1. **Specify** — `fcd-card` for a quick layer stack, or `fcd-design` for a full PRD.
2. **Plan** — `fcd-plan` decomposes the PRD into commissions with Wave 0 (surfaces) first.
3. **Define** — `fcd-surface` co-designs each shared port and freezes the contract.
4. **Decide** — `fcd-debate` resolves any non-trivial design choices with adversarial debate.
5. **Execute** — `fcd-commission` implements one slice, gated by the port-freeze pre-check.
6. **Review** — `fcd-review` runs the port-priority adversarial review on the work.

You don't have to use every skill on every problem. The discipline is: *if a surface is involved, co-design it before either side implements*. The skills enforce that discipline.
