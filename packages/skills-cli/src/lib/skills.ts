/**
 * skills.ts — discovery and copying of bundled skills.
 *
 * The bundled `skills/` directory has the following shape:
 *
 *   skills/
 *     README.md
 *     fca/
 *     fcd-card/
 *     fcd-commission/
 *     ...
 *     _support/
 *       review-advisors/
 *       review-pipeline/
 *       review-synthesizers/
 *
 * On install we flatten `_support/*` to top-level alongside the other
 * skills (Claude Code expects flat skill directories under
 * `~/.claude/skills/`).
 */

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface BundledSkill {
  name: string;
  /** Absolute path to source directory inside the bundled skills/ dir. */
  source: string;
  /** "core" = top-level fcd-* / fca skill. "support" = from _support/. */
  kind: "core" | "support";
}

const SUPPORT_DIR = "_support";

/**
 * Enumerate every skill bundled with the CLI.
 *
 * Top-level non-directory files (e.g. README.md) and the `_support/`
 * folder itself are NOT included — `_support/` contents are pulled out
 * and listed individually as `kind: "support"`.
 */
export async function listBundledSkills(
  bundledSkillsDir: string,
): Promise<BundledSkill[]> {
  const skills: BundledSkill[] = [];

  if (!existsSync(bundledSkillsDir)) {
    return skills;
  }

  const entries = await readdir(bundledSkillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === SUPPORT_DIR) continue;
    if (entry.name.startsWith(".")) continue;

    skills.push({
      name: entry.name,
      source: join(bundledSkillsDir, entry.name),
      kind: "core",
    });
  }

  // Pull support skills up to top level.
  const supportPath = join(bundledSkillsDir, SUPPORT_DIR);
  if (existsSync(supportPath)) {
    const supportEntries = await readdir(supportPath, { withFileTypes: true });
    for (const entry of supportEntries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;

      skills.push({
        name: entry.name,
        source: join(supportPath, entry.name),
        kind: "support",
      });
    }
  }

  // Stable sort: core first (alphabetical), then support (alphabetical).
  skills.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "core" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return skills;
}

export interface InstallPlanEntry {
  skill: BundledSkill;
  target: string;
  status: "would-install" | "would-overwrite" | "would-skip-existing";
}

/**
 * Build an install plan without touching the filesystem.
 *
 * Filters by `selectedNames` if provided (intersection by skill.name).
 * Support skills are always included regardless of filter — they're
 * cheap and several `fcd-*` skills depend on them.
 */
export async function planInstall(opts: {
  skills: BundledSkill[];
  targetDir: string;
  selectedNames?: string[] | undefined;
  force: boolean;
}): Promise<InstallPlanEntry[]> {
  const { skills, targetDir, selectedNames, force } = opts;

  const filtered = selectedNames
    ? skills.filter(
        (s) => selectedNames.includes(s.name) || s.kind === "support",
      )
    : skills;

  const plan: InstallPlanEntry[] = [];
  for (const skill of filtered) {
    const target = join(targetDir, skill.name);
    const exists = existsSync(target);

    let status: InstallPlanEntry["status"];
    if (!exists) status = "would-install";
    else if (force) status = "would-overwrite";
    else status = "would-skip-existing";

    plan.push({ skill, target, status });
  }

  return plan;
}

/**
 * Execute an install plan. Returns counts.
 *
 * Failures on a single skill don't abort the whole install — they're
 * recorded and the caller decides the exit code.
 */
export async function executeInstall(
  plan: InstallPlanEntry[],
): Promise<{ installed: string[]; skipped: string[]; failed: { name: string; error: string }[] }> {
  const installed: string[] = [];
  const skipped: string[] = [];
  const failed: { name: string; error: string }[] = [];

  // Make sure the parent target exists once.
  if (plan.length > 0) {
    const parent = plan[0].target.split(/[\\/]/);
    parent.pop();
    await mkdir(parent.join("/"), { recursive: true });
  }

  for (const entry of plan) {
    if (entry.status === "would-skip-existing") {
      skipped.push(entry.skill.name);
      continue;
    }

    try {
      if (entry.status === "would-overwrite" && existsSync(entry.target)) {
        await rm(entry.target, { recursive: true, force: true });
      }
      await cp(entry.skill.source, entry.target, { recursive: true });
      installed.push(entry.skill.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed.push({ name: entry.skill.name, error: message });
    }
  }

  return { installed, skipped, failed };
}

/**
 * Remove a single skill directory.
 */
export async function uninstallSkill(opts: {
  name: string;
  targetDir: string;
}): Promise<{ removed: boolean; reason?: string }> {
  const path = join(opts.targetDir, opts.name);
  if (!existsSync(path)) {
    return { removed: false, reason: "not installed" };
  }
  const s = await stat(path);
  if (!s.isDirectory()) {
    return { removed: false, reason: "not a directory" };
  }
  await rm(path, { recursive: true, force: true });
  return { removed: true };
}
