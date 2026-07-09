## Security Review

Change: `surface-evidence-fixture-in-trial-preflight`

Reviewed paths:

- `scripts/mvp-session-commands.mjs`
- `scripts/mvp-session-commands.test.ts`
- `scripts/mvp-trial.mjs`
- `scripts/mvp-trial.test.ts`
- `scripts/mvp-ready.mjs`
- `scripts/mvp-ready.test.ts`
- `README.md`
- `openspec/specs/mvp-session-command-kit/spec.md`
- `openspec/changes/surface-evidence-fixture-in-trial-preflight/specs/mvp-session-command-kit/spec.md`

## Findings

No policy-blocking issues found.

## Safety Assessment

- The change only adds fixed non-executing planning references to the existing
  `npm run mvp:ready -- --include-evidence-fixture` dry-run gate.
- `mvp:commands` and `mvp:trial` still print bounded operator workflow text or
  JSON metadata; they do not execute the referenced gate.
- The full `mvp:trial` plan labels the new step as a generated local fixture
  dry run and keeps strict role-bound post-run evidence as the live trial proof
  gate.
- Role-scoped trial output remains scoped to relay, host, viewer, or evidence;
  the new preflight section is full-plan only.
- The change does not start relay, host, viewer, browser, capture, input,
  sockets, HTTP listeners, services, startup persistence, unattended access,
  privilege elevation, remote log retrieval, log upload, credential access,
  keylogging, AV/EDR evasion, Windows prompt bypass, or hidden sessions.
- Output remains fixed and bounded; it does not add generated fixture paths,
  raw fixture JSONL, raw audit records, token values, pairing codes, relay
  URLs, local URLs, frame bytes, screen contents, input contents, credentials,
  or full secrets.

## Residual Risk

Operators could still mistake a generated fixture dry run for live-session
proof. README, OpenSpec, and trial wording explicitly state that live trial
proof requires strict role-bound post-run evidence from the visible consented
two-PC run.
