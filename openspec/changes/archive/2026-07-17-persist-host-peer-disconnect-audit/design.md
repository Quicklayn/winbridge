## Context

The agent-shell runtime already rejects self, unbound, same-role, and mismatched
`peer-disconnected` notices before local received-event emission. For an
accepted notice identifying the observed opposite-role peer, it immediately
blocks host Windows input and capture, records remote disconnect state, clears
recipient identity, invalidates signaling, and deactivates the host indicator.

Local host disconnect and viewer leave controls already persist
`agent-shell.session.disconnected` records through the configured audit sink.
The trusted remote viewer-disconnect path does not, so the default smoke host
log lacks the disconnect evidence required by the strict MVP audit summary.

The relay-defined `reasonCode` is protocol-validated and bounded. Raw socket
close reasons, peer ids, display names, tokens, pairing codes, protocol payloads,
screen data, and input data are not required for local disconnect evidence.

## Goals / Non-Goals

**Goals:**

- Persist one local host disconnect record only for a trusted notice identifying
  the currently observed viewer and only when a host authorization snapshot is
  available.
- Bind evidence to the same session and authorization lifecycle that was active
  locally before disconnect cleanup.
- Keep audit persistence best-effort after the remote disconnect decision so a
  sink or diagnostic failure cannot weaken fail-closed cleanup.
- Preserve bounded metadata, one-shot behavior, and secret-safe diagnostics.
- Supply the missing host disconnect evidence required by the default
  non-native MVP smoke audit subcheck and isolate any independent viewer
  evidence mapping drift without changing it in this runtime change.

**Non-Goals:**

- Persisting unbound, self, same-role, mismatched, duplicate, or pre-authorization
  notices as accepted session evidence.
- Sending a protocol `audit-event` to a disconnected peer or changing protocol
  schemas, relay disconnect behavior, viewer local leave, or audit-summary rules.
- Reconnecting peers, granting permissions, changing authorization lifecycle,
  activating capture or input, suppressing host visibility, or weakening host
  pause, revoke, terminate, and disconnect controls.
- Adding production telemetry, remote log upload, background services, startup
  persistence, unattended access, installers, elevation, or hidden behavior.

## Decisions

### Persist only after the existing trusted-notice gate

The handler will capture a fixed host-only audit input only after decoding,
session-id validation, self-disconnect rejection, and observed opposite-role
peer binding have succeeded. It will take the current local host authorization
snapshot and bounded relay reason code before clearing observed peer state,
finish the existing disconnect transition, then schedule one post-cleanup audit
callback.

This reuses the authoritative trust boundary instead of adding a second peer-id
comparison inside the audit layer. The terminal remote-disconnected flag rejects
later disconnect notices, and later `hello` messages cannot restore recipient or
observed-peer binding. Clearing observed peer identity remains part of the same
accepted transition, so repeated input cannot create duplicate accepted
evidence.

Alternative considered: write an audit record for every decoded
`peer-disconnected`. That would allow unbound or forged-looking notices to
create false lifecycle evidence and is rejected.

### Use one local record and no protocol audit event

The helper will call the existing local `writeDevelopmentAuditRecord` path with
action `agent-shell.session.disconnected`, outcome `accepted`, and a fixed
allowlist of detail fields: authorization id/status, fixed cause
`peer-disconnected`, pre-disconnect `visibleToHost`, permission count, and the
bounded relay reason code. Actor role/id/device and session id continue to come
from local runtime options through the existing audit writer.

It will not construct or send a protocol `audit-event`. The remote viewer is
already disconnected, and local evidence is sufficient for the host-side
disconnect portion of the strict MVP gate.

Alternative considered: reuse the host workflow audit-event sender. That path
requires an available recipient and would conflate remote cleanup observability
with host-authorized workflow commands.

### Treat audit failure as post-decision observability

Input and capture blocking continues before audit persistence. The main handler
records remote disconnect state, clears the recipient, invalidates signaling,
and deactivates the visible host indicator before scheduling the audit callback
with `setImmediate`. The callback writes once without retry. It catches sink
failure and reports it only through the existing bounded best-effort runtime
diagnostic path. A slow synchronous sink therefore runs only after the
security-sensitive transition has completed.

An authorization snapshot is required for the record. A trusted viewer notice
before authorization still performs disconnect cleanup but creates no accepted
authorization-bound session evidence.

Alternative considered: fail the inbound handler before state cleanup when the
audit sink rejects. That would preserve stale action capability after the peer
has gone and is rejected.

### Extend existing integration paths

The primary trusted viewer-disconnect integration test will use a memory host
audit sink and assert exact bounded evidence plus absence of a sent protocol
audit event. Focused tests will cover slow and failed sink containment and no
evidence for ignored or pre-authorization notices. Existing delayed workflow,
indicator, status, capture/input blocking, and redaction assertions remain
authoritative.

## Risks / Trade-offs

- **A local actor field can be read as the initiator of a remote disconnect.**
  -> Fixed `cause=peer-disconnected` and bounded relay `reasonCode` distinguish
  observed remote cleanup from `cause=local-disconnect`.
- **A sink can block or throw while processing disconnect evidence.** -> Finish
  the fail-closed transition first, invoke the sink from one post-cleanup
  callback, catch locally, and keep diagnostics best-effort and secret-safe.
- **A stale authorization could be logged after terminal lifecycle.** -> Bind
  only the current local snapshot and preserve its exact bounded status; the
  strict summary still enforces lifecycle ordering and correlation.
- **Repeated relay notices or a same-id `hello` could duplicate evidence.** ->
  Treat remote disconnect as terminal for later disconnect and `hello` input,
  while also clearing observed peer binding on the first accepted notice.
- **No record is written before authorization.** -> This intentionally avoids
  manufacturing authorization-bound MVP evidence; relay audit remains the
  source for transport-only disconnects.

## Migration Plan

1. Add the host-only trusted viewer-disconnect audit helper and integration
   coverage.
2. Run focused agent-shell tests and the default MVP smoke workflow; confirm the
   host disconnect flag and record any independent later audit failure as a
   separate OpenSpec change.
3. Run repository verification and security review, then sync and archive the
   OpenSpec delta.
4. Roll back by removing the helper call and local record helper; no stored
   schema, protocol, dependency, or deployment migration is required.

## Open Questions

None.
