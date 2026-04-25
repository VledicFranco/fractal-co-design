#!/usr/bin/env node
/**
 * sync-canon.mjs
 *
 * Build-time copy of repo-root canon/ markdown into apps/docs/src/content/docs/canon/.
 *
 * Why a copy script and not symlinks: symlinks on Windows require admin or
 * Developer Mode and behave inconsistently with CI runners. A small copy is
 * the most cross-platform-robust way to keep canon/ as the single source of
 * truth while Starlight reads from src/content/docs/.
 *
 * Adjustments made during copy:
 *   - Strip the leading YAML frontmatter (canon files use a project-specific
 *     schema; Starlight's docsSchema would reject unknown fields). We replace
 *     it with a minimal Starlight-compatible frontmatter derived from the
 *     filename and the first H1 we find.
 *   - Rewrite intra-canon links so that .md targets resolve correctly under
 *     Starlight's clean-URL routing. Specifically, references like
 *     "01-the-component.md" become "/01-the-component" (relative-to-page),
 *     and "advice/" stays as "advice/".
 *
 * Idempotent: deletes the destination canon directory before copying.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SOURCE = path.join(REPO_ROOT, 'canon');
const DEST = path.resolve(__dirname, '..', 'src', 'content', 'docs', 'canon');

const FILES_TO_COPY = [
  // FCA top-level
  { src: 'fca/01-the-component.md', dest: 'fca/01-the-component.md' },
  { src: 'fca/02-the-levels.md', dest: 'fca/02-the-levels.md' },
  { src: 'fca/03-layers-and-domains.md', dest: 'fca/03-layers-and-domains.md' },
  { src: 'fca/04-functional-programming.md', dest: 'fca/04-functional-programming.md' },
  { src: 'fca/05-principles.md', dest: 'fca/05-principles.md' },
  { src: 'fca/06-common-patterns.md', dest: 'fca/06-common-patterns.md' },
  { src: 'fca/07-applied-example.md', dest: 'fca/07-applied-example.md' },
  // FCA advice
  { src: 'fca/advice/01-multiagent-systems.md', dest: 'fca/advice/01-multiagent-systems.md' },
  { src: 'fca/advice/02-co-design-dynamics.md', dest: 'fca/advice/02-co-design-dynamics.md' },
  { src: 'fca/advice/03-recursive-semantic-algorithms.md', dest: 'fca/advice/03-recursive-semantic-algorithms.md' },
  // ECD
  { src: 'ecd/01-extreme-co-design.md', dest: 'ecd/01-extreme-co-design.md' },
  { src: 'ecd/02-software-translation.md', dest: 'ecd/02-software-translation.md' },
  { src: 'ecd/03-fca-synthesis.md', dest: 'ecd/03-fca-synthesis.md' },
];

/**
 * Strip leading YAML frontmatter (between two --- lines at file start) and
 * return { frontmatterTitle, body }. If no frontmatter found, returns
 * { frontmatterTitle: null, body: original }.
 */
function stripFrontmatter(text) {
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { frontmatterTitle: null, body: text };
  }
  const end = text.indexOf('\n---', 4);
  if (end === -1) {
    return { frontmatterTitle: null, body: text };
  }
  const fm = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  const titleMatch = fm.match(/^title:\s*(.+?)\s*$/m);
  return { frontmatterTitle: titleMatch ? titleMatch[1].trim() : null, body };
}

/**
 * Pull the first H1 from the body (the "# Title" line).
 */
function extractH1(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

/**
 * Rewrite intra-canon markdown links so they work under Starlight clean URLs.
 *   "[x](01-the-component.md)"            -> "[x](01-the-component/)"
 *   "[x](./01-the-component.md#anchor)"   -> "[x](./01-the-component/#anchor)"
 *   "[x](advice/02-co-design-dynamics.md)"-> "[x](advice/02-co-design-dynamics/)"
 *   "[x](../ecd/01-extreme-co-design.md)" -> "[x](../ecd/01-extreme-co-design/)"
 * External links (http/https) are left untouched.
 */
function rewriteLinks(body) {
  return body.replace(
    /\]\(([^)\s]+?)\.md(#[^)\s]*)?\)/g,
    (match, url, anchor) => {
      if (/^https?:\/\//.test(url)) return match;
      return `](${url}/${anchor ?? ''})`;
    },
  );
}

/**
 * Build a Starlight-compatible frontmatter block from a derived title.
 */
function buildFrontmatter(title) {
  // Escape any double quotes in the title for YAML safety.
  const safe = title.replace(/"/g, '\\"');
  return `---\ntitle: "${safe}"\n---\n\n`;
}

async function rmrf(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyOne({ src, dest }) {
  const srcPath = path.join(SOURCE, src);
  const destPath = path.join(DEST, dest);
  const original = await fs.readFile(srcPath, 'utf8');
  const { frontmatterTitle, body } = stripFrontmatter(original);
  const h1Title = extractH1(body);
  const title =
    frontmatterTitle ??
    h1Title ??
    path
      .basename(src, '.md')
      .replace(/^[0-9]+-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const rewritten = rewriteLinks(body);
  const out = buildFrontmatter(title) + rewritten;
  await ensureDir(path.dirname(destPath));
  await fs.writeFile(destPath, out, 'utf8');
}

async function main() {
  // Verify source exists.
  try {
    await fs.access(SOURCE);
  } catch {
    console.error(`[sync-canon] source not found: ${SOURCE}`);
    process.exit(1);
  }
  // Wipe the destination subdirs we own. Index pages live alongside, so we
  // only wipe the numbered subdirectories.
  await rmrf(path.join(DEST, 'fca'));
  await rmrf(path.join(DEST, 'ecd'));
  await ensureDir(DEST);
  for (const entry of FILES_TO_COPY) {
    await copyOne(entry);
  }
  console.log(`[sync-canon] copied ${FILES_TO_COPY.length} files from ${SOURCE} to ${DEST}`);
}

main().catch((err) => {
  console.error('[sync-canon] failed:', err);
  process.exit(1);
});
