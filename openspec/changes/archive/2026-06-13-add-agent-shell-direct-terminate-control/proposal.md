## Why

Host session termination currently exists only as a configured development timer. Future host UI code needs an immediate local control that ends a visible assistance session on demand, matching the product invariant that the host can stop access immediately. This closes the managed-runtime gap without adding native capture, input, clipboard, file transfer, service, installer, persistence, or privilege behavior.

## What Changes

- Add a managed agent-shell `terminate()` control for host runtimes.
- Require direct termination to run only after visible active or paused unexpired host authorization.
- Reuse the termination protocol sequence: bound `session-control` with action `terminate`, terminal `session-authorization-state`, local inactive indicator, and secret-safe `audit-event`.
- Keep audit persistence fail-closed for direct termination: if the matching audit write fails, no termination protocol messages are sent and workflow state is not mutated.
- Keep delayed workflow timers coherent after direct termination by sharing the host workflow terminal state.

## Safety Impact

- Direct termination is host-only and fail-closed before audit writes or socket writes for viewer runtimes, invisible approvals, expired grants, disconnected peers, or terminal authorizations.
- The change sends lifecycle protocol metadata only; it does not start screen capture, send input, sync clipboard, transfer files, install services, configure startup persistence, collect credentials, hide sessions, or bypass consent workflows.
- Audit details remain secret-safe and do not contain private reason text, tokens, pairing codes, display names, signal payloads, screenshots, or input contents.

## Non-Goals

- No native Windows UI, capture, input, clipboard, file transfer, service, installer, startup, or privilege-elevation behavior.
- No viewer-side termination control.
- No production identity, account, MFA, RBAC, or durable audit storage.

## Impact

- Affected specs: `agent-shell-consent-workflow`
- Affected code: `apps/agent-shell/src/runtime.ts`, `apps/agent-shell/src/runtime.integration.test.ts`
- Affected docs: `docs/architecture.md`, `docs/security-model.md`
