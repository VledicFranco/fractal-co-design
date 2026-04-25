/**
 * list command — show every bundled skill.
 */

import { c, sym } from "../lib/colors.js";
import { listBundledSkills } from "../lib/skills.js";

export async function runList(bundledSkillsDir: string): Promise<number> {
  const skills = await listBundledSkills(bundledSkillsDir);
  if (skills.length === 0) {
    console.error(c.red(`${sym.fail} No bundled skills found.`));
    return 1;
  }

  console.log(c.bold("Bundled skills:"));
  console.log("");

  const core = skills.filter((s) => s.kind === "core");
  const support = skills.filter((s) => s.kind === "support");

  if (core.length > 0) {
    console.log(c.cyan("  Core skills:"));
    for (const skill of core) {
      console.log(`    ${sym.bullet} ${c.bold(skill.name)}`);
    }
    console.log("");
  }

  if (support.length > 0) {
    console.log(c.cyan("  Support skills:"));
    for (const skill of support) {
      console.log(`    ${sym.bullet} ${c.bold(skill.name)}`);
    }
    console.log("");
  }

  console.log(
    c.gray(`  ${core.length} core + ${support.length} support = ${skills.length} total`),
  );
  return 0;
}
