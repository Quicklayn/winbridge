## Context

The relay emits `relay.message.forwarded` audit records after forwarding a peer message, but the detail currently records only `messageType`. Since protocol `signal` messages now require a top-level `payload.authorizationId`, accepted signal forwarding can include that lifecycle identifier in audit metadata without storing raw signaling contents.

## Goals / Non-Goals

**Goals:**

- Add `authorizationId` to accepted forward audit details for `signal` messages.
- Keep accepted forward audit details payload-safe and bounded.
- Add integration coverage for both presence of the authorization id and absence of raw payload markers.

**Non-Goals:**

- No relay-side active authorization state machine.
- No production identity, token lifecycle, or durable audit store.
- No native capture, input, clipboard, file-transfer, diagnostics, reconnect, installer, service, startup, privilege, evasion, or Windows prompt behavior.

## Decisions

- Derive audit metadata from the parsed protocol envelope after schema validation.
  This avoids trusting arbitrary JSON and keeps the relay aligned with protocol validation.

- Store only the top-level `authorizationId` for signals.
  Other signal payload fields can contain SDP/candidate material or future transport details and remain excluded from relay audit records.

- Leave non-signal forward audit details unchanged.
  This keeps the increment narrow and avoids expanding audit surface for workflow messages without a separate requirement.

## Risks / Trade-offs

- `authorizationId` alone does not prove the relay authorized an active grant -> runtime authorization gates remain required, and production authorization remains future work.
- More audit metadata increases correlation power -> keep the field limited to the already-classified non-secret lifecycle identifier and do not log raw payload contents.
