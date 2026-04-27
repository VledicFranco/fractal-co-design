# Publishing

This repo uses **[changesets](https://github.com/changesets/changesets) + npm OIDC trusted publishing**. CI handles versioning, changelog generation, and `npm publish` — no NPM_TOKEN secret, no 2FA OTP required.

## Currently published packages

| Package | npm | Source |
|---|---|---|
| `@fractal-co-design/skills` | https://www.npmjs.com/package/@fractal-co-design/skills | [`packages/skills-cli/`](./packages/skills-cli/) |
| `@fractal-co-design/fca-index` | https://www.npmjs.com/package/@fractal-co-design/fca-index | [`packages/fca-index/`](./packages/fca-index/) |

`@fractal-co-design/docs` (`apps/docs/`) is `private: true` and never published — see "Ignored packages" below.

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

Trusted publisher (OIDC) **requires the package to already exist on npm** — there's no pre-registration. So the first publish of every new package is manual; CI takes over from v(n+1).

The full recipe we use, with all the gotchas:

### Step 1 — generate a short-lived bootstrap token

npm deprecated TOTP enrollment for new accounts in September 2025. Modern npm accounts can only use passkeys + recovery codes for 2FA, and **passkeys do not work with the `npm publish` CLI** (they're browser-only). To avoid burning recovery codes on the first publish, generate a granular access token with "Bypass 2FA" enabled:

1. Go to https://www.npmjs.com/settings/<your-username>/tokens
2. **"Generate New Token" → "Granular Access Token"**
3. Fill out:
   - **Name:** `fcd-bootstrap-publish`
   - **Description:** `One-time bootstrap publish before OIDC trusted publishing is configured`
   - **Expiration:** 1 day (we only need ~30 minutes; auto-deletes itself)
   - **Allowed IP ranges:** blank
   - **Packages and scopes** → "Selected packages and scopes" → **Add scopes** → `@fractal-co-design`
   - **Permissions:** **Read and write**
   - **🔑 "Bypass two-factor authentication when publishing"** → **enable**
4. Click **Generate token** → copy the `npm_xxxx...` value (shown only once)

### Step 2 — publish the first version with the token

The token via `--//registry.npmjs.org/:_authToken=...` flag is *overridden* by your existing `npm login` session, so use a temporary userconfig file to force the token:

```bash
cd packages/<pkg>
pnpm build
echo "//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx" > /tmp/npm-bootstrap-rc
npm publish --access public --provenance=false --userconfig /tmp/npm-bootstrap-rc
rm /tmp/npm-bootstrap-rc
```

**`--provenance=false` is critical** — the package's `publishConfig.provenance: true` (set so CI publishes get provenance attestations) will fail outside of OIDC with `Automatic provenance generation not supported for provider: null`. The manual bootstrap publish skips provenance; CI publishes from then on get it automatically.

### Step 3 — configure trusted publisher in the npm web UI

Now that the package exists, the trusted publisher form is reachable:

1. Go to https://www.npmjs.com/package/@fractal-co-design/<pkg>/access
2. Scroll to **Trusted Publishers** → **"Add trusted publisher"**
3. Fill out exactly:
   - **Type:** GitHub Actions
   - **Organization or user:** `VledicFranco`
   - **Repository:** `fractal-co-design`
   - **Workflow filename:** `release.yml` *(filename only — no `.github/workflows/` prefix)*
   - **Environment:** *(blank)*
4. Save

### Step 4 — clean up the bootstrap token

Back at https://www.npmjs.com/settings/<your-username>/tokens — find the `fcd-bootstrap-publish` token and delete it. No long-lived secret remains; OIDC is the only auth path from now on.

### Step 5 — re-enable 2FA-for-writes (if you disabled it during bootstrap)

https://www.npmjs.com/settings/<your-username>/two-factor-authentication → check **"Require two-factor authentication for write actions"** → Update Preferences. CI publishes via OIDC bypass this requirement; only browser/CLI write actions still need a second factor.

### Done — from v(n+1) onward

All future publishes flow through CI via the changesets pipeline. No OTP, no token, signed provenance on every release.

## Manual fallback

If CI is broken and you need to publish manually, generate a fresh bootstrap token (see "Step 1" above), then:

```bash
pnpm install
pnpm build
echo "//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx" > /tmp/npm-bootstrap-rc
pnpm changeset publish --userconfig /tmp/npm-bootstrap-rc
rm /tmp/npm-bootstrap-rc
```

For an individual package (skipping changesets):

```bash
cd packages/<pkg>
pnpm build
echo "//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx" > /tmp/npm-bootstrap-rc
npm publish --access public --provenance=false --userconfig /tmp/npm-bootstrap-rc
rm /tmp/npm-bootstrap-rc
```

Avoid unless CI is unavailable — the OIDC route is the source of truth, produces signed provenance, and leaves no long-lived credentials. After you fix CI, delete the bootstrap token immediately.

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

## OIDC tooling requirements

The release workflow pins these versions because npm trusted publishing requires them:

| Tool | Minimum |
|---|---|
| Node | 22.14.0 |
| npm CLI | 11.5.1 |

`actions/setup-node@v4` with `node-version: '22'` ships Node 22.x but the bundled npm is 10.x — the release workflow explicitly upgrades npm with `npm install -g npm@latest` after setup-node. Don't drop that step.

## Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `404 Not Found - PUT https://registry.npmjs.com/@fractal-co-design%2f<pkg>` | npm session expired and the CLI is unauthenticated; npm masks 401 as 404 | `npm login --auth-type=web`, then retry. Or use a bootstrap token via `--userconfig`. |
| `EOTP — This operation requires a one-time password from your authenticator` | Your account has 2FA enabled and the publish is a write action | Use the bootstrap-token recipe above. Inline `--otp` flag does not accept passkey output (only authenticator-app codes or recovery codes). |
| `EOTP` even with `--//registry.npmjs.org/:_authToken=...` flag | Existing `npm login` session takes precedence over the inline token | Use `--userconfig /tmp/npm-bootstrap-rc` to force the token, or `npm logout` first. |
| `EUSAGE — Automatic provenance generation not supported for provider: null` | `publishConfig.provenance: true` is set but you're not in CI/OIDC | For manual bootstrap publishes, add `--provenance=false`. Don't remove the publishConfig — CI publishes still need it. |
| `403 Forbidden — Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages` | Account 2FA is on, and your token doesn't have "Bypass 2FA" enabled | Generate a new granular token with the bypass-2FA checkbox enabled, or use OIDC via CI. |
| Trusted publisher fails to verify on first CI publish | Wrong workflow filename in npm UI | The field expects the **filename only** (`release.yml`), not the path (`.github/workflows/release.yml`). |

## See also

- [Changesets docs](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [npm Granular Access Tokens](https://docs.npmjs.com/about-access-tokens)
