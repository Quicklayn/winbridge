## ADDED Requirements

### Requirement: Windows input adapter reuses one bounded foreground helper

The Windows input adapter SHALL lazily start at most one reusable native helper
for a current adapter generation after validating an input event and its active
visible unexpired connected grant. It MUST execute accepted requests in FIFO
order with at most one native request in flight, revalidate the grant
immediately before dispatch, and reuse the same helper for later authorized
events until explicit close or helper failure. The adapter MUST bound the
combined active and queued request count and reject overflow before accepting
additional native work.

The helper protocol MUST accept only bounded normalized supported input event
metadata and internal correlation metadata. It MUST NOT accept arbitrary
commands, raw scripts, text buffers, keylogging buffers, relay tokens, pairing
codes, credentials, session or authorization identifiers, audit paths, or
remote endpoints.

#### Scenario: Authorized events reuse one helper in FIFO order

- **WHEN** one adapter receives multiple authorized pointer or keyboard events
  while its helper remains healthy and the grants remain active
- **THEN** it starts one helper and dispatches the events in acceptance order
  with at most one request in flight
- **AND** it returns success only for matching bounded helper responses

#### Scenario: Adapter construction remains side-effect free

- **WHEN** code imports the package or constructs the reusable adapter
- **THEN** it does not start PowerShell, create a worker, inject input, open a
  listener, capture input, install a service, or configure persistence

#### Scenario: Worker rejects non-normalized request metadata

- **WHEN** the exported worker boundary receives unknown keys, inconsistent
  normalized coordinates, unsupported virtual keys, malformed modifiers, an
  unsafe timeout, or extra diagnostic or secret-bearing metadata
- **THEN** it rejects and closes before writing any request to the child
- **AND** no source coordinates, key labels, extra metadata, diagnostics,
  tokens, pairing codes, credentials, or secrets reach the helper protocol

#### Scenario: Queued grant expires before dispatch

- **WHEN** an accepted event waits behind another request until its grant is no
  longer active and unexpired
- **THEN** the adapter rejects it before sending the event to the helper or
  producing success metadata

#### Scenario: Input queue is bounded

- **WHEN** the configured active-and-queued request limit is reached while the
  helper is still processing an earlier request
- **THEN** the adapter rejects additional work with bounded generic failure
  metadata before adding it to the queue or dispatching it natively
- **AND** it does not expose input contents, helper diagnostics, tokens,
  pairing codes, credentials, or secrets

#### Scenario: Helper protocol fails closed

- **WHEN** the helper times out, exits, errors, rejects stdin, or emits a
  malformed, mismatched, oversized, failed, or unexpected response
- **THEN** the adapter closes and discards that helper and rejects with bounded
  generic failure metadata
- **AND** diagnostics MUST NOT expose coordinates, buttons, keys, modifiers,
  raw payloads, native output, credentials, tokens, pairing codes, or secrets

### Requirement: Windows input adapter close cancels action-capable work

The Windows input adapter SHALL expose an idempotent close operation that
synchronously invalidates its current generation, terminates the current
helper, rejects the active request, and prevents queued requests from reaching
native dispatch. A later request MUST pass a fresh active grant check before a
new helper can start. The helper MUST remain a child of the current foreground
process and MUST NOT continue as a service, detached process, startup entry, or
unattended component.

#### Scenario: Close aborts active and queued requests

- **WHEN** close occurs while one request is active and another is queued
- **THEN** both requests reject without accepted success metadata and the
  queued request never reaches native dispatch

#### Scenario: Later active grant starts a fresh helper

- **WHEN** close has completed and a later event carries a freshly validated
  active visible unexpired connected grant
- **THEN** the adapter may lazily start one new helper for the new generation
- **AND** no previous queued request or response is reused

#### Scenario: One-shot convenience does not leak a helper

- **WHEN** the one-shot input convenience operation succeeds or fails
- **THEN** it closes its adapter before settling and leaves no helper owned by
  that operation
