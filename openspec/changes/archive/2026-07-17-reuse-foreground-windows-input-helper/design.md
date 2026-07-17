## Context

The Windows input adapter currently calls `execFile("powershell.exe", ...)` for
every accepted pointer or keyboard event. The agent runtime also constructs the
default adapter inside each inbound event handler. This preserves authorization
checks but adds process startup latency and permits independent event promises
to overlap.

The MVP needs a responsive ordered input path without introducing a service,
startup component, unattended access, or a helper that outlives the visible
host runtime. Existing host consent, authorization, visibility, permission,
audit, pause, revoke, terminate, expiration, and disconnect behavior remains
authoritative.

## Goals / Non-Goals

**Goals:**

- Start one Windows input helper lazily after an authorized event reaches the
  adapter and reuse it for later events in the same active runtime scope.
- Execute native requests in FIFO order with at most one request in flight.
- Abort queued and in-flight requests when the authorization or connection
  loses its active action-capable state.
- Revalidate current runtime authorization after adapter success and before
  trusted applied evidence.
- Keep process and protocol failures bounded, generic, and content-free.

**Non-Goals:**

- Production native host/viewer UI, installer, updater, Windows service, or
  startup persistence.
- Unattended access, privilege elevation, UAC or secure-desktop control,
  Windows prompt bypass, credential access, keylogging, clipboard, file
  transfer, macros, text buffering, or arbitrary commands.
- Replacing the capture pipeline or adding internet transport in this change.
- Claiming production hardening for the PowerShell development helper.

## Decisions

### Use a lazy adapter-owned worker

`@winbridge/windows-input` will expose an injectable native worker boundary
with `run(request)` and synchronous idempotent `close()` operations. The
default adapter creates a worker only after event and grant validation. A
single adapter reuses that worker until close or failure. The existing injected
one-shot runner remains available for focused tests and compatibility, but the
agent runtime uses the reusable default adapter.

The default worker spawns one foreground child `powershell.exe` process with a
static reviewed script. It accepts one bounded JSON line at a time over stdin
and returns one bounded JSON line over stdout. Requests contain only minimal
normalized native pointer or supported-key metadata and an internal correlation
number. The exported worker boundary strictly rejects unknown keys,
inconsistent normalized values, unsupported keys, malformed modifiers, and
unsafe bounds before writing to the child. The worker never receives relay
tokens, pairing codes, session ids, authorization ids, audit paths,
credentials, source coordinates, key labels, or arbitrary commands.

Alternative considered: immediately replace PowerShell with a native C# or
Rust executable. That is the likely production direction, but it adds build,
signing, packaging, and binary-review work beyond this latency increment.

### Serialize requests and invalidate queues by generation

The adapter owns a promise tail and submits every validated request in FIFO
order. It records a generation for each queued operation. `close()` increments
the generation, synchronously terminates the worker, rejects the active
request, and makes queued requests fail before native dispatch. A later event
must pass a fresh grant check and lazily starts a new worker.

The adapter bounds the combined active and queued request count to 128 by
default and rejects overflow generically before accepting more native work.
This prevents a slow helper from becoming an unbounded input buffer.

Grant validation runs when the adapter accepts the call and again immediately
before native dispatch so an event cannot wait past expiry. Runtime lifecycle
closure provides the revocation signal for pause, permission revoke,
termination, disconnect, and authorization replacement.

Alternative considered: buffer events in the viewer or batch several events
into one PowerShell invocation. That would add latency, weaken immediate revoke
semantics, and still pay recurring process startup cost.

### Bind one adapter to one runtime lifecycle

An opted-in host runtime creates or accepts one adapter instance and stores it
in connection-scoped state. It closes the adapter on pause, any permission
revoke, terminate, expiration, peer disconnect, local disconnect, socket close,
runtime stop, and before connection-scoped authorization replacement. Closing
is best-effort and cannot suppress the host control action.
Runtime stop blocks input and attempts helper close before deactivating the
visible host indicator, so there is no stop-time interval where native input
remains action-capable after visibility is removed.

Every action-capable lifecycle boundary sets a separate local input-block flag
and attempts adapter close before preparing lifecycle audit. If audit
persistence then fails before protocol or authorization-state mutation, the
runtime remains locally input-blocked. This preserves immediate fail-closed
revocation semantics even though the remote peer may still hold its previous
development authorization view.

After `applyInputEvent()` resolves, the runtime re-runs sender, routing,
authorization id, active/visible/unexpired state, required permission, and
connectivity checks before writing `input-event.applied`. If lifecycle loss
wins the race, the runtime emits no trusted applied evidence or received event.

### Fail closed without native diagnostics

Worker timeout, malformed/mismatched/oversized output, stdin failure, process
error, unexpected exit, and close races all reject with existing generic input
errors. The worker is discarded after failure. Stderr and native exception
text are never forwarded into runtime events, logs, audits, or API errors.

The one-shot convenience API closes its adapter in `finally`, so it cannot
leave a child process alive after its single operation.

## Risks / Trade-offs

- **An OS input call can complete immediately before a host lifecycle action.**
  -> The helper is killed synchronously when the action begins and the runtime
  revalidates before trusted success; already completed OS input cannot be
  undone.
- **PowerShell stream framing or buffering can hang a request.** -> Use one
  bounded line per request/response, explicit stdout flush, a per-request
  timeout, and termination on protocol drift.
- **A helper crash can interrupt an event.** -> Reject generically, clear the
  helper, and permit a later still-authorized event to start a fresh process.
- **A reusable process has a longer lifetime than one-shot execution.** -> It
  is a direct child of the visible foreground host process, starts lazily, has
  no listener or persistence, and is closed on every action-capable lifecycle
  loss.
- **Injected adapters may not implement effective native cancellation.** ->
  Opted-in runtime configuration requires a synchronous `close()` boundary,
  while runtime post-success revalidation independently prevents stale trusted
  evidence when an injected adapter resolves late.

## Migration Plan

1. Add the reusable worker boundary and tests while preserving the injected
   one-shot runner contract.
2. Make the agent runtime own one adapter and add lifecycle close hooks plus
   post-success authorization revalidation.
3. Run focused package/runtime tests, the complete verification matrix, and a
   security review.
4. Roll back by restoring one-shot default execution if worker protocol or
   Windows CI behavior is unstable; no stored data or wire migration is needed.

## Open Questions

None for this development MVP increment. A compiled and signed native helper is
deferred to a separate production OpenSpec change.
