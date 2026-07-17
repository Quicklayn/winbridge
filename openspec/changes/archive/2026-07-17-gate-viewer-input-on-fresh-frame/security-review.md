# Security Review

## Scope Reviewed

- `apps/agent-shell/src/viewer-local-control-surface.ts`
- `apps/agent-shell/src/viewer-local-control-surface.test.ts`
- `scripts/mvp-session-smoke.mjs`
- `scripts/mvp-session-smoke.test.ts`
- `README.md`
- `docs/security-model.md`
- `openspec/changes/gate-viewer-input-on-fresh-frame/proposal.md`
- `openspec/changes/gate-viewer-input-on-fresh-frame/design.md`
- `openspec/changes/gate-viewer-input-on-fresh-frame/specs/agent-shell-consent-workflow/spec.md`
- `openspec/changes/gate-viewer-input-on-fresh-frame/specs/mvp-session-command-kit/spec.md`

## Findings

- No blocking security findings remain in the final diff.
- An initial delegated review identified an asynchronous frame-state TOCTOU,
  unordered generated-page input transitions, lifecycle smoke evidence that
  could confuse stale-frame denial with revoke, an unmatched smoke key-down,
  and insufficient executable browser coverage. The implementation and tests
  were updated for each finding before final verification.
- Final main-thread review identified one additional ambiguous-response case:
  an unreadable JSON response after an accepted down could be converted to an
  ordinary local failure without immediate cleanup. JSON parse failure now
  reaches the same server-authoritative release path as a lost response, with
  an executable generated-browser regression test.
- `/input` checks only the in-memory latest successfully served generation and
  synchronously enters the existing runtime send path. No filesystem access,
  `await`, or other frame-state mutation exists between the final freshness
  check and send. A replacement supersedes input only when `/frame` publishes
  the replacement generation at the event-loop linearization point.
- The built-in generated page validates the bounded opaque generation, reads a
  supported image response, and decodes a different generation before display.
  Repeated generations do not refresh the five-second display freshness age.
  The server contract intentionally proves latest successful service rather
  than display by an arbitrary direct loopback client.
- Missing, malformed, unseen, superseded, and stale generations fail closed.
  Only a matching release for a server-tracked accepted key or pointer down can
  pass after freshness loss. Stale caller coordinates are discarded in favor
  of the last server-accepted pointer point.
- Generated-page transitions use one promise queue, so a pointer or key up
  cannot overtake its down. Lost or unreadable responses, status permission
  loss, display staleness, page exit, disconnect, and surface stop attempt the
  server-authoritative release path. A stale-boundary timer independently
  bounds abandoned held state.
- `/release-input` requires the same exact Host, same-origin, per-run token, and
  JSON content-type gates as other mutations and accepts only an exact empty
  object. It cannot select keys, buttons, coordinates, modifiers, or actions.
  Every release still passes through existing runtime authorization and
  audit-before-send checks and cannot restore revoked permission.
- The smoke input probe consumes and validates a bounded PNG/JPEG response and
  sends pointer input plus a matching keyboard down/up pair with that served
  generation. Before the lifecycle denial probe it requires both an accepted
  host `agent-shell.permission.revoked` record for `input:pointer` and a
  sanitized active visible viewer status with pointer disabled and keyboard
  still enabled. Staleness alone cannot satisfy revoke evidence.
- Existing explicit host approval, visible active-session state, permission
  checks, pause/revoke/terminate/disconnect controls, routing checks, and
  metadata-only audit remain authoritative. The change adds no hidden session,
  unattended access, persistence, credential access, keylogging, AV/EDR
  evasion, elevation, or Windows prompt bypass.

## Verification Performed

- `npx vitest run apps/agent-shell/src/viewer-local-control-surface.test.ts`
  passed all 55 tests, including executable queue, lost-response, unreadable-
  response, release-only, stale-boundary, and linearization cases.
- The full test runner passed the 63 focused MVP smoke tests, including bounded
  frame consumption, matching key release, and explicit revoke evidence.
- `npm run verify` passed type checking, the complete repository test runner,
  build, and strict validation of all 21 main and active OpenSpec items.
- `npm run mvp:smoke -- --json` passed all 11 static checks with 33 accepted
  host and 62 accepted viewer audit records and no denied or failed records.
- No real native screen capture or OS input was run during this review.
- Two attempted follow-up delegated review processes were stopped after they
  returned no report; they are not counted as approvals. Final disposition is
  based on the recorded initial delegated findings, focused regression tests,
  final main-thread diff review, full verification, and static smoke evidence.

## Residual Risk / Follow-Up

- The viewer-surface release path sends ordinary consent-bound release events;
  it cannot release OS input after host authorization has already been revoked
  and the runtime correctly denies further input. The native Windows input
  worker therefore still requires a reviewed release-all-held-input-on-close
  guarantee before any real two-PC MVP field trial.
- The loopback surface and agent-shell remain development MVP components, not a
  packaged production desktop viewer or signed release.
- The server freshness gate does not prove that an arbitrary direct API client
  displayed or decoded a served frame. The bundled page provides that decode
  boundary; a production client needs an explicit end-to-end frame-ack design.
- Real native Windows view/control and visible two-PC evidence remain explicit
  operator-run verification after the native release-on-close safety change.
