# Publishing

This repo uses **[changesets](https://github.com/changesets/changesets) + npm OIDC trusted publishing**. CI handles versioning, changelog generation, and `npm publish` — no NPM_TOKEN secret, no 2FA OTP required.

## Day-to-day workflow

When you make a user-visible change to a publishable package:

```bash
pnpm changeset              # interactive: pick package(s) + bump type + write a summary
git add .changeset
git commit -m "feat: …"
git push
```

The changeset file gets reviewed alongside the code change in the PR. **No PR should land a user-visible change without a changeset.**

## What CI does on push to `main`

1. **If pending changesets exist** — opens (or updates) a PR titled "chore(release): version packages". That PR:
   - Bumps each affected package's `version` in `package.json`
   - Appends entries to each package's `CHANGELOG.md`
   - Consumes the `.changeset/*.md` files

2. **If no pending changesets** (i.e. you merged the version PR) — runs `pnpm changeset publish`, which:
   - Detects each package whose `package.json` version is ahead of npm
   - Builds it (`pnpm build`)
   - Publishes to npm with `--provenance --access public`
   - Tags the commit with `<package-name>@<version>` (e.g. `@fractal-co-design/skills@0.1.1`)
   - Creates a GitHub Release per tag

## One-time setup (per package)

Before CI can publish a package, that package's npm "Trusted Publishers" must include this repo's release workflow.

1. **Publish v0.1.0 manually first** (one-time, requires your npm OTP):
   ```bash
   cd packages/skills-cli
   pnpm build
   npm publish --access public --otp=XXXXXX
   ```

2. **Configure trusted publisher** at https://www.npmjs.com/package/@fractal-co-design/<pkg>/access:
   - Section: **Trusted Publishers** → "Add trusted publisher"
   - Type: **GitHub Actions**
   - Organization or user: `VledicFranco`
   - Repository: `fractal-co-design`
   - Workflow filename: `.github/workflows/release.yml`
   - Environment: *(leave blank)*

3. From v0.1.1 onward, all publishes flow through CI — no OTP, no token, signed provenance.

## Manual fallback

If CI is broken and you need to publish manually:

```bash
pnpm install
pnpm build
pnpm changeset publish --otp=XXXXXX
```

This skips OIDC and uses your local `npm login`. Avoid unless CI is unavailable — the OIDC route is the source of truth and produces signed provenance.

## Versioning rules

| Change | Bump |
|---|---|
| Breaking API change (rename/remove public surface, semver-major behavior change) | `major` |
| New feature, additive API change | `minor` |
| Bug fix, internal refactor with no API impact, doc update affecting published README | `patch` |
| Internal-only changes (CI, dev tooling, tests not affecting published behavior) | **no changeset** — won't trigger a release |

For 0.x packages, changesets follows standard semver-0.x rules: a `major` bump goes to 1.0.0 only when the package owner is ready to commit to stability.

## Ignored packages

`apps/docs/` (`@fractal-co-design/docs`) is `private: true` and is NOT published. It's listed in `.changeset/config.json` `ignore[]`. Doc-site changes do not need a changeset.

## See also

- [Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
