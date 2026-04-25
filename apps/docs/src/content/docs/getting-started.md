---
title: Getting Started
description: Install the FCD Claude skills, read the canon, and learn where everything lives in the fractal-co-design repo.
---

Fractal Co-Design ships in three layers, each independently useful:

1. **The canon** — the methodology itself, in plain Markdown.
2. **The skills** — Claude Code skills that operationalize the methodology.
3. **The tools** — TypeScript packages that implement canon concepts (coming in v0.2).

You can adopt FCD by reading the canon, by installing the skills, or both.

## 1. Read the canon

The canon is the single source of truth. Two complementary references:

- [**FCA — Fractal Component Architecture**](/fractal-co-design/canon/fca/) — the structural layer. What a component is, how the same pattern recurs at every scale, the 10 principles, applied examples.
- [**ECD — Extreme Co-Design**](/fractal-co-design/canon/ecd/) — the process layer. Surface-first ordering, port freezes, co-design rituals that make FCA tractable in teams.

If you only have 30 minutes, read [The Component](/fractal-co-design/canon/fca/01-the-component/), then [Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/), then [the Applied Example](/fractal-co-design/canon/fca/07-applied-example/).

## 2. Install the Claude skills

The `fcd-*` skill family encodes FCD into Claude Code as user-invocable slash commands. Each skill is a focused, single-purpose tool — `fcd-card` for the lightest spec, `fcd-design` for full PRDs, `fcd-surface` for port co-design, and so on. See the [Skills overview](/fractal-co-design/skills/) for the full list.

The `@fractal-co-design/skills` CLI installer is in progress for v0.1. Until it ships, you can install the skills manually by cloning the repo and copying the `skills/` directory into `~/.claude/skills/`:

```bash
git clone https://github.com/VledicFranco/fractal-co-design.git
cp -r fractal-co-design/skills/fca ~/.claude/skills/
cp -r fractal-co-design/skills/fcd-* ~/.claude/skills/
```

Then in Claude Code, the slash commands `/fca`, `/fcd-ref`, `/fcd-design`, `/fcd-plan`, `/fcd-surface`, `/fcd-commission`, `/fcd-debate`, and `/fcd-review` will be available.

## 3. Where things live

The repo follows the structure FCD recommends — co-located documentation, single source of truth, every artifact next to what it describes:

| Directory | Contents |
|---|---|
| `canon/` | The single source of truth for FCD. FCA + ECD reference Markdown. |
| `skills/` | Claude Code skill source files. One subdirectory per skill, each containing a `SKILL.md`. |
| `apps/docs/` | This site (Astro + Starlight). Reads from `canon/` at build time. |
| `packages/` | TypeScript packages. Empty in v0.1; `@fractal-co-design/fca-index` arrives in v0.2. |
| `examples/` | Worked examples — custom language profiles, polyglot projects (planned). |

The docs site renders the same Markdown that lives in `canon/`. There is no second source of truth — when you read this site, you are reading the canon.

## What's next

- New to FCA? Start with [The Component](/fractal-co-design/canon/fca/01-the-component/).
- Coming from a microservices background? Read [The Levels](/fractal-co-design/canon/fca/02-the-levels/) to see how the same pattern applies from L0 to L5.
- Trying to make a team adopt FCD? Read [Extreme Co-Design](/fractal-co-design/canon/ecd/01-extreme-co-design/), then look at the [`fcd-surface`](/fractal-co-design/skills/fcd-surface/) skill — surface co-design is where the discipline becomes habitual.
- Building agent-led codebases? See [Multiagent Systems](/fractal-co-design/canon/fca/advice/01-multiagent-systems/) and [Recursive Semantic Algorithms](/fractal-co-design/canon/fca/advice/03-recursive-semantic-algorithms/).
