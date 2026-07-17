## Why

The default MVP smoke workflow reaches successful consent, visible host state,
frame delivery, input, guard, and revoke checks, but fails its final audit gate
because the host records trusted viewer disconnect state without persisting the
matching local disconnect evidence. This leaves the strict MVP lifecycle
incomplete even though the relay notice already deactivates the host session.

## What Changes

- Schedule one local accepted host `agent-shell.session.disconnected` audit
  record after disconnect cleanup when a decoded `peer-disconnected` notice has
  passed the existing observed opposite-role viewer trust gate and a host
  authorization snapshot is available.
- Bind the record to the current session and authorization and include only
  bounded lifecycle metadata: authorization status, pre-disconnect visibility,
  permission count, fixed cause, and relay-defined reason code.
- Keep remote-disconnect cleanup authoritative and complete it before invoking
  the audit sink, so slow persistence, persistence failure, or diagnostic
  failure cannot delay input/capture blocking, disconnected recipient state, or
  the visible host indicator becoming inactive.
- Do not send a protocol `audit-event`, retry, reconnect, grant permissions, or
  treat unbound, self, same-role, mismatched, or duplicate notices as audit
  evidence.
- Add focused integration coverage for accepted evidence, ignored notices,
  audit failure containment, one-shot behavior, and secret-safe diagnostics.
- Update the audit/security documentation and rerun the default MVP smoke gate,
  recording any independent role-mapping drift as a separate change.

Safety impact: this change touches local host audit logs in the trusted remote
disconnect path. It does not change consent, authorization decisions, capture
or input activation, relay behavior, public protocol schemas, viewer leave,
installer, startup, services, tokens, persistence, or privilege elevation. It
adds no hidden or unattended session behavior, credential access, keylogging,
AV/EDR evasion, Windows prompt bypass, hidden capture, or hidden input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-shell-consent-workflow`: Require bounded local host audit evidence for
  a trusted remote viewer disconnect without weakening disconnect cleanup or
  accepting untrusted notices.

## Impact

- `apps/agent-shell/src/runtime.ts`: trusted viewer-disconnect local audit
  persistence and failure containment.
- `apps/agent-shell/src/runtime.integration.test.ts`: trust-boundary, audit,
  one-shot, cleanup, and redaction coverage.
- `docs/security-model.md` and the existing
  `agent-shell-consent-workflow` specification.
- No dependency, protocol schema, relay endpoint, capture adapter, input
  adapter, installer, service, startup, token, or privilege change.
