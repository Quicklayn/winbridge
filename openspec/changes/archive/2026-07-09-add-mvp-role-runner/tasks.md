## 1. Foreground Role Runner

- [x] 1.1 Add `scripts/mvp-role-runner.mjs` with bounded argument parsing, dry-run/json output, and live foreground spawning for one role.
- [x] 1.2 Add the root `mvp:run` package script.
- [x] 1.3 Ensure live runs require explicit session, pairing, relay target, and `--i-understand-foreground`.
- [x] 1.4 Ensure relay, host, and viewer argv preserve reviewed command-kit role markers without executing shell-rendered command strings.

## 2. Readiness, Doctor, Docs, and Review

- [x] 2.1 Update `mvp:doctor` script alignment checks for `mvp:run`.
- [x] 2.2 Update `mvp:ready` to validate runner dry-run metadata for relay, host, and viewer.
- [x] 2.3 Update README and main `mvp-session-command-kit` OpenSpec spec.
- [x] 2.4 Perform a security review covering foreground spawn, token-env, logs, capture, and input boundaries.

## 3. Tests and Verification

- [x] 3.1 Add focused runner tests for parsing, dry-run metadata, live spawn injection, and bounded failures.
- [x] 3.2 Add doctor and ready tests for runner script/dry-run drift.
- [x] 3.3 Run focused runner, doctor, and ready tests.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
