# @fractal-co-design/fca-index

## 1.0.1

### Patch Changes

- fe997ba: Fix YAML parser silently dropping configuration on Windows (CRLF) and on
  files with inline `# comments` or comment-only continuation lines.

  Three independent bugs in `manifest-reader.ts` combined to make
  `scanConfig` parse to `{}` for any real-disk YAML on Windows: (1)
  `split('\n')` left `\r` on every line and the line regexes use `(.+)$`
  where `.` doesn't match `\r` and `$` doesn't anchor before it, so every
  line failed; (2) inline `# comment` text was retained as part of the
  value (e.g. a list item `"modules/**" # broadened` parsed to that whole
  string, not `modules/**`); (3) comment-only lines reset
  `currentArrayKey`, dropping any list items below the comment.

  Also adds inline-flow handling for `requiredParts`, `sourcePatterns`,
  and `excludePatterns` — previously only `languages` honored the
  `key: [a, b]` form; the others silently fell through.

  7 new regression tests; 297/297 pass.
