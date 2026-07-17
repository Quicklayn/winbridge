# windows-screen-capture Specification

## Purpose
TBD - created by archiving change add-windows-screen-capture-adapter. Update Purpose after archive.
## Requirements
### Requirement: Windows screen capture requires visible consent grant

The Windows screen capture adapter SHALL invoke native capture only when the
caller provides an active visible capture grant that includes a valid
authorization id, `screen:view` permission, visible host indicator state,
connected peer state, and a Windows platform context. The adapter MUST reject
missing, inactive, invisible, permissionless, disconnected, expired, non-Windows,
or malformed grants before invoking a native command runner.

#### Scenario: Capture runs with active visible grant

- **WHEN** the adapter is called on Windows with an active visible unexpired grant that includes `screen:view` and a connected peer
- **THEN** it invokes the native command runner exactly once
- **AND** it returns a bounded JPEG or PNG frame with width, height, captured timestamp, byte length, and base64 data

#### Scenario: Capture lacks visible grant

- **WHEN** the adapter is called with a missing, inactive, invisible, expired, permissionless, disconnected, malformed, or non-Windows grant
- **THEN** it fails before invoking native capture, writing files, sending protocol messages, emitting audit records, logging screen contents, hiding the session, or bypassing consent

#### Scenario: Capture is attempted on non-Windows platform

- **WHEN** the adapter is called with a platform context other than Windows
- **THEN** it rejects before invoking PowerShell, native APIs, protocol sends, file writes, service behavior, startup persistence, elevation, or prompt bypass

### Requirement: Windows screen capture output is bounded and metadata-safe

The Windows screen capture adapter SHALL validate native capture output before
returning it. Output MUST be JPEG or PNG, width and height MUST be positive
bounded integers, encoded payload size MUST stay within the configured frame
byte limit, and diagnostics MUST NOT expose raw frame bytes, encoded frame data,
screenshots, screen contents, credentials, tokens, pairing codes, private
reasons, or full secrets. The default reviewed native PowerShell runner MUST
emit a JPEG preview that is downscaled or quality-reduced as needed to fit the
configured encoded payload limit before returning to TypeScript validation.

#### Scenario: Native runner returns bounded JPEG output

- **WHEN** the native command runner returns valid JSON with JPEG format, safe dimensions, valid base64, a JPEG signature, and encoded data within the configured bound
- **THEN** the adapter accepts the frame and reports the `jpeg` format to the caller

#### Scenario: Native runner returns bounded PNG output

- **WHEN** the native command runner returns valid JSON with PNG format, safe dimensions, valid base64, a PNG signature, and encoded data within the configured bound
- **THEN** the adapter accepts the frame and reports the `png` format to the caller

#### Scenario: Native runner returns malformed output

- **WHEN** the native command runner returns invalid JSON, unsupported format, invalid dimensions, invalid base64, empty image data, mismatched image signature, or oversized image data
- **THEN** the adapter rejects before returning a frame, writing files, sending protocol messages, hiding the session, or exposing raw screen contents in diagnostics

#### Scenario: Native runner fails

- **WHEN** the native command runner fails, times out, or reports an error
- **THEN** the adapter reports only bounded generic failure metadata
- **AND** it MUST NOT expose raw command output, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Windows screen capture adapter remains non-authorizing

The Windows screen capture adapter SHALL remain a capture primitive only. It
MUST NOT approve sessions, grant permissions, activate host visibility, connect
to the relay, send protocol messages, start continuous streaming, render viewer
UI, inject input, sync clipboard, transfer files, collect diagnostics, install
services, configure startup persistence, elevate privileges, run unattended,
collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide
capture from the host.

#### Scenario: Adapter is imported or constructed
- **WHEN** application code imports the package or constructs an adapter
- **THEN** no native capture, protocol send, audit write, service action, startup action, elevation, input, clipboard, file, diagnostic, or credential collection side effect occurs

#### Scenario: Capture succeeds
- **WHEN** an explicit one-shot capture succeeds
- **THEN** the adapter returns the captured frame to the immediate caller only
- **AND** it MUST NOT start a loop, reconnect peers, send the frame, persist the frame, render a viewer, inject input, alter host controls, or bypass revocation

### Requirement: Windows screen capture adapter reuses one bounded foreground helper

The Windows screen capture adapter SHALL lazily start at most one reusable
native helper for a current adapter generation after validating an active
visible unexpired connected `screen:view` grant. It MUST execute accepted
requests in FIFO order with at most one native capture in flight, revalidate
the grant immediately before dispatch and after native output, and reuse the
same helper for later authorized frames until explicit close or helper failure.
The adapter MUST bound the combined active and queued request count.

The child request protocol MUST contain only bounded internal correlation
metadata. It MUST NOT accept grants, authorization or session ids, frame ids,
relay tokens, pairing codes, credentials, audit paths, remote endpoints,
arbitrary commands, scripts, screen contents, or user-provided capture code.
The helper response MUST remain within the configured frame and protocol byte
bounds before a frame can reach the adapter output validator.

#### Scenario: Authorized captures reuse one helper in FIFO order

- **WHEN** one adapter receives multiple authorized capture requests while its
  helper remains healthy and the grants remain active
- **THEN** it starts one helper and dispatches captures in acceptance order with
  at most one request in flight
- **AND** it returns only matching bounded frame responses that pass the
  existing image validation

#### Scenario: Adapter construction remains side-effect free

- **WHEN** code imports the package or constructs the reusable adapter
- **THEN** it does not start PowerShell, create a worker, capture a screen, open
  a listener, install a service, or configure persistence

#### Scenario: Worker rejects non-canonical request metadata

- **WHEN** the exported worker boundary receives unknown keys, inconsistent
  configured bounds, an unsafe timeout, or extra diagnostic or secret-bearing
  metadata
- **THEN** it rejects and closes before writing any request to the child
- **AND** no grant, identifier, path, endpoint, token, credential, command,
  script, screen content, or secret reaches the child request protocol

#### Scenario: Queued grant expires before dispatch

- **WHEN** an accepted capture waits behind another request until its grant is
  no longer active and unexpired
- **THEN** the adapter rejects it before triggering another native capture or
  producing frame output

#### Scenario: Capture queue is bounded

- **WHEN** the configured active-and-queued request limit is reached while the
  helper is processing an earlier capture
- **THEN** the adapter rejects additional work with bounded generic failure
  metadata before queueing or native dispatch
- **AND** it does not expose frame data, screen contents, native diagnostics,
  tokens, pairing codes, credentials, paths, or secrets

#### Scenario: Helper protocol fails closed

- **WHEN** the helper times out, exits, errors, rejects stdin, writes stderr, or
  emits a malformed, mismatched, oversized, failed, or unexpected response
- **THEN** the adapter closes and discards that helper and rejects with bounded
  generic failure metadata
- **AND** diagnostics MUST NOT expose raw or encoded frames, screen contents,
  native output, credentials, tokens, pairing codes, private reasons, paths, or
  secrets

### Requirement: Windows screen capture adapter close cancels capture-capable work

The Windows screen capture adapter SHALL expose an idempotent close operation
that synchronously invalidates its current generation, terminates the current
helper, rejects the active request, and prevents queued requests from reaching
native dispatch. A later request MUST pass a fresh active visible unexpired
connected `screen:view` grant check before a new helper can start. The helper
MUST remain a child of the current foreground process and MUST NOT continue as
a service, detached process, startup entry, or unattended component.

#### Scenario: Close aborts active and queued captures

- **WHEN** close occurs while one capture is active and another is queued
- **THEN** both requests reject without trusted frame output and the queued
  request never reaches native dispatch

#### Scenario: Later active grant starts a fresh helper

- **WHEN** close has completed and a later capture carries a freshly validated
  active visible unexpired connected grant
- **THEN** the adapter may lazily start one new helper for the new generation
- **AND** no previous queued request, response, frame, or screen data is reused

#### Scenario: One-shot convenience does not leak a helper

- **WHEN** the one-shot capture convenience operation succeeds or fails
- **THEN** it closes its adapter before settling and leaves no helper owned by
  that operation
