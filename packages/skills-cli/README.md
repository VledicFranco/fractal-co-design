# `@fractal-co-design/skills`

> One-command installer for the [Fractal Co-Design](https://github.com/VledicFranco/fractal-co-design) Claude Code skill family.

Drops the `fcd-*` skills, the `fca` knowledge skill, and their support skills into your `~/.claude/skills/` directory. After install, the skills are available in any Claude Code session via `/fcd-design`, `/fcd-review`, `/fcd-card`, etc.

## Quick start

```bash
npx @fractal-co-design/skills install
```

That's it. The next time you open Claude Code, the FCD skills are available.

## Commands

```bash
# Install everything (default)
npx @fractal-co-design/skills install

# Install only specific skills (support skills are always included)
npx @fractal-co-design/skills install --skills fcd-design,fcd-review

# Force-overwrite existing skills (e.g. to upgrade)
npx @fractal-co-design/skills install --force

# Preview what would be installed without writing anything
npx @fractal-co-design/skills install --dry-run

# Install into a custom directory instead of ~/.claude/skills/
npx @fractal-co-design/skills install --target /custom/path/.claude/skills/

# List every bundled skill
npx @fractal-co-design/skills list

# Remove an installed skill
npx @fractal-co-design/skills uninstall fcd-design

# Print the CLI version
npx @fractal-co-design/skills --version
```

The CLI exposes two binaries — `fractal-co-design` and `fcd-skills` — pointing at the same entry point. Use whichever feels nicer.

## What gets installed

Skills are flattened to the top level of `~/.claude/skills/` because Claude Code expects flat skill directories. The `_support/` folder in the source repo is unwrapped — its contents install alongside the lifecycle skills.

Run `npx @fractal-co-design/skills list` to see the current bundle.

## Behavior notes

- **Cross-platform.** The default target is resolved via `os.homedir()`; works on Windows, macOS, and Linux.
- **Zero runtime dependencies.** Only `node:fs`, `node:path`, `node:os`, `node:url`. No ANSI library, no arg parser — written by hand to keep the install footprint tiny.
- **Refuse-by-default.** Without `--force`, existing skill directories are not overwritten. Pass `--force` when you want to upgrade.
- **Color output.** Uses minimal ANSI escapes. Honors `NO_COLOR` and `FORCE_COLOR` env vars.

## Versioning

This CLI is versioned independently from the skills it bundles. The bundled skill source is captured at the time the package is published — passing `--force` always overwrites with whatever ships in the installed CLI version.

## License

MIT — see [`LICENSE`](https://github.com/VledicFranco/fractal-co-design/blob/main/LICENSE) at the repo root.

## Links

- Main repo: https://github.com/VledicFranco/fractal-co-design
- Issues: https://github.com/VledicFranco/fractal-co-design/issues
- Docs: https://vledicfranco.github.io/fractal-co-design/
