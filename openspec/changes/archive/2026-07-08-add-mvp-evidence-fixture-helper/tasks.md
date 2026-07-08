## 1. Fixture Helper

- [x] 1.1 Add `scripts/mvp-evidence-fixture.mjs` with safe argument parsing, bounded path validation, deterministic host/viewer audit JSONL generation, and bounded text/JSON output.
- [x] 1.2 Add `--verify` support that reuses the existing strict audit-summary gate in-process after writing fixtures.
- [x] 1.3 Add the root `mvp:evidence-fixture` npm script.

## 2. Readiness, Docs, and Review

- [x] 2.1 Extend `mvp:doctor` script and entrypoint alignment checks for `mvp:evidence-fixture`.
- [x] 2.2 Update README and main `mvp-audit-summary` OpenSpec spec with fixture-helper behavior.
- [x] 2.3 Perform a security review covering local log writes, bounded diagnostics, and non-runtime behavior.

## 3. Tests and Verification

- [x] 3.1 Add focused tests for fixture generation, `--verify`, JSON output, unsafe paths, bounded diagnostics, and doctor alignment.
- [x] 3.2 Run focused evidence fixture, audit summary, and doctor tests.
- [x] 3.3 Run `npm run check`.
- [x] 3.4 Run `npm test`.
- [x] 3.5 Run `npm run build`.
- [x] 3.6 Run `npm run openspec:validate`.
