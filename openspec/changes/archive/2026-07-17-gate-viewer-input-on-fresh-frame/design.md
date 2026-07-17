## Context

The loopback viewer surface currently serves a repeatedly overwritten latest-frame
file through an `<img>` request. Every successful image load resets a browser
timestamp even when the source file did not change, while the server accepts a
token-protected `/input` command without any displayed-frame evidence. Runtime
authorization still protects the remote action, but it cannot tell whether the
operator is acting on a current image.

The frame writer already publishes by same-directory temporary file and atomic
replacement. This gives the surface a stable file-version boundary without
reading arbitrary paths or changing the remote protocol.

## Goals / Non-Goals

**Goals:**

- Bind every ordinary local-surface input request to the exact fresh generation
  last served by that surface; the generated page sends it only after decode.
- Make unchanged, missing, superseded, malformed, and stale generations fail
  closed on the server as well as in the browser UI.
- Preserve a narrowly tracked release-only path for an input held by a previously
  accepted `down`, so the new stale gate does not leave that input stuck.
- Serialize generated-page input transitions and make ambiguous-response
  cleanup depend on server-tracked held state rather than caller coordinates.
- Keep generation and failure metadata bounded, opaque, and secret-safe.
- Preserve host consent, visibility, permission, routing, revocation,
  disconnect, and audit-before-send as independent authoritative gates.

**Non-Goals:**

- Changing native capture, native input application, relay, protocol messages,
  authorization grants, or audit schemas.
- Inferring freshness from image contents, exposing source timestamps, or
  reporting frame paths or bytes as metadata.
- Production streaming, frame acknowledgements over the relay, unattended
  operation, persistence, elevation, or a desktop viewer.
- Proving that an arbitrary direct loopback API client displayed a served frame;
  successful decode is enforced by the generated page, while the server gate
  intentionally proves only the latest successfully served generation.
- Solving native adapter release-on-close behavior; that is a separate host-side
  safety increment.

## Decisions

### Surface-local opaque frame generations

The server will hold one in-memory last-served frame state per surface run. A
stable source version is identified from bounded file-handle stat fields before
and after the frame read. Immediately before a successful `/frame` response,
the state assigns a new random base64url generation when those fields change and
retains the original monotonic observation time when they do not. Frame bytes,
paths, timestamps, stat fields, and fingerprints never leave the process.

The `/frame` response exposes only the bounded opaque generation in a fixed
header. The browser fetches the image, validates the generation, decodes it into
an object URL, and swaps the displayed image only after successful decode. A
repeated generation does not reset displayed freshness. Object URLs are revoked
after replacement and `img-src` is expanded only to same-page `blob:` images
created from the same-origin response.

Alternatives rejected:

- Hashing bytes would call an unchanged screen stale even while fresh captures
  continue to arrive.
- Browser load timestamps cannot distinguish a reread from a new capture.
- File paths, raw mtimes, or sequential counters reveal unnecessary source
  metadata or make cross-run guessing easier.

### Server-authoritative monotonic freshness

The server and generated page use the fixed five-second freshness window and
monotonic clocks. `/input` adds one bounded `frameGeneration` string beside the
existing command. After token/origin/content-type and bounded body validation,
the server reads only its in-memory last-served state, requires a matching
generation, checks its monotonic age, and then synchronously invokes the
existing runtime send path. There is no filesystem access, `await`, or mutable
frame-state transition between the final freshness decision and that
synchronous call. A file replacement becomes superseding only when `/frame`
successfully publishes its generation. Input is therefore ordered either before
or after that event-loop linearization point, never against state captured
across an asynchronous file close.

Missing or malformed generation evidence is a `400 rejected` request. A valid
but unseen, superseded, or stale generation is `409 not-ready`. Responses and
diagnostics never echo the generation, command, frame source, token, or private
runtime error.

The MVP smoke helper consumes and validates a bounded supported frame response,
obtains its generation immediately before pointer plus matching keyboard
down/up input, and passes that same generation to every request. Before the
later pointer-denial probe, it requires both accepted host revoke audit evidence
and sanitized viewer status showing pointer readiness removed. It then obtains
the current served generation and accepts the bounded denial response. A stale
generation response by itself is never lifecycle proof. Missing or malformed
frame metadata fails with the existing bounded input/lifecycle reason codes.

Alternative rejected: a browser-only gate is bypassable by a direct loopback
request and therefore cannot be the security boundary.

### Release-only cleanup for held input

The server records held keys and pointer buttons only after its own local
surface request is accepted by the synchronous runtime send path. When ordinary
freshness fails, it may accept exactly one matching `key-up` or `pointer-up` for
that held item. Pointer cleanup uses the last server-accepted fresh coordinates,
not coordinates supplied by the stale request. The held record is removed only
after the release send succeeds. Forged, duplicate, mismatched, move, wheel, or
new-down requests remain blocked.

The page serializes input transitions through one promise chain so down/up
requests cannot overtake each other. The server remains the held-state
authority. A same-origin, mutation-token-protected release-only action accepts
an empty body and attempts releases only for server-tracked keys and pointer
buttons, using stored pointer coordinates and the existing runtime authorization
and audit path. It cannot submit caller-selected input.

The page invokes that action after an ambiguous down response, freshness loss,
and page exit. The disconnect path attempts the same cleanup before leave but
does not let cleanup failure block explicit disconnect. Successful ordinary
responses still update page-local state for interaction ergonomics, but safety
cleanup never depends on that local state being complete.

After each accepted fresh transition that leaves server-tracked input held, the
surface also schedules one bounded release attempt for the current generation's
stale boundary. Matching release, disconnect, or surface stop cancels that
timer. This bounds a lost-response or abandoned-page hold even when no later
browser request arrives; the timer still uses only the normal runtime path and
cannot override authorization or audit denial.

Alternative rejected: blocking every stale request can strand an OS-level key
or pointer button that was pressed immediately before the freshness boundary.

### Stable-read failure is not a generation

The server compares bounded file-handle metadata before and after reading a
frame. A changed or unreadable source produces the existing metadata-only
`not-ready` response and does not create or refresh a generation. Atomic frame
replacement remains the supported writer contract.

## Risks / Trade-offs

- **File replacement and input can overlap** -> only successful `/frame`
  publication mutates the last-served generation, and the in-memory comparison
  plus synchronous runtime send has no asynchronous boundary. Input is therefore
  linearly ordered before or after publication.
- **A stale transition can occur between paired down/up events** -> only the
  server-tracked matching release bypasses freshness, with stale pointer
  coordinates discarded; the generated page also serializes transitions.
- **A down response can be lost after server acceptance** -> the page treats the
  result as ambiguous and queues server-authoritative release-all cleanup after
  the request settles; disconnect independently attempts the same cleanup.
- **Native worker close does not currently release all held OS input** -> keep
  this change limited to viewer-surface freshness and schedule a separate
  host-side release-on-revoke/disconnect OpenSpec change before field trial.
- **Blob-backed display expands CSP** -> allow only `blob:` for images; script,
  connect, form, frame, and default sources remain unchanged and restrictive.
- **Freshness can reject near the five-second boundary** -> rejection is
  intentionally fail-closed; the next newly decoded generation restores input
  availability but never restores pointer arming automatically.

## Migration Plan

1. Update the generated page and server endpoint atomically in the same package.
2. Update focused local-surface tests and smoke string assertions for the new
   request shape and browser behavior.
3. Run focused tests, full repository verification, and security review.
4. Roll back both client and server changes together if verification fails; no
   persisted data or remote protocol migration is involved.

## Open Questions

None for this increment.
