## Context

The Windows screen-capture adapter currently calls
`execFile("powershell.exe", ...)` for every accepted frame. The host runtime
constructs the default adapter inside each capture call. The finite MVP stream
awaits frames sequentially, but direct runtime callers can overlap calls and
there is no adapter `close()` boundary for an in-flight native capture.

The runtime already revalidates authorization after capture before completion
audit and frame send. However, pause or `screen:view` revoke that loses its
lifecycle audit race can leave the old authorization snapshot locally usable,
and direct runtime capture currently treats a missing audit sink as a no-op.

The MVP needs a responsive ordered screen path without introducing a service,
startup component, unattended access, or a helper that outlives the visible
host runtime. Existing host consent, authorization, indicator, permission,
audit, pause, revoke, terminate, expiration, and disconnect behavior remains
authoritative.

## Goals / Non-Goals

**Goals:**

- Start one Windows capture helper lazily only after an authorized request has
  persisted metadata-only capture-request audit, and reuse it in the same host
  runtime.
- Execute bounded capture requests in FIFO order with at most one request in
  flight and revalidate grants around native work.
- Abort active and queued capture work when `screen:view` or the visible
  connection lifecycle is lost.
- Require an effective close boundary for injected capture adapters and
  revalidate current runtime authorization before trusted completion evidence.
- Keep frame output and process failures bounded, generic, and absent from
  logs, runtime events, audit records, and diagnostics.

**Non-Goals:**

- Production native host/viewer UI, installer, updater, Windows service,
  startup persistence, or signed native helper packaging.
- Unattended or hidden capture, privilege elevation, secure-desktop access,
  UAC or Windows prompt bypass, credential access, keylogging, clipboard,
  file transfer, input changes, arbitrary commands, or remote endpoints.
- Changing the screen-frame wire format, relay routing, viewer rendering, or
  finite stream scheduling in this change.
- Claiming production hardening for the PowerShell development helper.

## Decisions

### Use a lazy adapter-owned foreground worker

`@winbridge/windows-capture` will expose an injectable worker boundary with
`run(request)` and synchronous idempotent `close()` operations. The default
adapter creates a worker only after capture grant validation. A single adapter
reuses that worker until close or failure. The existing injected one-shot
runner remains available for focused tests, while the host runtime stores one
reusable adapter after its first audited capture request.

The default worker spawns one non-detached child `powershell.exe` process with
a static reviewed script. Assemblies and helper functions load once. A bounded
JSON line containing only an internal request number triggers one capture and
the worker returns one bounded JSON line containing the matching request number
and frame result. Grant identifiers, frame ids, session ids, relay tokens,
pairing codes, audit paths, credentials, remote endpoints, arbitrary commands,
and user-provided scripts never enter the child request protocol.

The TypeScript worker validates the exact native request shape and configured
bounds before writing to stdin. It bounds accumulated stdout in bytes before
parsing the one expected response. The adapter retains existing JPEG/PNG,
dimension, base64, signature, and encoded-size validation.

Alternative considered: use one PowerShell process per frame. It has a smaller
lifetime but creates hundreds of processes in a normal trial and cannot be
cancelled through one runtime-owned boundary.

Alternative considered: immediately replace PowerShell with a compiled native
helper. That is the production direction, but signing, packaging, binary
review, and deployment are separate MVP work.

### Serialize captures and invalidate queues by generation

The adapter records a generation for each accepted request and executes FIFO
with one active request. It bounds the combined active and queued count to two
by default; the ordinary stream remains sequential, while one queued slot
absorbs a narrow concurrent caller race without allowing a stale frame backlog.

`close()` increments the generation, rejects active and queued promises, closes
the current worker, and prevents queued native dispatch. A later request must
pass a fresh active visible grant check before a new helper generation starts.
Grant validation runs at acceptance, immediately before dispatch, and after
native output so expiry is checked at every trust boundary.

Alternative considered: parallel capture workers. Parallel screen reads add
process and memory pressure, can reorder frames, and weaken immediate revoke
semantics without improving the one-frame-per-interval MVP stream.

### Bind capture state to host lifecycle before audit mutation

The host runtime stores a local capture-block flag and the reusable adapter.
It blocks capture and attempts adapter close before preparing pause, any
permission revoke, terminate, expiration, disconnect, socket-close,
runtime-stop, and authorization-replacement mutations. Close failure is
best-effort and cannot delay host control or indicator updates. Runtime stop
closes capture before deactivating the visible indicator.

If lifecycle audit persistence fails before protocol state is updated, the
local block remains set, so stale authorization cannot start another capture.
After a successful partial revoke, resume, or a new authorization, capture is
enabled only when current state is active, visible, unexpired, connected, and
still grants `screen:view`.

Initial activation enables capture only after active state and the visible host
indicator callback complete successfully. If indicator delivery throws, the
authorization snapshot may exist for diagnostics but the independent capture
block remains set and no helper may start.

The capture method requires a configured audit sink and successful
`screen-capture.requested` persistence before it creates or invokes the
adapter. After adapter success it re-runs routing, authorization id,
active/visible/expiry, permission, local block, and connectivity checks before
completion audit or screen-frame send. If completion audit or audited frame
send fails after native success, the runtime closes the adapter and leaves
capture locally blocked. Injected adapters must expose `close()`;
post-success revalidation remains independent protection if an injected close
cannot cancel native work immediately.

Alternative considered: rely only on the mutable authorization snapshot.
Lifecycle audit failure can prevent that snapshot mutation, so a separate
local fail-closed gate is required.

### Fail closed without frame or native diagnostics

Worker timeout, malformed or mismatched response, oversized stdout, stderr,
stdin failure, process error, unexpected exit, queue overflow, and close races
all reject with existing generic capture errors. No native exception text or
frame data is forwarded into runtime events, logs, audits, or API errors. The
worker is discarded after failure; only a later still-authorized request may
start a fresh process.

The one-shot convenience API closes its adapter in `finally`, preventing a
single capture operation from leaking a child process.

The child read loop exits on stdin EOF. Normal runtime close destroys pipes and
terminates the process; abrupt parent termination closes the inherited pipe so
the helper has no listener, reconnect path, service host, or automatic restart
mechanism that could keep capture active independently.

## Risks / Trade-offs

- **A screen read can complete immediately before a lifecycle action.** -> Kill
  the helper when the action begins and suppress trusted completion/send after
  post-success revalidation; an already completed local read cannot be undone.
- **A reusable helper holds capture capability longer than one-shot execution.**
  -> Keep it a direct non-detached child of the foreground host, start it only
  after audited consent, and close it on every screen-capable lifecycle loss.
- **A large base64 response can grow memory or break line framing.** -> Keep the
  existing 48 KiB encoded-frame limit, add fixed protocol overhead, reject
  oversized accumulation before parse, and permit only one response line.
- **PowerShell or GDI resources can fail across repeated frames.** -> Dispose
  per-frame bitmap, graphics, encoder, and stream objects in `finally`; close
  and discard the worker on any protocol or process failure.
- **An injected adapter may not implement effective cancellation.** -> Require
  synchronous `close()` and independently reject stale success through runtime
  and adapter generation checks.

## Migration Plan

1. Add the persistent capture worker and adapter lifecycle while preserving the
   injected runner contract.
2. Make the host runtime own one adapter, require capture audit, and add local
   lifecycle block/close hooks plus post-success tests.
3. Run focused worker, adapter, stream, and runtime tests plus security review
   and the complete repository verification matrix.
4. Roll back by restoring the one-shot default runner if worker protocol or
   Windows behavior is unstable; no stored data or wire migration is required.

## Open Questions

None for this development MVP increment. Compiled helper packaging and richer
capture transport remain separate production changes.
