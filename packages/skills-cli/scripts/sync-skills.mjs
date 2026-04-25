#!/usr/bin/env node
/**
 * sync-skills.mjs
 *
 * Build-time helper. Copies <repo-root>/skills/* into
 * packages/skills-cli/skills/ so the bundled assets ship inside the
 * published npm tarball.
 *
 * Run before `npm publish` and as part of `pnpm build`.
 */

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PACKAGE_ROOT = resolve(__dirname, "..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "..", "..");
const SOURCE_SKILLS = join(REPO_ROOT, "skills");
const TARGET_SKILLS = join(PACKAGE_ROOT, "skills");

async function main() {
  if (!existsSync(SOURCE_SKILLS)) {
    console.error(`[sync-skills] source not found: ${SOURCE_SKILLS}`);
    process.exit(1);
  }

  const sourceStat = await stat(SOURCE_SKILLS);
  if (!sourceStat.isDirectory()) {
    console.error(`[sync-skills] source is not a directory: ${SOURCE_SKILLS}`);
    process.exit(1);
  }

  // Clean target so we don't keep stale skills around.
  if (existsSync(TARGET_SKILLS)) {
    await rm(TARGET_SKILLS, { recursive: true, force: true });
  }
  await mkdir(TARGET_SKILLS, { recursive: true });

  const entries = await readdir(SOURCE_SKILLS, { withFileTypes: true });
  let skillCount = 0;
  let supportCount = 0;

  for (const entry of entries) {
    const src = join(SOURCE_SKILLS, entry.name);
    const dst = join(TARGET_SKILLS, entry.name);

    if (entry.isDirectory()) {
      await cp(src, dst, { recursive: true });
      if (entry.name === "_support") {
        const supportEntries = await readdir(src, { withFileTypes: true });
        for (const s of supportEntries) {
          if (s.isDirectory()) supportCount++;
        }
      } else {
        skillCount++;
      }
    } else if (entry.isFile()) {
      // Top-level files like skills/README.md
      await cp(src, dst);
    }
  }

  console.log(
    `[sync-skills] synced ${skillCount} top-level skills + ${supportCount} support skills from ${SOURCE_SKILLS}`,
  );
  console.log(`[sync-skills] target: ${TARGET_SKILLS}`);
}

main().catch((err) => {
  console.error("[sync-skills] failed:", err);
  process.exit(1);
});
