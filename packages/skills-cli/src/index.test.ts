/**
 * index.test.ts — vitest suite for the skills CLI.
 *
 * Uses a synthetic bundled-skills directory and a temp install target
 * so the user's actual ~/.claude/skills/ is never touched.
 */

import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseArgs } from "./lib/args.js";
import {
  executeInstall,
  listBundledSkills,
  planInstall,
  uninstallSkill,
} from "./lib/skills.js";
import { expandHome } from "./lib/paths.js";

/**
 * Build a synthetic bundled skills/ tree:
 *
 *   <root>/
 *     README.md
 *     fca/SKILL.md
 *     fca/reference/sub.md
 *     fcd-card/SKILL.md
 *     fcd-design/SKILL.md
 *     fcd-review/SKILL.md
 *     _support/
 *       review-advisors/SKILL.md
 *       review-pipeline/SKILL.md
 */
async function makeFixtureSkills(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "fcd-bundled-"));

  await writeFile(join(dir, "README.md"), "# fixture\n");

  const coreSkills = ["fca", "fcd-card", "fcd-design", "fcd-review"];
  for (const name of coreSkills) {
    const path = join(dir, name);
    await mkdir(path, { recursive: true });
    await writeFile(
      join(path, "SKILL.md"),
      `---\nname: ${name}\n---\nfixture body for ${name}\n`,
    );
  }

  // Subdirectory inside fca/ to test recursive copy.
  const fcaRef = join(dir, "fca", "reference");
  await mkdir(fcaRef, { recursive: true });
  await writeFile(join(fcaRef, "sub.md"), "subdir content\n");

  // Support skills under _support/ — these get flattened on install.
  const supportRoot = join(dir, "_support");
  for (const name of ["review-advisors", "review-pipeline"]) {
    const path = join(supportRoot, name);
    await mkdir(path, { recursive: true });
    await writeFile(
      join(path, "SKILL.md"),
      `---\nname: ${name}\n---\nfixture support for ${name}\n`,
    );
  }

  return dir;
}

let bundledDir: string;
let targetDir: string;

beforeEach(async () => {
  bundledDir = await makeFixtureSkills();
  targetDir = await mkdtemp(join(tmpdir(), "fcd-target-"));
});

afterEach(async () => {
  await rm(bundledDir, { recursive: true, force: true });
  await rm(targetDir, { recursive: true, force: true });
});

describe("parseArgs", () => {
  it("parses positional arguments", () => {
    const r = parseArgs(["install", "extra"]);
    expect(r.positional).toEqual(["install", "extra"]);
    expect(r.flags).toEqual({});
  });

  it("parses --flag value", () => {
    const r = parseArgs(["install", "--target", "/tmp/x"]);
    expect(r.flags.target).toBe("/tmp/x");
  });

  it("parses --flag=value", () => {
    const r = parseArgs(["install", "--target=/tmp/x"]);
    expect(r.flags.target).toBe("/tmp/x");
  });

  it("parses bare boolean flag", () => {
    const r = parseArgs(["install", "--force"]);
    expect(r.flags.force).toBe(true);
  });

  it("parses --dry-run as boolean", () => {
    const r = parseArgs(["install", "--dry-run"]);
    expect(r.flags["dry-run"]).toBe(true);
  });

  it("parses --skills with comma list", () => {
    const r = parseArgs(["install", "--skills", "fcd-design,fcd-review"]);
    expect(r.flags.skills).toBe("fcd-design,fcd-review");
  });

  it("treats --dry-run as boolean even before a positional command", () => {
    // Regression: --dry-run install used to consume "install" as the value.
    const r = parseArgs(["--dry-run", "install"]);
    expect(r.flags["dry-run"]).toBe(true);
    expect(r.positional).toEqual(["install"]);
  });

  it("treats --force as boolean even before a positional command", () => {
    const r = parseArgs(["--force", "install"]);
    expect(r.flags.force).toBe(true);
    expect(r.positional).toEqual(["install"]);
  });

  it("flag order does not matter — install --dry-run works too", () => {
    const r = parseArgs(["install", "--dry-run", "--target", "/tmp/x"]);
    expect(r.positional).toEqual(["install"]);
    expect(r.flags["dry-run"]).toBe(true);
    expect(r.flags.target).toBe("/tmp/x");
  });
});

describe("listBundledSkills", () => {
  it("enumerates all bundled skills, flattening _support", async () => {
    const skills = await listBundledSkills(bundledDir);
    const names = skills.map((s) => s.name).sort();
    expect(names).toEqual([
      "fca",
      "fcd-card",
      "fcd-design",
      "fcd-review",
      "review-advisors",
      "review-pipeline",
    ]);

    const support = skills.filter((s) => s.kind === "support").map((s) => s.name);
    expect(support.sort()).toEqual(["review-advisors", "review-pipeline"]);

    const core = skills.filter((s) => s.kind === "core").map((s) => s.name);
    expect(core.sort()).toEqual(["fca", "fcd-card", "fcd-design", "fcd-review"]);
  });

  it("skips top-level files like README.md", async () => {
    const skills = await listBundledSkills(bundledDir);
    expect(skills.find((s) => s.name === "README.md")).toBeUndefined();
  });

  it("returns empty array when directory does not exist", async () => {
    const skills = await listBundledSkills(join(targetDir, "nonexistent"));
    expect(skills).toEqual([]);
  });
});

describe("planInstall (dry-run mapping)", () => {
  it("plans install for all skills when no filter is provided", async () => {
    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: false,
    });
    expect(plan.length).toBe(skills.length);
    for (const entry of plan) {
      expect(entry.target).toBe(join(targetDir, entry.skill.name));
      expect(entry.status).toBe("would-install");
    }
  });

  it("filter respects comma-separated --skills list", async () => {
    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: ["fcd-design"],
      force: false,
    });
    const names = plan.map((p) => p.skill.name).sort();
    // fcd-design plus all support skills (always included).
    expect(names).toEqual([
      "fcd-design",
      "review-advisors",
      "review-pipeline",
    ]);
  });

  it("--target override is reflected in plan paths", async () => {
    const skills = await listBundledSkills(bundledDir);
    const customTarget = join(targetDir, "custom-skills");
    const plan = await planInstall({
      skills,
      targetDir: customTarget,
      selectedNames: undefined,
      force: false,
    });
    for (const entry of plan) {
      expect(entry.target.startsWith(customTarget)).toBe(true);
    }
  });
});

describe("executeInstall", () => {
  it("installs all skills into target", async () => {
    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: false,
    });
    const result = await executeInstall(plan);

    expect(result.failed).toEqual([]);
    expect(result.installed.sort()).toEqual([
      "fca",
      "fcd-card",
      "fcd-design",
      "fcd-review",
      "review-advisors",
      "review-pipeline",
    ]);

    const installedDirs = (await readdir(targetDir)).sort();
    expect(installedDirs).toEqual([
      "fca",
      "fcd-card",
      "fcd-design",
      "fcd-review",
      "review-advisors",
      "review-pipeline",
    ]);

    // Recursive copy preserved subdirectories.
    expect(existsSync(join(targetDir, "fca", "reference", "sub.md"))).toBe(true);
    expect(existsSync(join(targetDir, "fca", "SKILL.md"))).toBe(true);
  });

  it("without --force, existing skills are skipped (not overwritten)", async () => {
    // Pre-create one skill with a marker file we can detect.
    const existing = join(targetDir, "fcd-design");
    await mkdir(existing, { recursive: true });
    await writeFile(join(existing, "MARKER.txt"), "preserved\n");

    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: false,
    });

    const designEntry = plan.find((p) => p.skill.name === "fcd-design");
    expect(designEntry?.status).toBe("would-skip-existing");

    const result = await executeInstall(plan);
    expect(result.skipped).toContain("fcd-design");
    // Marker is preserved because we didn't touch the dir.
    expect(existsSync(join(existing, "MARKER.txt"))).toBe(true);
  });

  it("with --force, existing skills are overwritten", async () => {
    const existing = join(targetDir, "fcd-design");
    await mkdir(existing, { recursive: true });
    await writeFile(join(existing, "MARKER.txt"), "preserved\n");

    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: true,
    });

    const designEntry = plan.find((p) => p.skill.name === "fcd-design");
    expect(designEntry?.status).toBe("would-overwrite");

    const result = await executeInstall(plan);
    expect(result.installed).toContain("fcd-design");
    // Marker is gone — directory was replaced.
    expect(existsSync(join(existing, "MARKER.txt"))).toBe(false);
    // But the bundled SKILL.md is now there.
    expect(existsSync(join(existing, "SKILL.md"))).toBe(true);
  });
});

describe("uninstallSkill", () => {
  it("removes an installed skill directory in a temp dir", async () => {
    // Install everything first.
    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: false,
    });
    await executeInstall(plan);

    expect(existsSync(join(targetDir, "fcd-design"))).toBe(true);

    const result = await uninstallSkill({
      name: "fcd-design",
      targetDir,
    });
    expect(result.removed).toBe(true);
    expect(existsSync(join(targetDir, "fcd-design"))).toBe(false);

    // Other skills untouched.
    expect(existsSync(join(targetDir, "fca"))).toBe(true);
  });

  it("returns removed:false when skill is not installed", async () => {
    const result = await uninstallSkill({
      name: "does-not-exist",
      targetDir,
    });
    expect(result.removed).toBe(false);
    expect(result.reason).toBe("not installed");
  });
});

describe("expandHome", () => {
  it("returns path unchanged when no leading ~", () => {
    expect(expandHome("/tmp/x")).toBe("/tmp/x");
    expect(expandHome("foo/bar")).toBe("foo/bar");
  });

  it("expands ~ alone", () => {
    const result = expandHome("~");
    expect(result.length).toBeGreaterThan(1);
    expect(result.includes("~")).toBe(false);
  });

  it("expands ~/path", () => {
    const result = expandHome("~/skills");
    expect(result.endsWith("skills")).toBe(true);
    expect(result.includes("~")).toBe(false);
  });
});

describe("recursive subdirectory copy", () => {
  it("copies nested directories like fcd-ref/fca/ correctly", async () => {
    // Add a nested structure mimicking fcd-ref/{fca,ecd}/
    const nested = join(bundledDir, "fcd-ref");
    await mkdir(join(nested, "fca", "advice"), { recursive: true });
    await mkdir(join(nested, "ecd"), { recursive: true });
    await writeFile(join(nested, "SKILL.md"), "ref body\n");
    await writeFile(join(nested, "fca", "principle.md"), "principle\n");
    await writeFile(join(nested, "fca", "advice", "tip.md"), "tip\n");
    await writeFile(join(nested, "ecd", "rule.md"), "rule\n");

    const skills = await listBundledSkills(bundledDir);
    const plan = await planInstall({
      skills,
      targetDir,
      selectedNames: undefined,
      force: false,
    });
    const result = await executeInstall(plan);
    expect(result.failed).toEqual([]);

    const installedRef = join(targetDir, "fcd-ref");
    expect(existsSync(join(installedRef, "SKILL.md"))).toBe(true);
    expect(existsSync(join(installedRef, "fca", "principle.md"))).toBe(true);
    expect(existsSync(join(installedRef, "fca", "advice", "tip.md"))).toBe(true);
    expect(existsSync(join(installedRef, "ecd", "rule.md"))).toBe(true);

    const refStat = await stat(installedRef);
    expect(refStat.isDirectory()).toBe(true);
  });
});
