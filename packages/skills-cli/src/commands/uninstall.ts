/**
 * uninstall command — remove an installed skill directory.
 */

import { c, sym } from "../lib/colors.js";
import { defaultInstallTarget, expandHome } from "../lib/paths.js";
import { uninstallSkill } from "../lib/skills.js";

export interface UninstallOptions {
  name: string;
  target?: string | undefined;
}

export async function runUninstall(opts: UninstallOptions): Promise<number> {
  const target = opts.target ? expandHome(opts.target) : defaultInstallTarget();

  const result = await uninstallSkill({ name: opts.name, targetDir: target });

  if (result.removed) {
    console.log(`${sym.ok} removed ${c.bold(opts.name)} from ${c.gray(target)}`);
    return 0;
  }
  console.log(
    `${sym.warn} ${c.bold(opts.name)} not removed: ${c.gray(result.reason ?? "unknown reason")}`,
  );
  return 1;
}
