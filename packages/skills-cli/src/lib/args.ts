/**
 * args.ts — minimal flag parser, no dependencies.
 *
 * Supports:
 *   --flag             → boolean true (if flag is in BOOLEAN_FLAGS)
 *   --flag value       → string (otherwise)
 *   --flag=value       → string
 *   --no-flag          → boolean false
 *   positional args    → returned in order
 *
 * Unknown long options without `=` consume the next non-flag token as
 * their value, unless the flag name is in BOOLEAN_FLAGS — then it
 * stays a boolean and the next token is treated as positional.
 */

/**
 * Flags that never take a value. Keeping this list explicit prevents
 * `--dry-run install` from interpreting `install` as the dry-run value.
 */
const BOOLEAN_FLAGS = new Set([
  "help",
  "version",
  "force",
  "dry-run",
]);

export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--") {
      // Everything after `--` is positional
      positional.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const value = arg.slice(eqIdx + 1);
        flags[key] = value;
      } else {
        const key = arg.slice(2);
        if (key.startsWith("no-")) {
          flags[key.slice(3)] = false;
          continue;
        }
        if (BOOLEAN_FLAGS.has(key)) {
          flags[key] = true;
          continue;
        }
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      // Short flags — boolean only for v0.1
      const key = arg.slice(1);
      flags[key] = true;
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}
