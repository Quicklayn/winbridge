## 1. Agent Token Env Parsing

- [x] 1.1 Add `--token-env` to agent-shell usage, known options, and parsing.
- [x] 1.2 Resolve agent tokens from bounded environment variable names with existing token value validation.
- [x] 1.3 Reject ambiguous `--token` plus `--token-env` input before runtime startup.
- [x] 1.4 Add focused agent args tests for valid env token resolution, malformed env names, missing env values, unsafe env token values, and dual token inputs.

## 2. MVP Command and Runner Surfaces

- [x] 2.1 Update command-kit host/viewer token references to emit agent `--token-env` markers instead of raw `--token` references.
- [x] 2.2 Update `mvp:run` live host/viewer child argv and dry-run metadata to use `--token-env`.
- [x] 2.3 Update `mvp:ready` parsers and fixtures to require reviewed `--token-env` host/viewer markers and reject raw `--token` regressions.
- [x] 2.4 Update README and main OpenSpec specs for the env-only MVP token path.

## 3. Review and Verification

- [x] 3.1 Add or update focused command-kit, role-runner, ready, and smoke tests impacted by agent token-env semantics.
- [x] 3.2 Perform a security review covering token-env parsing, argv exposure, logs, command output, and unchanged consent/capture/input boundaries.
- [x] 3.3 Run focused agent args, command-kit, role-runner, ready, and smoke tests.
- [x] 3.4 Run `npm run check`.
- [x] 3.5 Run `npm test`.
- [x] 3.6 Run `npm run build`.
- [x] 3.7 Run `npm run openspec:validate`.
