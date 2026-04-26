# Fractal Co-Design (FCD)

> **Port-first. Surface before architecture. The same structural discipline at every scale.**

Fractal Co-Design is a software design methodology that combines two complementary ideas:

- **Fractal Component Architecture (FCA)** — *structural*. The same 8-part component model repeats from a function to a package to a system. Co-located documentation. Port-based dependency injection. Boundaries enforced by directory structure.
- **Extreme Co-Design (ECD)** — *process*. Domains identified first, shared surfaces (ports) co-designed second, internal architecture follows third — constrained by the frozen ports.

Together: every cross-domain interaction is a co-designed, frozen port. Architecture decisions follow port correctness, not the other way around.

## What this repo contains

| Directory | What |
|---|---|
| **[`canon/`](./canon/)** | The single source of truth — FCA reference (8-part component model, levels, principles) + ECD reference (extreme co-design, software translation, FCA synthesis) |
| **[`packages/`](./packages/)** | Tools — `@fractal-co-design/fca-index@1.0` (semantic-search index over FCA codebases for token-efficient agent retrieval) and `@fractal-co-design/skills` (CLI installer for the `fcd-*` skill family) |
| **[`skills/`](./skills/)** | Claude Code skills — the `fcd-*` family (`fcd-card`, `fcd-design`, `fcd-plan`, `fcd-surface`, `fcd-commission`, `fcd-debate`, `fcd-review`) and the `fca` knowledge skill |
| **[`apps/docs/`](./apps/docs/)** | The documentation site — published to https://vledicfranco.github.io/fractal-co-design/ |
| **[`examples/`](./examples/)** | Worked examples — custom language profiles, polyglot projects, surface-design walkthroughs |

## Install the skills

```bash
npx @fractal-co-design/skills install
```

This drops the `fcd-*` skill family into `~/.claude/skills/`. Then use `/fcd-design`, `/fcd-review`, etc. in Claude Code.

## Read the canon

The fastest path:

1. **[FCA — The Component](./canon/fca/01-the-component.md)** — what an FCA component is, the 8 parts, the fractal claim
2. **[ECD — Extreme Co-Design](./canon/ecd/01-extreme-co-design.md)** — the process discipline that makes FCA tractable in teams
3. **[FCA — Applied Example](./canon/fca/07-applied-example.md)** — the methodology in action

Or start at the [docs site](https://vledicfranco.github.io/fractal-co-design/) which renders these with diagrams.

## Status

| Component | Status |
|---|---|
| Canon (FCA + ECD) | ✅ v0.1 |
| Claude skills (`fcd-*`) | ✅ v0.1 |
| Docs site | ✅ v0.1 |
| `@fractal-co-design/skills` CLI | ✅ v0.1 |
| `@fractal-co-design/fca-index` | ✅ v0.2 (migrated from `@methodts/fca-index@0.4`, now `@fractal-co-design/fca-index@1.0.0`) |
| Tools docs | ✅ v0.2 |

## License

MIT — see [LICENSE](./LICENSE).
