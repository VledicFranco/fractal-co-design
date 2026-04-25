/**
 * install command — copy bundled skills into ~/.claude/skills/.
 */

import { c, sym } from "../lib/colors.js";
import { defaultInstallTarget, expandHome } from "../lib/paths.js";
import {
  executeInstall,
  listBundledSkills,
  planInstall,
} from "../lib/skills.js";

export interface InstallOptions {
  bundledSkillsDir: string;
  target?: string | undefined;
  skills?: string | undefined;
  force?: boolean | undefined;
  dryRun?: boolean | undefined;
}

export async function runInstall(opts: InstallOptions): Promise<number> {
  const target = opts.target ? expandHome(opts.target) : defaultInstallTarget();
  const force = Boolean(opts.force);
  const dryRun = Boolean(opts.dryRun);

  const selectedNames = opts.skills
    ? opts.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : undefined;

  const skills = await listBundledSkills(opts.bundledSkillsDir);
  if (skills.length === 0) {
    console.error(
      c.red(
        `${sym.fail} No bundled skills found at ${opts.bundledSkillsDir}.`,
      ),
    );
    console.error(
      c.gray(
        "  This usually means the package was not built — run `npm run sync-skills` first.",
      ),
    );
    return 1;
  }

  // If user specified --skills, validate every name exists.
  if (selectedNames) {
    const known = new Set(skills.map((s) => s.name));
    const unknown = selectedNames.filter((n) => !known.has(n));
    if (unknown.length > 0) {
      console.error(
        c.red(`${sym.fail} Unknown skill(s): ${unknown.join(", ")}`),
      );
      console.error(
        c.gray(
          `  Run \`fractal-co-design list\` to see what's available.`,
        ),
      );
      return 1;
    }
  }

  const plan = await planInstall({
    skills,
    targetDir: target,
    selectedNames,
    force,
  });

  console.log(c.bold("Fractal Co-Design — skill installer"));
  console.log(c.gray(`  source : ${opts.bundledSkillsDir}`));
  console.log(c.gray(`  target : ${target}`));
  console.log(
    c.gray(
      `  flags  : ${[
        force ? "--force" : null,
        dryRun ? "--dry-run" : null,
        selectedNames ? `--skills ${selectedNames.join(",")}` : null,
      ]
        .filter(Boolean)
        .join(" ") || "(none)"}`,
    ),
  );
  console.log("");

  if (dryRun) {
    console.log(c.cyan("Dry run — no files will be written."));
    console.log("");
    for (const entry of plan) {
      const tag =
        entry.status === "would-install"
          ? c.green("install ")
          : entry.status === "would-overwrite"
            ? c.yellow("overwrite")
            : c.gray("skip     ");
      const kind = entry.skill.kind === "support" ? c.dim("[support]") : "";
      console.log(
        `  ${tag} ${c.bold(entry.skill.name)} ${kind}`,
      );
      console.log(`           ${sym.arrow} ${c.gray(entry.target)}`);
    }
    console.log("");
    const wouldInstall = plan.filter(
      (p) => p.status === "would-install" || p.status === "would-overwrite",
    ).length;
    const wouldSkip = plan.filter(
      (p) => p.status === "would-skip-existing",
    ).length;
    console.log(
      c.gray(`  ${wouldInstall} would be written, ${wouldSkip} would be skipped`),
    );
    return 0;
  }

  const result = await executeInstall(plan);

  for (const name of result.installed) {
    console.log(`  ${sym.ok} installed ${c.bold(name)}`);
  }
  for (const name of result.skipped) {
    console.log(
      `  ${sym.warn} skipped  ${c.bold(name)} ${c.gray("(already exists — pass --force to overwrite)")}`,
    );
  }
  for (const fail of result.failed) {
    console.log(
      `  ${sym.fail} failed   ${c.bold(fail.name)} ${c.gray(`(${fail.error})`)}`,
    );
  }

  console.log("");
  console.log(
    c.gray(
      `  ${result.installed.length} installed, ${result.skipped.length} skipped, ${result.failed.length} failed`,
    ),
  );

  if (result.failed.length > 0) return 1;
  if (result.skipped.length > 0 && result.installed.length === 0) return 1;
  return 0;
}
