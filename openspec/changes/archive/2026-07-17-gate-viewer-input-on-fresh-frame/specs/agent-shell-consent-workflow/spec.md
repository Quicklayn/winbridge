## ADDED Requirements

### Requirement: Local viewer input is bound to a fresh displayed frame generation

The opt-in loopback viewer control surface SHALL assign a bounded opaque
per-run generation to each newly served stable frame-file version. It SHALL
return that generation only as bounded `/frame` response metadata and SHALL NOT
expose frame paths, bytes, source timestamps, file metadata, fingerprints,
authorization identifiers, tokens, pairing codes, credentials, screen content,
input content, private reasons, diagnostics, or full secrets with it.

The generated viewer page MUST reset displayed-frame freshness only after a
different valid generation has loaded and decoded successfully. The server MUST
require each ordinary `/input` request to carry the exact latest generation
successfully served by that surface and MUST reject missing, malformed, unseen,
superseded, or stale generation evidence before sending remote input. The
in-memory last-served generation comparison, freshness decision, and synchronous
runtime send MUST form one event-loop critical section with no intervening
filesystem operation or `await`.
These checks MUST remain additional to the existing exact Host, same-origin,
JSON content-type, mutation-token, active visible authorization, permission,
routing, audit-before-send, revoke, disconnect, and runtime input gates.

#### Scenario: Stable new frame enables generation-bound input

- **WHEN** the surface reads one stable newly published frame, the generated
  page successfully decodes it, and an otherwise authorized input request
  carries that served generation within the fixed freshness window
- **THEN** the server may send the input through the existing runtime path
- **AND** the response and diagnostics do not expose the generation, command,
  frame source, input contents, token, authorization id, or private runtime data

#### Scenario: Re-reading an unchanged source does not refresh it

- **WHEN** `/frame` reads the same stable source version more than once
- **THEN** the server returns the same opaque generation without resetting its
  original freshness observation
- **AND** the generated page does not replace the displayed frame, reset its
  freshness age, restore pointer arming, or enable new input merely because the
  repeated response loaded successfully

#### Scenario: Stale displayed frame disables and rejects input

- **WHEN** no different frame generation is observed within the fixed five-second
  freshness window
- **THEN** the page marks the displayed frame stale, disarms pointer mode,
  clears transient modifier state, and disables pointer, keyboard, and manual
  input controls
- **AND** the server rejects ordinary input for that generation as `not-ready`
  before calling the runtime input path

#### Scenario: Missing malformed unseen and superseded generations fail closed

- **WHEN** a token-protected `/input` request omits generation evidence, supplies
  an invalid or oversized value, supplies a generation from another surface
  run, or supplies a generation superseded by a newer successfully served
  stable source version
- **THEN** the surface rejects the request before sending remote input
- **AND** rejection metadata does not echo the generation, command, token, frame
  source, file metadata, input contents, private reasons, or diagnostics

#### Scenario: Source changes while a frame is read

- **WHEN** the surface cannot obtain one stable frame-file version across its
  bounded read
- **THEN** `/frame` returns bounded `not-ready` metadata without assigning,
  exposing, or refreshing a generation
- **AND** no input permission, capture, reconnect, visibility, or runtime action
  is created by that failure

#### Scenario: Frame publication and input are linearly ordered

- **WHEN** a replacement frame is being read while an input request carries the
  previously served fresh generation
- **THEN** input is decided either before the replacement becomes the
  last-served generation or after it, never against a mutable snapshot across
  an asynchronous file-close boundary
- **AND** once `/frame` publishes the replacement generation, the prior
  generation is rejected before the runtime input path

#### Scenario: Fresh replacement restores controls without rearming pointer mode

- **WHEN** a different stable generation is served and decoded after the prior
  displayed generation became stale
- **THEN** the page may restore controls allowed by current sanitized runtime
  readiness metadata
- **AND** pointer mode remains disarmed until the operator explicitly arms it
  again on the visible page

#### Scenario: Held input can only be released after freshness loss

- **WHEN** the local surface previously sent an accepted `key-down` or
  `pointer-down` and its frame generation then becomes stale or superseded
- **THEN** the server may send exactly one matching release for that server-
  tracked held item through the existing runtime authorization and audit gates
- **AND** pointer cleanup uses only the last server-accepted fresh coordinates,
  while forged, duplicate, mismatched, move, wheel, and new-down input remains
  rejected

#### Scenario: Generated page orders input and cleans up ambiguous down state

- **WHEN** the generated page sends down/up transitions or loses the HTTP
  response for a down transition
- **THEN** it serializes subsequent input requests after that transition and
  requests the token-protected server release-only cleanup action after an
  ambiguous result
- **AND** the server cleanup action releases only its own tracked held keys and
  pointer buttons through existing runtime authorization and audit gates, uses
  stored pointer coordinates, and cannot create a new down, move, wheel, key,
  permission, session, or connection action

#### Scenario: Abandoned held input has a bounded server cleanup attempt

- **WHEN** an accepted fresh down leaves server-tracked input held and no
  matching browser response or later request can be relied upon
- **THEN** the surface schedules a release-only attempt no later than that
  generation's fixed stale boundary
- **AND** a matching release, disconnect, or surface stop cancels the timer,
  while timer cleanup remains subject to runtime authorization and audit gates

#### Scenario: Freshness loss page exit and disconnect request cleanup

- **WHEN** freshness is lost, the page exits, or the viewer requests disconnect
  while the local surface tracks held input
- **THEN** the page or disconnect path requests server-authoritative release of
  that tracked state before no longer relying on ordinary input
- **AND** cleanup failure never delays or prevents explicit disconnect and does
  not bypass later revoke, pause, termination, expiration, or audit denial

#### Scenario: Authorization loss still overrides release cleanup

- **WHEN** host revoke, pause, termination, expiration, disconnect, missing
  permission, routing loss, or audit failure makes the existing runtime reject a
  generation-bound input or release
- **THEN** the local surface does not bypass that runtime decision or apply input
  directly
- **AND** it does not reconnect, regrant permission, restart capture, hide the
  host indicator, install persistence, elevate privileges, or run unattended
