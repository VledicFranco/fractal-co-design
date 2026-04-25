#!/usr/bin/env node
/**
 * @fractal-co-design/skills — CLI entry point.
 *
 * Subcommands: install | list | uninstall
 * Flags:       --version, --help, --skills, --force, --dry-run, --target
 *
 * The CLI is published as `@fractal-co-design/skills` and exposes two
 * binaries: `fractal-co-design` and `fcd-skills` — both pointing here.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runInstall } from "./commands/install.js";
import { runList } from "./commands/list.js";
import { runUninstall } from "./commands/uninstall.js";
import { parseArgs } from "./lib/args.js";
import { c } from "./lib/colors.js";
import { resolveBundledSkillsDir } from "./lib/paths.js";

const HELP = `${c.bold("@fractal-co-design/skills")} — install fcd-* Claude Code skills

${c.bold("Usage:")}
  npx @fractal-co-design/skills <command> [options]

${c.bold("Commands:")}
  install                 Copy bundled skills into ~/.claude/skills/
  list                    List every bundled skill
  uninstall <name>        Remove an installed skill from ~/.claude/skills/

${c.bold("Install options:")}
  --skills <a,b,c>        Comma-separated list of skills to install (default: all)
  --force                 Overwrite existing skills
  --dry-run               Print what would happen without writing files
  --target <path>         Override the install directory (default: ~/.claude/skills)

${c.bold("Uninstall options:")}
  --target <path>         Override the install directory

${c.bold("Other:")}
  --version, -v           Print the CLI version
  --help, -h              Print this help

${c.bold("Examples:")}
  npx @fractal-co-design/skills install
  npx @fractal-co-design/skills install --skills fcd-design,fcd-review
  npx @fractal-co-design/skills install --force
  npx @fractal-co-design/skills install --dry-run
  npx @fractal-co-design/skills install --target /custom/path/.claude/skills/
  npx @fractal-co-design/skills list
  npx @fractal-co-design/skills uninstall fcd-design

${c.bold("More:")}
  https://github.com/VledicFranco/fractal-co-design
`;

function readVersion(): string {
  // package.json sits two directories up from dist/ at runtime.
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "package.json"), // dist/ → packages/skills-cli
    join(here, "..", "..", "package.json"), // src/ → packages/skills-cli
  ];
  for (const candidate of candidates) {
    try {
      const raw = readFileSync(candidate, "utf8");
      const pkg = JSON.parse(raw) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      // try next
    }
  }
  return "0.0.0";
}

export async function main(argv: string[]): Promise<number> {
  const { positional, flags } = parseArgs(argv);

  if (flags.version || flags.v) {
    console.log(readVersion());
    return 0;
  }

  if (flags.help || flags.h || positional.length === 0) {
    console.log(HELP);
    return positional.length === 0 && !flags.help && !flags.h ? 1 : 0;
  }

  const command = positional[0];
  let bundledSkillsDir: string;
  try {
    bundledSkillsDir = resolveBundledSkillsDir(import.meta.url);
  } catch (err) {
    console.error(c.red(err instanceof Error ? err.message : String(err)));
    return 1;
  }

  switch (command) {
    case "install":
      return runInstall({
        bundledSkillsDir,
        target: typeof flags.target === "string" ? flags.target : undefined,
        skills: typeof flags.skills === "string" ? flags.skills : undefined,
        force: flags.force === true,
        dryRun: flags["dry-run"] === true,
      });

    case "list":
      return runList(bundledSkillsDir);

    case "uninstall": {
      const name = positional[1];
      if (!name) {
        console.error(c.red("uninstall requires a skill name"));
        console.error("  Usage: fractal-co-design uninstall <skill-name>");
        return 1;
      }
      return runUninstall({
        name,
        target: typeof flags.target === "string" ? flags.target : undefined,
      });
    }

    default:
      console.error(c.red(`Unknown command: ${command}`));
      console.error(HELP);
      return 1;
  }
}

// Entry point — invoked when this module is executed directly via the
// `bin` shim. We avoid running on import for testability.
const isDirectInvocation =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectInvocation) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exit(code);
    },
    (err) => {
      console.error(c.red("Unhandled error:"), err);
      process.exit(1);
    },
  );
}
