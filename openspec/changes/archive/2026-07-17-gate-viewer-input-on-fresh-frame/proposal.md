## Why

The viewer local control page currently refreshes its freshness timestamp whenever
the same frame file is fetched successfully, and the local `/input` endpoint does
not know which frame the caller actually displayed. A stopped frame stream can
therefore continue to look fresh and permit control, which is unsafe for the
first real two-PC MVP trial.

## What Changes

- Track a bounded opaque generation for each newly served stable frame-file version
  without exposing frame paths, bytes, timestamps, or source metadata.
- Return that generation with an authorized local `/frame` response and reset
  page freshness only after a different generation has loaded successfully.
- Disarm pointer mode, clear transient keyboard state, and disable visible input
  controls when the displayed generation becomes stale.
- **BREAKING**: require the token-protected local `/input` request to carry the
  displayed frame generation, and reject missing, malformed, unseen, superseded,
  or stale generations before sending remote input.
- Serialize browser input transitions and add a token-protected release-only
  cleanup action backed by server-tracked held state for ambiguous responses,
  freshness loss, page exit, and disconnect.
- Make the smoke workflow send matching key down/up input and confirm explicit
  pointer-permission revocation before accepting its lifecycle denial probe.
- Keep existing active-visible authorization, permission, routing, audit-before-
  send, same-origin, Host, content-type, and mutation-token gates authoritative.
- Add focused denial and recovery tests plus a security review of the frame/input
  boundary.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: bind local viewer input to the currently
  displayed fresh frame generation and fail closed when that evidence is absent,
  stale, or no longer current.
- `mvp-session-command-kit`: make the local MVP smoke input and lifecycle-denial
  probes obtain and validate a live frame generation before posting input.

## Impact

- Affected code: `apps/agent-shell/src/viewer-local-control-surface.ts`,
  `scripts/mvp-session-smoke.mjs`, and their focused tests.
- Affected local API: loopback-only `/frame` response metadata, `/input` JSON
  request shape, and the release-only cleanup action used by the generated
  viewer page.
- Security impact: narrows input availability and touches the local viewer input
  gate; it does not change host consent, grants, authentication, relay behavior,
  native capture/input adapters, installer, startup, services, tokens, logging,
  or privilege elevation.
- Non-goals: production desktop UI, unattended access, background services,
  arbitrary frame-file access, content inspection, frame telemetry, new input
  kinds, or any bypass of host visibility, revocation, disconnect, or audit.
