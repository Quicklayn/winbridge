## Why

The MVP already has host lifecycle controls in the terminal, but the assisted user still lacks a browser-visible local control surface comparable to the viewer's local surface. Adding an opt-in host loopback surface improves the visible host-side control story without adding remote administration capability.

## What Changes

- Add an opt-in host-only local control surface that binds only to `127.0.0.1`.
- Serve bounded host status metadata and visible host lifecycle controls for pause, resume, revoke, terminate, and disconnect.
- Require exact loopback `Host`, same-origin `Origin`, JSON content type, and an unguessable per-run token for every mutating request.
- Close the host local surface with CLI shutdown and after accepted terminal controls.
- Document and test denial behavior, redaction, and development scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Adds the host-only loopback local control surface behavior for the existing non-native consent workflow.

## Impact

- Affected code: `apps/agent-shell/src` host control prompt, CLI argument parsing, CLI startup/shutdown wiring, and tests.
- Affected docs: README MVP usage and OpenSpec artifacts.
- Security impact: touches local mutation tokens, host lifecycle controls, and visible session control UX. It does not touch capture, input injection, relay behavior, installer behavior, startup persistence, services, logs, privilege elevation, or production authentication.
- Non-goals: no hidden sessions, unattended access, remote shell, LAN binding, service installation, startup persistence, Windows prompt bypass, keylogging, credential access, clipboard, file transfer, diagnostics dumps, or automatic browser launch.
