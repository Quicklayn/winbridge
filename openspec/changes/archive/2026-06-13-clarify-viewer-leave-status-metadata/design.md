## Context

The managed viewer `leave()` operation reuses runtime shutdown, which clears connection-scoped session state before closing the local viewer relay connection. The main spec already says local leave clears connection-scoped viewer authorization state, but README and security docs currently blur that with trusted remote host disconnect behavior, where optional authorization id/status metadata may remain useful for local diagnostics.

## Goals / Non-Goals

**Goals:**

- Keep local viewer leave fail-closed and metadata-minimal after transport close.
- Make status semantics explicit: remote host disconnect may preserve optional authorization id/status, but local viewer leave clears that connection-scoped metadata.
- Align README, architecture, security docs, and focused tests with the spec.

**Non-Goals:**

- No runtime behavior change.
- No protocol, relay, native Windows, capture, input, reconnect, installer, startup, service, token, audit/log persistence, or privilege-elevation changes.
- No new user-visible command or remote assistance capability.

## Decisions

- Treat local viewer leave as a local session teardown boundary that clears authorization metadata.
  - Rationale: a user-initiated local leave ends the viewer's current connection scope; future UI should not display stale authorization id/status as if it still applies.
  - Alternative considered: preserve authorization metadata after leave like remote host disconnect. Rejected because remote host disconnect is a peer lifecycle observation, while local leave intentionally clears the viewer's local connection state.
- Preserve existing behavior and update only the contract, docs, and assertions.
  - Rationale: the current code already uses `resetConnectionScopedSessionState()` through `leave()`, and changing behavior would increase stale metadata risk.

## Risks / Trade-offs

- [Risk] Future UI may want to show the last authorization id after local leave for troubleshooting. -> Mitigation: keep that out of the active status snapshot; a separate explicit session history or audit view should own historical metadata.
- [Risk] Documentation may again conflate remote disconnect and local leave. -> Mitigation: describe the two cases separately in README and security documentation, and add an explicit integration assertion that local leave status omits authorization metadata.
