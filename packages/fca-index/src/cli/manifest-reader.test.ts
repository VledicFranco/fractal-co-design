// SPDX-License-Identifier: Apache-2.0
/**
 * DefaultManifestReader — unit tests covering YAML parsing for the
 * `languages` field (added in v0.4.0) and existing scalar/list fields
 * (regression coverage).
 */

import { describe, it, expect } from 'vitest';
import { DefaultManifestReader } from './manifest-reader.js';
import { InMemoryFileSystem } from '../scanner/test-helpers/in-memory-fs.js';

async function readConfig(yaml: string) {
  const fs = new InMemoryFileSystem({ '/p/.fca-index.yaml': yaml });
  const reader = new DefaultManifestReader(fs);
  return reader.read('/p');
}

describe('DefaultManifestReader — languages field', () => {
  it('parses block list form for languages', async () => {
    const config = await readConfig(
      ['languages:', '  - typescript', '  - scala'].join('\n'),
    );
    expect(config.languages).toEqual(['typescript', 'scala']);
  });

  it('parses inline flow form for languages', async () => {
    const config = await readConfig('languages: [typescript, scala]');
    expect(config.languages).toEqual(['typescript', 'scala']);
  });

  it('parses inline flow with quoted scalars', async () => {
    const config = await readConfig('languages: ["typescript", "markdown-only"]');
    expect(config.languages).toEqual(['typescript', 'markdown-only']);
  });

  it('parses inline flow with single-quoted scalars', async () => {
    const config = await readConfig("languages: ['python', 'go']");
    expect(config.languages).toEqual(['python', 'go']);
  });

  it('handles empty inline flow list', async () => {
    const config = await readConfig('languages: []');
    expect(config.languages).toEqual([]);
  });

  it('omits languages when not present in YAML', async () => {
    const config = await readConfig('coverageThreshold: 0.9');
    expect(config.languages).toBeUndefined();
    expect(config.coverageThreshold).toBe(0.9);
  });

  it('preserves order of profile names in block form', async () => {
    const config = await readConfig(
      ['languages:', '  - scala', '  - python', '  - typescript'].join('\n'),
    );
    expect(config.languages).toEqual(['scala', 'python', 'typescript']);
  });

  it('coexists with other fields in any order', async () => {
    const config = await readConfig(
      [
        'coverageThreshold: 0.85',
        'languages:',
        '  - typescript',
        '  - scala',
        'embeddingModel: voyage-3-lite',
      ].join('\n'),
    );
    expect(config.languages).toEqual(['typescript', 'scala']);
    expect(config.coverageThreshold).toBe(0.85);
    expect(config.embeddingModel).toBe('voyage-3-lite');
  });

  it('returns minimal config when .fca-index.yaml is missing', async () => {
    const fs = new InMemoryFileSystem({});
    const reader = new DefaultManifestReader(fs);
    const config = await reader.read('/p');
    expect(config).toEqual({ projectRoot: '/p' });
  });
});

describe('DefaultManifestReader — regression for existing fields', () => {
  it('parses scalar fields', async () => {
    const config = await readConfig(
      [
        'coverageThreshold: 0.9',
        'embeddingModel: voyage-3-lite',
        'embeddingDimensions: 512',
        'indexDir: .my-index',
      ].join('\n'),
    );
    expect(config.coverageThreshold).toBe(0.9);
    expect(config.embeddingModel).toBe('voyage-3-lite');
    expect(config.embeddingDimensions).toBe(512);
    expect(config.indexDir).toBe('.my-index');
  });

  it('parses sourcePatterns/excludePatterns block lists', async () => {
    const config = await readConfig(
      [
        'sourcePatterns:',
        '  - src/**',
        '  - lib/**',
        'excludePatterns:',
        '  - dist/**',
      ].join('\n'),
    );
    expect(config.sourcePatterns).toEqual(['src/**', 'lib/**']);
    expect(config.excludePatterns).toEqual(['dist/**']);
  });

  it('parses requiredParts as FcaPart strings', async () => {
    const config = await readConfig(
      ['requiredParts:', '  - interface', '  - documentation', '  - port'].join('\n'),
    );
    expect(config.requiredParts).toEqual(['interface', 'documentation', 'port']);
  });

  // Regression: a YAML file saved with Windows (CRLF) line endings used to
  // parse to `{}` because `parseConfig` split on `\n` only, leaving a `\r`
  // on every line — and the regexes use `(.+)$` where neither `.` nor `$`
  // accepts `\r`. The fix splits on `/\r?\n/` so CRLF and LF are equivalent.
  it('parses CRLF line endings (Windows-style)', async () => {
    const config = await readConfig(
      [
        '# header comment',
        'languages: [typescript, scala]',
        'coverageThreshold: 0.8',
        'sourcePatterns:',
        '  - "modules/**"',
        '  - "packages/**/src/**"',
        'excludePatterns:',
        '  - "**/node_modules/**"',
      ].join('\r\n'),
    );
    expect(config.languages).toEqual(['typescript', 'scala']);
    expect(config.coverageThreshold).toBe(0.8);
    expect(config.sourcePatterns).toEqual(['modules/**', 'packages/**/src/**']);
    expect(config.excludePatterns).toEqual(['**/node_modules/**']);
  });

  it('parses mixed CRLF + LF (e.g. file with mixed line endings)', async () => {
    // Constructed to exercise both endings within a single file, which can
    // happen when files are edited across editors with different defaults.
    const yaml =
      'languages: [scala]\r\n' +
      'sourcePatterns:\r\n' +
      '  - "modules/**"\n' +    // single LF
      '  - "packages/**"\r\n';
    const config = await readConfig(yaml);
    expect(config.languages).toEqual(['scala']);
    expect(config.sourcePatterns).toEqual(['modules/**', 'packages/**']);
  });

  // Regression: inline `# comment` on a list-item or scalar value used to
  // be retained as part of the value (e.g. sourcePatterns ended up as
  // `'"modules/**"            # PRD-108 ...'`). The fix adds a
  // stripInlineComment pass, careful to only strip a `# ` that is preceded
  // by whitespace so we don't break globs/regexes that legitimately
  // contain `#`.
  it('strips trailing inline comments from list-item values', async () => {
    const config = await readConfig(
      [
        'sourcePatterns:',
        '  - "modules/**"            # PRD-108 broadened from narrower pattern',
        '  - "packages/**/src/**"',
        'excludePatterns:',
        '  - "**/target/**"   # subsumes nested target dirs',
      ].join('\n'),
    );
    expect(config.sourcePatterns).toEqual(['modules/**', 'packages/**/src/**']);
    expect(config.excludePatterns).toEqual(['**/target/**']);
  });

  it('strips trailing inline comments from scalar values', async () => {
    const config = await readConfig(
      [
        'coverageThreshold: 0.8     # raised after PRD-108 production-mode lift',
        'embeddingModel: voyage-3-lite # cheaper option for high-volume scans',
      ].join('\n'),
    );
    expect(config.coverageThreshold).toBe(0.8);
    expect(config.embeddingModel).toBe('voyage-3-lite');
  });

  it('preserves `#` characters that are part of a value (no preceding whitespace)', async () => {
    // Realistic case: a glob or regex pattern containing `#`.
    // The hash must be preceded by whitespace to be a comment.
    const config = await readConfig(
      ['sourcePatterns:', '  - "src/**/file#with#hash.txt"'].join('\n'),
    );
    expect(config.sourcePatterns).toEqual(['src/**/file#with#hash.txt']);
  });

  // Regression: comment-only continuation lines used to reset
  // `currentArrayKey`, dropping any list items below the comment.
  it('preserves array-mode across blank/comment-only lines', async () => {
    const config = await readConfig(
      [
        'sourcePatterns:',
        '  - "modules/**"',
        '  # NOTE: the next pattern catches nested apps under packages/.',
        '',
        '  - "packages/**/src/**"',
      ].join('\n'),
    );
    expect(config.sourcePatterns).toEqual(['modules/**', 'packages/**/src/**']);
  });

  // Regression: inline-flow form was only handled for `languages`.
  // requiredParts / sourcePatterns / excludePatterns silently fell through.
  it('parses requiredParts in inline-flow form', async () => {
    const config = await readConfig('requiredParts: [interface, documentation]');
    expect(config.requiredParts).toEqual(['interface', 'documentation']);
  });

  it('parses sourcePatterns in inline-flow form', async () => {
    const config = await readConfig('sourcePatterns: ["modules/**", "packages/**"]');
    expect(config.sourcePatterns).toEqual(['modules/**', 'packages/**']);
  });

  it('parses excludePatterns in inline-flow form', async () => {
    const config = await readConfig('excludePatterns: ["**/target/**", "**/dist/**"]');
    expect(config.excludePatterns).toEqual(['**/target/**', '**/dist/**']);
  });
});
