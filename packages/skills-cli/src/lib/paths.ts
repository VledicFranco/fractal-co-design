/**
 * paths.ts — resolve bundled skills directory and default install target.
 *
 * The CLI ships with a `skills/` directory next to the compiled binary
 * (the `files` entry in package.json includes it). At runtime we walk
 * up from `import.meta.url` to find it.
 */

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Locate the bundled `skills/` directory. Search order:
 *   1. <package-root>/skills      (production: dist/index.js → ../skills)
 *   2. <repo-root>/skills         (dev fallback before sync-skills runs)
 *
 * Throws if neither exists — the install would have nothing to copy.
 */
export function resolveBundledSkillsDir(moduleUrl: string): string {
  const here = dirname(fileURLToPath(moduleUrl));

  // Walk up looking for a sibling `skills/` directory. We try a few
  // candidate roots so the function works whether running compiled
  // (dist/) or via tsx in a workspace setup.
  const candidates = [
    resolve(here, "..", "skills"), // dist/index.js → packages/skills-cli/skills
    resolve(here, "..", "..", "skills"), // packages/skills-cli/src/lib/foo.ts → packages/skills-cli/skills
    resolve(here, "..", "..", "..", "skills"), // dist/lib/foo.js → packages/skills-cli/skills
    resolve(here, "..", "..", "..", "..", "skills"), // repo-root/skills (dev)
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Bundled skills/ directory not found. Searched:\n  ${candidates.join("\n  ")}`,
  );
}

/**
 * Default install target: ~/.claude/skills/
 *
 * Uses os.homedir() so it works on Windows, macOS, and Linux.
 */
export function defaultInstallTarget(): string {
  return join(homedir(), ".claude", "skills");
}

/**
 * Expand a leading `~` in a user-provided path, since shells on
 * Windows don't always do this for us.
 */
export function expandHome(p: string): string {
  if (p === "~") return homedir();
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return join(homedir(), p.slice(2));
  }
  return p;
}
