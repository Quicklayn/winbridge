## ADDED Requirements

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
