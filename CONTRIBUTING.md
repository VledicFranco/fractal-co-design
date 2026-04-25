# Contributing to Fractal Co-Design

Thanks for considering a contribution. FCD is a methodology project as much as it is a code project — contributions to canon, skills, and tools are all welcome.

## Where to contribute

- **Canon** (`canon/`) — FCA + ECD reference material. Substantive changes need discussion first via an issue. Typo fixes and clarifications via PR.
- **Skills** (`skills/`) — Claude Code skill files. Update the matching `canon/` cross-references when changing a skill's anchor concepts.
- **Tools** (`packages/`) — TypeScript packages following FCA themselves. New tools should propose a PRD-style design doc first (see `packages/fca-index/` for the model).
- **Docs site** (`apps/docs/`) — Astro + Starlight. Renders `canon/` for the public site at https://vledicfranco.github.io/fractal-co-design/.

## Workflow

1. Open an issue describing the change before significant work — especially for canon and tool design changes.
2. Branch from `main`. Use prefix `feat/`, `fix/`, `docs/`, `canon/` for clarity.
3. PRs target `main`. CI must pass before merge.
4. New tools follow port-first design: define and freeze the external surface (port interface) before implementation. See `canon/ecd/` for the discipline.

## License

By contributing you agree that your contribution is licensed under the MIT License (see `LICENSE`).
