/**
 * colors.ts — tiny ANSI color helpers, no dependencies.
 *
 * Honors NO_COLOR (https://no-color.org) and FORCE_COLOR. Disables
 * colors when stdout is not a TTY unless FORCE_COLOR is set.
 */

function shouldColor(): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout.isTTY);
}

const COLORS_ENABLED = shouldColor();

function wrap(open: number, close: number, text: string): string {
  if (!COLORS_ENABLED) return text;
  return `[${open}m${text}[${close}m`;
}

export const c = {
  green: (s: string) => wrap(32, 39, s),
  red: (s: string) => wrap(31, 39, s),
  yellow: (s: string) => wrap(33, 39, s),
  blue: (s: string) => wrap(34, 39, s),
  cyan: (s: string) => wrap(36, 39, s),
  gray: (s: string) => wrap(90, 39, s),
  bold: (s: string) => wrap(1, 22, s),
  dim: (s: string) => wrap(2, 22, s),
};

export const sym = {
  ok: c.green("✓"), // ✓
  fail: c.red("✗"), // ✗
  warn: c.yellow("⚠"), // ⚠
  arrow: c.gray("→"), // →
  bullet: c.gray("•"), // •
};
