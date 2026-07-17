# Security Review

## Scope Reviewed

- `packages/windows-capture/src/persistent-worker.ts`
- `packages/windows-capture/src/persistent-worker.test.ts`
- `packages/windows-capture/src/index.ts`
- `packages/windows-capture/src/index.test.ts`
- `apps/agent-shell/src/runtime.ts`
- `apps/agent-shell/src/runtime.integration.test.ts`
- `README.md`
- `openspec/changes/reuse-foreground-windows-capture-helper/proposal.md`
- `openspec/changes/reuse-foreground-windows-capture-helper/design.md`
- `openspec/changes/reuse-foreground-windows-capture-helper/specs/agent-shell-consent-workflow/spec.md`
- `openspec/changes/reuse-foreground-windows-capture-helper/specs/windows-screen-capture/spec.md`

## Findings

- No blocking security findings were identified.
- Adapter construction and package import remain side-effect free. The default
  helper is created only after runtime capture-request audit and current grant
  validation succeed.
- The child request line contains exactly one internal `requestId`. Capture
  bounds are embedded in the fixed reviewed script; session, authorization,
  peer, frame, token, pairing, credential, path, endpoint, command, and script
  data do not enter the child protocol.
- The helper is a direct non-detached PowerShell child with piped stdio and an
  EOF-terminated read loop. It does not create a listener, service, scheduled
  task, startup entry, reconnect path, elevation flow, or unattended process.
- Worker stdout is byte-bounded before parsing. Responses require exact fields
  and matching correlation, and adapter output retains image format,
  dimension, base64, signature, and encoded-size validation.
- The adapter accepts at most two combined active and queued requests, runs one
  request at a time in FIFO order, and validates the grant at acceptance,
  before native dispatch, and after native output. Close invalidates the
  generation, rejects active and queued work, and prevents queued dispatch.
- The host runtime starts with capture locally blocked and enables it only
  after active visible authorization, successful host-indicator delivery, and
  active protocol/audit sends. Missing or failed capture-request audit blocks
  adapter creation and invocation.
- Pause, any permission revoke, termination, expiration, local or peer
  disconnect, socket close, authorization replacement, reset, and runtime stop
  block capture and attempt close before later lifecycle mutation. Runtime stop
  closes capture before host-indicator deactivation. Lifecycle audit failure
  leaves the independent local capture block set.
- Native success is followed by current routing, authorization id, active
  visible unexpired state, permission, local block, and connectivity checks.
  Late output cannot create completion audit or frame-send evidence after
  lifecycle loss. Completion or audited-send failure after native success
  closes the adapter and blocks later capture under that authorization.
- Timeout, process, stderr, stdin, protocol, output, queue, close, and runtime
  failures use fixed generic errors. Tests assert that frame data, screen
  contents, native diagnostics, paths, tokens, pairing codes, credentials, and
  private markers are absent from exposed failures and trusted evidence.
- The change does not add hidden capture, input behavior, keylogging,
  credential or clipboard access, file transfer, persistence, privilege
  elevation, AV/EDR evasion, Windows prompt bypass, or host-indicator
  suppression.

## Verification Performed

- `npx vitest run packages/windows-capture/src/persistent-worker.test.ts packages/windows-capture/src/index.test.ts`
  passed 35 tests.
- `npx vitest run apps/agent-shell/src/runtime.integration.test.ts -t "capture"`
  passed 22 focused tests.
- `npx vitest run apps/agent-shell/src/runtime.integration.test.ts` passed all
  319 tests.
- `npm run verify` passed type checking, the complete test runner, build, and
  strict validation of all main and active OpenSpec items.
- Strict validation of `reuse-foreground-windows-capture-helper` passed.
- No real native screen capture or OS input was run during this review.

## Residual Risk / Follow-Up

- The PowerShell and GDI helper remains a development MVP boundary, not a
  signed production native capture component.
- Process termination is best effort. Pipe destruction and EOF provide a
  bounded shutdown path, while generation and runtime authorization checks
  prevent late output from becoming trusted evidence.
- An injected adapter is responsible for effective synchronous cancellation;
  independent runtime post-success checks still suppress stale completion and
  send evidence if cancellation cannot stop native work immediately.
- Real native Windows capture and a visible two-PC assistance trial still need
  explicit operator-run verification before claiming live MVP evidence.
- A separate smoke-harness issue was observed on the current Node runtime:
  `fetch` does not transmit the requested mismatched `Host` header, so the
  Host-header denial probe can invoke a valid local control. That issue is
  outside this capture-helper change and requires its own OpenSpec fix before
  the aggregate static MVP smoke gate is considered reliable.
