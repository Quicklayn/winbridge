# Architecture

## Bootstrap Architecture

```mermaid
flowchart LR
  Host["Host agent shell"] --> Relay["Development relay"]
  Viewer["Viewer agent shell"] --> Relay
  Host --> Protocol["packages/protocol"]
  Viewer --> Protocol
  Host --> WindowsInput["packages/windows-input"]
  Relay --> Protocol
```

The bootstrap validates the session protocol, relay behavior, and narrow native
package boundaries before production native Windows clients exist.

## Components

### packages/protocol

Owns shared schemas for:

- Device identity.
- Pairing tickets.
- Peer roles.
- Session join messages.
- Consent decisions.
- Permission grants.
- Session authorization lifecycle.
- Relay signaling.
- MVP remote interaction envelopes for screen frames and input events.
- Peer disconnect notices.
- Session control.
- Audit events.

The protocol package is the compatibility contract between host, viewer, relay, and future native adapters.
Protocol-facing machine identifiers are bounded and restricted to a safe printable profile before they can be used in relay state, authorization records, pairing records, or audit-related protocol metadata.

Preferred future clients should use the session authorization protocol messages for consent-bound lifecycle work:

- `session-authorization-request`
- `session-authorization-decision`
- `session-authorization-state`
- `session-control`
- `permission-revoked`
- `peer-disconnected`

These messages are wire contracts only. Sensitive actions still require the shared session authorization state-machine checks.
Session controls are authorization-bound: pause, resume, terminate, and permission-revoke control intent carries the affected `authorizationId` and cannot stand in for an action grant by itself.

MVP remote interaction messages are also wire contracts only:

- `screen-frame` carries bounded host-to-viewer frame metadata and encoded frame bytes for an already authorized `screen:view` flow.
- `input-event` carries bounded viewer-to-host pointer or keyboard actions for already authorized `input:pointer` or `input:keyboard` flows.

Protocol validation for these messages does not approve sessions, activate visibility, start capture, inject input, reconnect peers, install services, configure startup persistence, elevate privileges, or bypass Windows prompts. Future runtime and native Windows adapters must check the active visible unexpired authorization before every frame render, capture side effect, and input side effect.

### packages/audit-log

Owns reusable development audit sinks:

- In-memory sink for tests.
- Console JSON-lines sink for local debugging.
- File JSON-lines sink for local persistent development audit records.
- Schema validation and redaction through protocol audit contracts.

In-memory audit records are immutable after write so test code cannot mutate retained audit history.
Audit detail metadata is restricted to JSON-compatible values before records or protocol `audit-event` messages are retained, emitted, encoded, or persisted; properties that JSON would silently omit and detail keys containing ASCII control or Unicode bidi/zero-width formatting controls are rejected.
Audit output must not contain raw tokens, raw pairing codes, credentials, API keys, authorization headers, cookies, private keys, raw display names, private reason text, keystrokes, screenshots, screen contents, clipboard contents, file-transfer contents/data/bytes, or diagnostics content/dumps.
Audit detail redaction preserves non-secret lifecycle identifiers such as `authorizationId`.

### packages/windows-input

Owns the Windows input adapter boundary for explicit development host control
wiring. It accepts a caller-supplied active grant snapshot plus one
protocol-supported `input-event`, rejects non-Windows, inactive, invisible,
expired, disconnected, wrong-authorization, wrong-permission, malformed,
macro-shaped, text-buffer-shaped, or raw-command-shaped input before native
runner invocation, and normalizes allowed pointer or keyboard events into a
bounded native runner request.

The package is side-effect free at import and adapter construction time. Tests
inject a runner so grant and event gates are verified without applying OS input.
The default runner is a narrow non-interactive PowerShell/C# `SendInput`
bootstrap path, and failures are reported with generic metadata only. The
agent-shell host runtime invokes this adapter only after explicit host opt-in,
inbound authorization gates, and metadata-only local input-application audit.
Production host control UX and hardening remain future work before user-facing
remote input is available.

### apps/relay

Provides a development WebSocket relay:

- Starts through a managed runtime with explicit `start()` and `stop()` lifecycle.
- Emits the accepted development-mode startup audit only after the listener successfully binds, and rejects duplicate active `start()` calls before another listener attempt, warning, or startup audit write.
- Validates environment-derived and injected local TCP ports before opening the listener.
- Accepts host/viewer peers.
- Requires session id, peer id, role, and pairing credential.
- Creates a salted hashed expiring pairing ticket when the host joins, then requires a distinct viewer device to consume that ticket before room registration and records paired-device metadata only within the ticket validity window.
- Optionally enforces a non-blank, already trimmed, bounded shared development token with no ASCII control or Unicode bidi/zero-width formatting controls by requiring exactly one matching canonical lowercase `token` query parameter before room registration; missing, duplicate, case-variant, padded, or wrong token parameters fail closed, and when no shared token is configured, token-bearing client URLs are rejected before room registration instead of being silently accepted.
- Limits a room to one host and one viewer.
- Treats live peer ids as exclusive within a session room; duplicate joins for an already registered peer id are rejected before replacing the peer send path or mutating pairing-ticket state. The same peer id can join again only after normal disconnect cleanup removes the previous peer.
- Validates protocol envelopes before forwarding.
- Binds registered-peer forwarding to the socket's peer id and rejects join-only, relay-originated, spoofed sender/actor, or role-mismatched authorization messages.
- Requires host role before forwarding host-originated legacy consent decisions and host-only workflow authority messages such as authorization state, permission revocation, session control, and development workflow audit events.
- Requires a remaining registered recipient and rejects explicit target peer ids that do not match that recipient.
- Rejects `hello` capability hints that are blank, untrimmed, duplicated after trimming, or contain ASCII control or Unicode bidi/zero-width formatting controls before accepting them as peer metadata.
- Rejects malformed protocol identifiers before relay room registration.
- Bounds raw WebSocket message size before protocol decoding.
- Requires every `signal` payload to be a JSON-compatible object with a valid top-level `authorizationId`, a bounded non-secret optional top-level `kind` classifier when present, and property names without ASCII control or Unicode bidi/zero-width formatting controls before forwarding, then rejects empty, oversized, non-representable, inherited-`toJSON`-mutated, malformed-kind, or sensitive-key payloads including auth/session secret key names plus clipboard, file-transfer, and diagnostics content key names.
- Normalizes malformed-message `relay-error` and invalid-message audit reasons to bounded secret-safe strings, and treats peer-facing `relay-error` delivery as best-effort after mandatory rejection audit and rate-limit accounting.
- Emits structured development audit records for joins, denials, forwarding, and disconnects; decoded denied joins include safe attempted session and peer attribution, omitting raw attempted identifiers when they contain the submitted pairing code. Accepted forwarding audit includes the validated `messageId` plus safe recipient peer metadata, and accepted signal-forwarding audit also includes the non-secret `authorizationId` but not raw signal payload contents.
- Redacts or omits audit attribution for protocol identifiers that contain pairing codes or obvious token, credential, cookie, or key secret-marker families, including marker words separated by `.`, `_`, `-`, or `:`.
- Rate-limits repeated invalid token and malformed-message attempts with in-memory development defaults and bounded canonical integer environment overrides.
- Sends WebSocket heartbeat pings, closes peers that miss heartbeat timeout, and audits heartbeat timeout failures.
- Sends schema-valid `peer-disconnected` notices to the remaining peer when a registered host or viewer disconnects.
- Rejects peer-originated `peer-disconnected` messages before forwarding because disconnect notices are broker-observed relay lifecycle events.

This relay is not production authorization. A future identity/auth OpenSpec change must add proper accounts, token lifecycle, device trust, and audit persistence.
Production abuse protection also needs a distributed limiter or edge protection; the current limiter is single-process development hardening.
Production liveness also needs distributed state, reconnect policy, and stale-session cleanup beyond this single-process development heartbeat.
Peer disconnect notices are lifecycle notifications only. They do not grant permissions, start capture, send input, reconnect peers, or bypass authorization.

The CLI entrypoint and integration tests use the same runtime implementation. Tests start the relay on an ephemeral local port and verify real WebSocket join, forwarding, rejection, disconnect notification, and rate-limit behavior.
Unexpected relay CLI startup/shutdown errors are printed as metadata-only diagnostics with generic text and message byte length, not raw exception messages or stacks.

Set `WINBRIDGE_RELAY_AUDIT_LOG_PATH` to write relay audit events to a local JSONL file during development; configured audit paths must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi/zero-width formatting controls, contain no Windows reserved device path segments such as `NUL`, `CON`, `COM1`, or `LPT1`, contain no Windows alternate data stream path segments such as `logs\relay-audit.jsonl:hidden`, and not use Windows device namespace prefixes such as `\\.\` or `\\?\`.
Heartbeat defaults are controlled by `WINBRIDGE_RELAY_HEARTBEAT_ENABLED`, `WINBRIDGE_RELAY_HEARTBEAT_INTERVAL_MS`, and `WINBRIDGE_RELAY_HEARTBEAT_TIMEOUT_MS`; the enabled flag must use a canonical value without leading or trailing whitespace.
Pairing ticket defaults are controlled by `WINBRIDGE_RELAY_PAIRING_TICKET_TTL_MS` and `WINBRIDGE_RELAY_PAIRING_TICKET_MAX_USES`; injected runtime pairing settings are bounded and snapshotted before host pairing tickets are created.
Development invalid-token and invalid-message rate limits are bounded, and direct limiter options are snapshotted before decisions are made so caller mutations cannot weaken abuse controls.

### apps/agent-shell

Provides a CLI exerciser for protocol and relay behavior. It can opt into a reviewed Windows capture adapter, explicit viewer frame output, a loopback-only local viewer control surface, an interactive viewer control prompt for bounded input commands, and explicit host Windows input application for development remote-assistance checks, but it intentionally does not capture input, sync clipboard, transfer files, run unattended, or install a service.

The shell can exercise development `screen-frame` and `input-event` flows through explicit runtime methods after active, visible, unexpired authorization. The host frame method publishes caller-supplied development frame bytes or a Windows-captured JPEG/PNG after metadata-only capture audit; the viewer input method publishes caller-supplied pointer or keyboard intent only. Accepted local sends persist metadata-only audit before socket write, and audit failure blocks the send. Viewer frame output can persist the latest authorized inbound frame to an explicit local file only after inbound authorization and metadata-only output audit. It creates the configured output directory when needed, writes each new frame to a same-directory temporary file, and then replaces the configured latest-frame path, preserving the previous complete frame when replacement fails and cleaning the temporary file on failure. The local viewer control surface serves that configured latest-frame file only on `127.0.0.1` after clearing stale startup bytes, ignores temporary frame output files, and sends explicit browser-originated pointer, command-box keyboard input, or same-page keyboard-button clicks through the same `sendInputEvent()` path only after same-origin per-run token checks and active visible viewer status are available. Keyboard buttons send one bounded key-down/key-up pair and do not install document-level keyboard capture. The viewer control prompt can send one explicit bounded pointer or keyboard event per accepted input command through the same `sendInputEvent()` path after reading active visible viewer status. Host input application is disabled by default and requires explicit host runtime or CLI opt-in plus local audit; an opted-in host writes metadata-only input-application audit before invoking the Windows input adapter for an authorized inbound input event. Runtime sent/received events redact frame data and input details. The shell still does not provide production native Windows clients; production native behavior requires later OpenSpec changes for host UI, viewer UI/media, and production input UX hardening.

Clipboard permissions `clipboard:read` and `clipboard:write` are intentionally rejected by shared protocol, authorization, CLI, and runtime validation until a dedicated OpenSpec change and security review define a consent-first clipboard capability.

File transfer permission `file-transfer` is intentionally rejected by shared protocol, authorization, CLI, host control, and runtime validation until a dedicated OpenSpec change and security review define a consent-first file-transfer capability.

Diagnostics-shaped permission `diagnostics:view` is intentionally rejected by shared protocol, authorization, CLI, host control, and runtime validation until a dedicated OpenSpec change and security review define a consent-first diagnostics capability.

The shell has a managed runtime shared by CLI and tests. Development consent workflow behavior:

- The runtime rejects duplicate active `start()` calls before opening another WebSocket or sending another join, while allowing explicit restart after the previous connection is fully closed or stopped.
- The runtime sends `join-session` on socket open and defers `hello` until the relay reports a two-peer room or a peer `hello` is received. Each runtime creates one schema-validated local device identity for the connection and reuses it in both `join-session` and `hello`; protocol parsing rejects `hello` identity metadata whose nested display name conflicts with the top-level display name.
- Viewer mode can send `session-authorization-request` when explicit viewer-only `--request` permissions are provided and the relay has reported a paired two-peer room.
- Host mode rejects explicit `--request` before managed runtime creation; direct host runtimes reject non-empty `requestedPermissions` before opening a relay connection.
- Host mode does nothing by default when a request is received.
- Host mode can send approval or denial only with explicit static `--host-decision` or opt-in interactive `--host-consent-prompt true`.
- Host approval can use explicit development `--grant <permission[,permission]>` scope only to narrow the viewer's current request. The grant scope is host-only, non-empty, unique, valid only with static approval or interactive host consent, and fails closed without approval, active-state, control, signal, or workflow audit messages if it contains an unrequested permission.
- Interactive host consent prompts show the observed viewer peer id, validated viewer display name when available, bounded viewer device id/platform metadata when available from a trusted viewer `hello`, requested permission names, and permission count before accepting input; they do not display remote self-asserted `trustLevel` values as verified trust context. They accept only exact `approve` or `deny` responses before the bounded host consent timeout expires, are mutually exclusive with static approval/denial, and fail closed on timeout, invalid input, cancellation, or prompt failure. The displayed viewer identity is development peer metadata, not production account authentication, and it does not grant permissions or bypass consent.
- Interactive host control prompt mode is an opt-in development CLI surface that accepts exact host commands `help`, `status`, `pause`, `resume`, `revoke <permission>`, `terminate`, and `disconnect`; its static help lists the MVP revoke forms `revoke screen:view`, `revoke input:pointer`, and `revoke input:keyboard` without widening parser validation. It is host-only and mutually exclusive with one-shot host status mode. When combined with interactive host consent prompt mode, it starts only after the approved active visible host indicator so stdin is not shared with the consent prompt. It never echoes raw command lines, prints only a static command list for `help`, calls only the managed runtime direct controls for lifecycle commands, uses a read-only runtime snapshot for `status`, and stops the prompt locally after successful `terminate` or `disconnect` while keeping failed terminal or disconnect attempts recoverable through sanitized error output.
- Host runtimes expose a read-only bounded status snapshot for future host UI wiring; it reports local indicator lifecycle metadata plus optional viewer device id/platform bound when the active or paused authorization was approved, and it does not send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, or invoke host controls. The snapshot omits viewer peer id, viewer display name, and remote self-asserted `trustLevel`; device status context is development metadata, not production account authentication, and later same-peer `hello` metadata does not rewrite an already approved status context. The development CLI can print this snapshot once with `--host-status-after-ms <delay>` after host-only bounded-delay validation, or repeatedly through the host control prompt `status` command. The one-shot helper runs inside the ordinary managed runtime, so normal startup and other explicit host workflow options keep their existing protocol behavior; the scheduled status read itself remains read-only.
- Viewer runtimes expose a read-only bounded status snapshot for future viewer UI wiring; it reports local lifecycle metadata only and does not send protocol messages, emit workflow audit events, grant permissions, start signaling, or invoke host controls. After a trusted host acknowledgement for the current active signal probe, viewer status may include `signalProbeAckReceived=true` without exposing raw signal payload markers, kind metadata, or contents. After trusted host disconnect, viewer status reports inactive local state with zero action-capable permissions while retaining optional authorization id/status metadata for local diagnostics. After managed local viewer leave, viewer status reports inactive local state with zero action-capable permissions and clears authorization id/status metadata from the left connection scope. The development CLI can print this snapshot once with `--viewer-status-after-ms <delay>` after viewer-only bounded-delay validation, or repeatedly through viewer-only `--viewer-control-prompt true`.
- Viewer runtimes can schedule a local development leave with `--viewer-disconnect-after-ms <delay>`; it invokes the managed viewer-only `leave()` control, closes only the local viewer relay connection, sends no forged `peer-disconnected`, lifecycle, signal, control, or workflow audit messages, and relies on the relay to notify the remaining host.
- Viewer control prompt mode is an opt-in development CLI surface that accepts exact viewer commands `help`, `status`, `disconnect`, and bounded one-event pointer/keyboard input commands; it is viewer-only, mutually exclusive with the one-shot viewer status and disconnect timers, never echoes raw command lines, prints only a static command list for `help`, uses the read-only runtime snapshot for `status`, uses the managed viewer-only `leave()` control for `disconnect`, sends input only through the dedicated runtime `sendInputEvent()` path after active visible viewer status is available, stops the prompt locally after successful `disconnect`, and keeps failed disconnect or input attempts recoverable through sanitized error output.
- Viewer local control surface mode is an opt-in development HTTP surface that binds only to `127.0.0.1` on an explicit validated port, requires `--viewer-screen-frame-output`, serves only that configured latest-frame file, returns no-store/nosniff HTML with a nonce-based Content Security Policy for the generated inline style and script, reports sanitized viewer status without the authorization id, accepts bounded exact input commands and explicit same-page keyboard button clicks through the shared viewer control parser, requires a visible same-page `Pointer Off/On` arming control and a ready displayed frame before browser pointer movement, wheel, or button events can send input, preloads replacement frames before swapping the displayed frame so ordinary refreshes do not disarm pointer control while a ready frame remains visible, suppresses browser-native context menu and image drag defaults only on the displayed remote frame, invokes only `runtime.sendInputEvent()` or viewer `leave()`, closes with CLI shutdown, and never reads arbitrary paths, exposes LAN/public HTTP access, buffers typed text, records keystrokes, captures keyboard input outside the visible page, syncs clipboard, transfers files, installs services, configures startup persistence, elevates privileges, runs unattended, hides the session, or bypasses Windows prompts.
- The root MVP smoke check is a bounded local preflight that starts the existing relay, host, and viewer CLI entrypoints with static development frames, explicit visible host approval, temporary audit/frame paths, and a loopback viewer surface. It verifies frame publication and local surface readiness, then stops all child processes. It does not use Windows capture, host input application, browser automation, services, startup persistence, privilege elevation, unattended access, hidden sessions, or Windows prompt bypass.
- Viewer signal probe mode is an opt-in development signaling surface that sends one static `signal` payload after the viewer observes active visible `screen:view` authorization; it is viewer-only, requires a `screen:view` request, uses the public runtime signal send gates, includes bounded non-secret `payload.kind=viewer-signal-probe` metadata, and carries no SDP, ICE candidates, user-provided JSON, screen contents, input, clipboard data, file-transfer data, diagnostics data, tokens, pairing codes, or display names.
- Host signal probe acknowledgement mode is an opt-in development signaling surface that sends at most one static acknowledgement `signal` per authorization id after a trusted viewer probe passes inbound signal gates; it is host-only, uses the public runtime signal send gates, includes bounded non-secret `payload.kind=host-signal-probe-ack` metadata, fails closed after pause, revoke, termination, expiration, local disconnect, remote disconnect, missing recipient, routing mismatch, invisible approval, or missing `screen:view`, and carries no SDP, ICE candidates, user-provided JSON, screen contents, input, clipboard data, file-transfer data, diagnostics data, tokens, pairing codes, credentials, private reasons, or display names.
- Host input application is an opt-in development surface. It is host-only,
  disabled by default, rejected without local audit configuration, and applies
  inbound `input-event` messages only after sender role, peer routing, session,
  target, authorization id, visible active unexpired authorization, connected
  viewer, and required `input:pointer` or `input:keyboard` permission checks
  pass. It writes metadata-only input-application audit before invoking the
  Windows input adapter; audit or adapter failure withholds trusted received
  events and reports only generic diagnostics.
- Host mode emits active state only when `--visible-session true` is also provided.
- Viewer mode rejects explicit host-only workflow CLI options before runtime startup, including static host decisions, host consent prompt settings, host visibility flags, authorization TTL, host grants, host lifecycle timers/reasons, host status/control options, host signal acknowledgement, and host input application, even when the explicit value is a no-op such as `none` or `false`.
- Inbound `relay-ready` messages whose peer id does not match the local runtime peer are ignored before local received-event emission or presence and authorization request workflow handling.
- Inbound `hello` messages whose peer id matches the local runtime peer are ignored before local received-event emission or presence workflow handling.
- Inbound protocol messages whose session id does not match the local runtime session are ignored before local received-event emission or consent workflow handling.
- Inbound authorization requests that identify the local host peer as the viewer are ignored before local received-event emission or consent workflow handling.
- CLI argument parsing rejects unknown, duplicate, missing-value, malformed relay URL, relay URLs with embedded credentials or canonical/case-variant `token` query values, malformed protocol identifier, secret-bearing `--session`, `--peer`, or `--device` identifier metadata, blank, untrimmed, control-character, bidi/zero-width-control, or oversized display name, malformed or unavailable permissions including clipboard, file-transfer, and diagnostics-shaped permissions, malformed pairing, blank, untrimmed, control-character, bidi/zero-width-control, or oversized token, zero or unsafe `--authorization-ttl-ms`, zero, unsafe, or prompt-disabled `--host-consent-timeout-ms`, blank, untrimmed, control-character, bidi/zero-width-control, oversized, Windows-device, Windows alternate data stream, or Windows device namespace audit log path, blank, untrimmed, control-character, bidi/zero-width-control, oversized, Windows-device, Windows alternate data stream, Windows device namespace, host-mode, `screen:view`-less, or auditless viewer screen-frame output path, malformed, host-mode, or frame-output-less viewer local control surface port, blank, untrimmed, or oversized lifecycle reason, WebSocket-close-unsafe or viewer-mode host disconnect reason, non-`true`/`false` visible-session, host-consent-prompt, host-control-prompt, viewer-control-prompt, or host-signal-probe-ack values, explicit host workflow options on viewer runtimes, explicit viewer request options on host runtimes, viewer prompt mode, host control prompt mode on viewers, viewer control prompt mode on hosts, host signal probe acknowledgement mode on viewers, malformed or ambiguous host grant scope, host consent prompt combined with static approval/denial, host control prompt combined with one-shot host status, viewer control prompt combined with one-shot viewer status or disconnect timers, malformed or viewer-mode one-shot host status, malformed, host-mode, or `screen:view`-less viewer signal probe configuration, malformed or host-mode viewer status configuration, and malformed or host-mode viewer local disconnect configuration before runtime start.
- The managed runtime also rejects malformed direct options before relay startup, including non-WebSocket relay URLs, relay URLs with embedded credentials or canonical/case-variant `token` query values, malformed identifiers, secret-bearing session id, peer id, or device id metadata, blank, untrimmed, control-character, bidi/zero-width-control, or oversized display names, blank, untrimmed, control-character, bidi/zero-width-control, non-string, or oversized tokens, duplicate, invalid, or unavailable permissions including clipboard, file-transfer, and diagnostics-shaped permissions, non-empty host requested permissions, malformed host grant scope, non-boolean visible-session flags, viewer runtime host workflow state, invalid host decision providers, host decision providers on viewer runtimes, host decision providers combined with static approval/denial, providerless, zero, or unsafe host consent timeout, zero or unsafe authorization TTL, unsafe workflow timers, malformed viewer signal probe configuration, viewer frame output without viewer role, `screen:view`, or local audit sink, malformed or viewer-mode host signal probe acknowledgement configuration, blank, untrimmed, or oversized decision/lifecycle reasons, and WebSocket-close-unsafe or viewer-mode host disconnect reasons. Empty host requested permissions remain a non-authorizing compatibility default. Relay shared tokens use the dedicated `--token`/runtime token path and are bounded before connection setup.
- Host mode can simulate permission revocation only after explicit visible approval with `--revoke-after-ms` and `--revoke-permission`; managed host runtimes can also invoke direct local `revokePermission(permission)` after active or paused visible authorization for a currently granted permission. Direct and delayed revocation share the same host workflow state, protocol sequence, indicator updates, and audit-first behavior.
- Host mode can simulate session termination only after explicit visible approval with `--terminate-after-ms`; managed host runtimes can also invoke direct local `terminate()` after active or paused visible authorization. Direct and delayed termination share the same host workflow state, protocol sequence, inactive indicator update, and audit-first behavior.
- Host mode can simulate authorization expiration after visible activation with positive `--authorization-ttl-ms`.
- Host mode can simulate pause/resume only after explicit visible approval with `--pause-after-ms` and optional `--resume-after-ms`; managed host runtimes can also invoke direct local `pause()` after active visible authorization and direct local `resume()` after paused visible authorization. Direct and delayed pause/resume share the same host workflow state, protocol sequence, indicator updates, and audit-first behavior.
- Host mode can simulate local disconnect only after explicit visible approval with `--disconnect-after-ms`; managed host runtimes can also invoke direct local disconnect control after active or paused visible authorization. Both paths can use an optional bounded host disconnect reason only as local WebSocket close metadata, close the host relay WebSocket, and leave the relay responsible for `peer-disconnected` notices.
- Host mode emits local secret-safe `indicator` runtime events for visible-session UI wiring after explicit visible activation, updates them for pause/resume/permission changes, and deactivates them on terminal lifecycle, disconnect, runtime stop, or socket close. Indicator events do not authorize remote actions.
- Host mode emits development `audit-event` protocol messages for decision, activation, revocation, termination, expiration, pause, and resume workflow events.
- Host mode can persist those host-generated workflow audit events and local disconnect audit records to JSONL with `--audit-log` or `WINBRIDGE_AGENT_AUDIT_LOG_PATH`; configured audit paths must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, contain no Windows reserved device path segments such as `NUL`, `CON`, `COM1`, or `LPT1`, contain no Windows alternate data stream path segments such as `logs\agent-audit.jsonl:hidden`, and not use Windows device namespace prefixes such as `\\.\` or `\\?\`. Revocation, termination, and pause/resume audit failures are reported with sanitized diagnostics and block the matching lifecycle protocol messages. Local disconnect audit failures are reported with sanitized diagnostics but do not block indicator deactivation or WebSocket close.
- Host mode records `peer-disconnected` as remote peer disconnected state and suppresses later delayed workflow simulation messages and direct managed runtime sends for that peer.
- Host mode suppresses later delayed workflow simulation messages after local disconnect simulation closes the connection.
- Inbound `peer-disconnected` messages whose peer id matches the local runtime peer are ignored before local received-event emission or remote peer disconnected state handling.
- Runtime `sent` events use schema-normalized event-safe protocol views; audit-event details and join-session pairing codes are redacted from the local event surface.
- Runtime `sent` events for `signal` messages expose routing metadata and redacted payload summaries, not raw signal payload contents.
- Viewer-originated `signal` sends fail closed unless the viewer has observed an active, visible, unexpired `screen:view` authorization state and the signal payload carries the matching `authorizationId`.
- Viewer-side authorization lifecycle state is bound to the host authority and authorization id from a decision addressed to the local viewer; inbound legacy consent decisions plus unbound, mismatched-authority, mismatched-authorization, denied-to-active, terminal same-id decision replay, or prior-connection state/control/revoke messages are ignored before received-event emission and cannot unlock `signal` sends. Bound revoke controls remove permission locally before the follow-up `permission-revoked` confirmation and state update. Same-authorization stale decisions or state updates are filtered through a local revoked-permission floor so they cannot restore `screen:view`; a new authorization id from the observed host resets that floor for the new consent scope.
- Runtime `received` events for `signal` messages expose routing metadata and redacted payload summaries, not raw signal payload contents.
- Inbound `signal` messages are ignored before local received-event emission unless the runtime has active visible `screen:view` authorization and the signal payload carries the matching `authorizationId`.
- Host-originated public runtime `signal` sends fail closed before socket write and local sent-event emission unless the host has locally emitted an active, visible, unexpired `screen:view` authorization state and the signal payload carries the matching `authorizationId`.
- Public and inbound `signal` payload validation rejects unsafe property names containing ASCII control or Unicode bidi/zero-width formatting controls before trusted events or socket writes, and diagnostics remain redacted from raw key names and values.
- Host development `screen-frame` sends use the dedicated runtime method and fail closed unless the host has a matching active, visible, unexpired `screen:view` authorization, observed viewer routing, matching `authorizationId`, and successful metadata-only accepted-send audit before socket write.
- Viewer frame output writes the latest authorized inbound `screen-frame` bytes only to an explicit configured file after inbound authorization gates and metadata-only local output audit; it creates the configured output directory before temporary publication, and audit failure, directory creation failure, stale authorization, misrouting, missing `screen:view`, or missing audit sink prevents file writes and trusted received events.
- Viewer local control surface reads only the explicit configured latest-frame output file, returns no-store image responses on loopback, rejects missing frames with bounded metadata, and routes accepted input through the same viewer input send gates as the terminal prompt.
- Viewer development `input-event` sends use the dedicated runtime method and fail closed unless the viewer has a matching active, visible, unexpired `input:pointer` or `input:keyboard` authorization for the input kind, observed host routing, matching `authorizationId`, and successful metadata-only accepted-send audit before socket write.
- Host input application for authorized inbound `input-event` messages is an
  extra side effect after inbound remote interaction gates. It remains disabled
  unless explicitly opted in, requires local audit, invokes the Windows input
  adapter only after metadata-only input-application audit succeeds, and fails
  closed without raw input disclosure after audit failure, adapter failure,
  stale authorization, disconnect, or permission loss.
- Generic public runtime `send()` rejects `screen-frame` and `input-event` messages so callers cannot bypass the dedicated remote interaction gates or audit ordering.
- Inbound remote interaction messages are ignored before trusted received-event emission unless role direction, sender peer, optional target peer, session id, `authorizationId`, current authorization status, visibility, expiration, and required permission match local runtime state.
- Runtime sent/received events and audit details for remote interaction messages are metadata-only: frame bytes, screen contents, pointer coordinates, button values, key values, modifiers, and raw input payloads are redacted.
- Public runtime sends for workflow-authority messages (`host-consent-decision`, `session-authorization-decision`, `session-authorization-state`, `permission-revoked`, `session-control`, and `audit-event`) fail closed before socket write and local sent-event emission; only the internal explicit consent workflow emits those messages. Legacy `host-consent-required` remains a non-granting request message.
- Inbound `signal` messages are ignored before local received-event emission unless they are addressed to the local runtime peer and originate from a distinct remote peer.
- Inbound legacy consent decisions, authorization lifecycle messages, and audit workflow messages that identify the local runtime peer as the authority actor are ignored before local received-event emission or workflow summary logging.
- Runtime `sent` and `received` events redact protocol `reason` text while preserving consent workflow metadata.
- Runtime `raw` events for non-protocol inbound text are metadata-only; they expose redacted text and byte length, not the original payload.
- Runtime `closed` events for WebSocket disconnects are metadata-only; they expose redacted reason text and reason byte length, not the original close reason.
- Runtime `error` events and runtime/socket error logs are metadata-only; they expose generic error text and message byte length, not raw exception messages.
- Received message logs contain summaries only, not raw protocol payloads.
- CLI argument parsing rejects duplicate requested permissions before sending authorization requests.
- Unexpected CLI startup/shutdown errors are metadata-only; expected usage errors remain static usage text.

This workflow is a protocol simulator, not production host consent UI.
Development agent-shell audit files are local development persistence, not production audit storage. Safe configured audit paths create parent directories on first write, so default MVP paths such as `logs\host-audit.jsonl` work on a fresh checkout while write failures still surface.
Agent-shell `hello` messages are presence metadata only. They do not authorize sessions, activate visibility, grant permissions, or enable remote actions.

## Future Windows Architecture

Future native work should be split into separate OpenSpec changes:

- Host UI and session indicator.
- Viewer UI.
- Production Windows capture UX/media hardening.
- Production host input UX and hardening beyond the development agent-shell opt-in path.
- WebRTC media transport.
- Identity and device pairing.
- Audit persistence.
- Installer and update model.

Native code must preserve host-visible consent and revocation controls.

## Authorization Contract

Native adapters and future runtime wiring must call the shared protocol authorization checks before processing sensitive actions. A remote action is allowed only when:

- The session authorization state is `active`.
- The host-visible session flag is true.
- The authorization has not expired.
- The requested permission is present.
- The session is not paused, revoked, or terminated.

Permission revocation must also use the shared authorization state machine. It is valid only for visible, unexpired `active` or `paused` authorizations with the permission currently granted; partial revocation preserves pause state, and final revocation marks the authorization `revoked`.

Approval grants must also be created through the shared state machine. Host approval may grant an exact or narrower subset of the viewer's requested permissions, but empty, duplicate, or unrequested grants are rejected before activation.
Terminal authorization states such as `denied`, `revoked`, `terminated`, and `expired` carry no permissions, preventing stale grant scope from being interpreted by future native adapters. Native adapters must also treat viewer-observed same-authorization permission revocations as a floor that stale lifecycle messages cannot widen, and must ignore later approved decisions replayed for the same terminal authorization id. A new authorization id from the observed host must be evaluated as a new consent scope, not constrained by the previous authorization id's floor.
