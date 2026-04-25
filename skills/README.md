# Skills — `fcd-*` Claude Code skill family

These are the source files for the FCD Claude Code skill family. They're not packaged — they're meant to live in your `~/.claude/skills/` directory.

## Quick install (recommended)

```bash
npx @fractal-co-design/skills install
```

Drops the full `fcd-*` family + the `fca` knowledge skill + the support skills they depend on into `~/.claude/skills/`.

To install only specific skills:

```bash
npx @fractal-co-design/skills install --skills fcd-design,fcd-review
```

To upgrade to the latest version:

```bash
npx @fractal-co-design/skills install --force
```

## Manual install

```bash
# From the repo root
cp -r skills/* ~/.claude/skills/
```

## What's included

### Core knowledge skill

| Skill | Purpose |
|---|---|
| **`fca`** | FCA expert knowledge. Loaded when discussing architecture, component design, domain boundaries, port patterns. |

### FCD lifecycle skills

| Skill | Trigger | Purpose |
|---|---|---|
| **`fcd-ref`** | (foundation) | Behavioral discipline + canon reference. Loaded by all other `fcd-*` skills. |
| **`fcd-card`** | `/fcd-card` | Layer-stack card — the lightest component spec (5 questions, 20 minutes). |
| **`fcd-design`** | `/fcd-design` | PRD-level design through surface-first architecture. |
| **`fcd-plan`** | `/fcd-plan` | Decompose a PRD into FCA-partitioned commissions with mandatory Wave 0 (surfaces). |
| **`fcd-surface`** | `/fcd-surface` | Co-design a shared port between two domains before either side implements. |
| **`fcd-commission`** | `/fcd-commission` | Implementation skill with port-freeze pre-check. |
| **`fcd-debate`** | `/fcd-debate` | Multi-character expert council with mandatory Surface Advocate. |
| **`fcd-review`** | `/fcd-review` | Adversarial quality review with port-priority lens. |

### Support skills (`_support/`)

| Skill | Used by |
|---|---|
| `review-advisors` | `fcd-review`, `fcd-debate` |
| `review-synthesizers` | `fcd-review` |
| `review-pipeline` | `fcd-review` |

These are installed automatically alongside the lifecycle skills.

## How the skills relate to the canon

Each skill loads or references material from [`../canon/`](../canon/). The canon is the **source of truth**; skills are the **canon-in-action** — operationalized as agent behavior.

When a skill says "Read FCA principle X", that principle is in `canon/fca/05-principles.md`. When a skill says "Apply ECD Rule N", that rule is in `canon/ecd/01-extreme-co-design.md`.

Substantive disagreements between a skill and the canon are bugs — file them, the canon wins.

## Versioning

Skills follow the repo's overall version. Breaking changes to skill behavior or trigger phrases are semver-major. New skills are semver-minor. Bug fixes are semver-patch.

The CLI installer (`@fractal-co-design/skills`) is versioned independently; passing `--force` overwrites whatever's in `~/.claude/skills/` with the version that ships in the installer.
