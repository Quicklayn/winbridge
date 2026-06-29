# Bootstrap Threat Model

This document covers the current WinBridge bootstrap repository. It is not a
production threat model for a hosted remote assistance service or native
Windows client.

## Scope

In scope:

- Shared protocol schemas and authorization state-machine helpers.
- Development WebSocket relay.
- Non-native agent shell used to exercise consent, visibility, revocation, and
  audit workflows.
- Local development audit sinks and JSONL audit files.
- Windows screen capture adapter package boundary, limited to explicit one-shot
  calls with active visible `screen:view` grants.
- Agent-shell Windows capture frame source, limited to explicit host CLI opt-in
  and consent-bound `screen-frame` forwarding.
- Agent-shell viewer frame output file, limited to explicit viewer CLI opt-in,
  requested `screen:view`, local audit configuration, and authorized inbound
  `screen-frame` messages.
- Agent-shell local viewer control surface, limited to explicit viewer CLI
  opt-in, `127.0.0.1` binding, the configured latest-frame output file, active
  visible viewer authorization, and existing runtime input gates.
- Windows input adapter package boundary, limited to explicit one-event calls
  with active visible connected `input:pointer` or `input:keyboard` grants.
- Agent-shell viewer control prompt input commands, limited to explicit
  one-event command lines, active visible viewer authorization, and the existing
  runtime `sendInputEvent()` gates.
- Agent-shell host input application, limited to explicit host CLI/runtime
  opt-in, local audit configuration, authorized inbound `input-event` messages,
  and one adapter call per accepted event.
- Repository workflow, OpenSpec artifacts, CI, and release documentation.

Out of scope until future OpenSpec design and security review:

- Production media pipeline, viewer desktop rendering, production remote input
  UX, and unattended/background input.
- Clipboard sync, file transfer, diagnostics collection, or remote shell.
- Native Windows UI, services, startup behavior, installer, updater, privilege
  elevation, and production deployment.
- Production accounts, hosted telemetry, crash reporting, retention, and
  support-access workflows.

Permanently prohibited:

- Hidden sessions, stealth installation, unauthorized persistence, credential
  theft, keylogging, AV/EDR evasion, Windows prompt bypass, hidden capture, and
  hidden input.

## Assets

- Host consent decision and visible-session state.
- Session authorization ids, statuses, permissions, and lifecycle transitions.
- Pairing codes, pairing tickets, relay shared tokens, device ids, peer ids,
  and session ids.
- Audit records and local JSONL audit files.
- Local runtime status snapshots and disconnect metadata.
- Screen frames returned by the capture adapter and received by an explicit
  viewer output file are sensitive content. Frames must remain in-memory until
  they are discarded, forwarded through the consent-bound `screen-frame` path,
  or written to the explicit viewer output file after inbound authorization and
  metadata-only local audit. Latest-frame publication must expose only a
  complete previous frame or a complete new frame by replacing the configured
  file from same-directory temporary output and cleaning temporary output after
  failures. The local viewer control surface can read only that configured
  latest-frame file on loopback, not temporary output files, and rejects Host
  headers that do not match the resolved `127.0.0.1:<port>` surface URL. Local
  events, logs, HTTP metadata, and audit records keep metadata only and redact
  frame bytes.
- Bounded protocol input-event metadata passed to the Windows input adapter is
  sensitive action intent. It must remain one-event-at-a-time, grant-bound, and
  free of captured keystrokes, text buffers, macros, raw commands, or persisted
  input contents. Viewer control prompt and local surface commands are local
  submitted command lines or visible page pointer actions only; prompt output,
  surface responses, logs, and audit records must not echo pointer coordinates,
  button values, key values, modifiers, or raw command text.
- Future remote assistance content such as clipboard, files, diagnostics, and
  input contents beyond bounded protocol event metadata remains an explicit
  non-asset for the current bootstrap because it must not be collected.

## Trust Boundaries

- CLI and environment input to local runtime configuration.
- Agent-shell WebSocket connections to the development relay.
- Relay room registration, pairing-ticket consumption, and message forwarding.
- Protocol envelope parsing and schema validation.
- Audit sink writes before security-relevant side effects.
- Loopback-only local viewer HTTP requests to the development surface.
- GitHub pull requests, CI, and OpenSpec review gates.

## Threats And Current Controls

| Threat | Current bootstrap controls |
| --- | --- |
| Spoofed peer or role | Relay binds forwarding to the registered socket peer, session, and role; spoofed sender, actor, target, relay-originated, and host-only workflow messages are rejected. |
| Consent bypass | Viewer requests are deny-by-default; host approval must be explicit; host visibility is required before action-capable authorization states unlock signal probes. |
| Hidden active session | Host indicator events activate only after explicit visible approval and deactivate on pause, revoke, termination, expiration, disconnect, runtime stop, or socket close. |
| Stale grant replay | Viewer state is bound to host authority and authorization id; terminal and same-authorization stale lifecycle messages cannot restore revoked permissions. |
| Secret disclosure in diagnostics | CLI/runtime events, relay errors, audit metadata, raw events, close reasons, and signal summaries redact or omit raw tokens, pairing codes, private reasons, payloads, display names, and remote-content markers. |
| Hidden capture | The Windows capture adapter rejects non-Windows, inactive, invisible, expired, permissionless, or disconnected grants before native capture and has no import-time, construction-time, service, startup, elevation, file-write, or viewer-rendering side effects. Agent-shell invokes it only after internal active visible `screen:view` authorization, peer routing, open socket, connected viewer, and metadata-only capture audit; frame send then rechecks existing `screen-frame` gates. |
| Hidden viewing | Viewer frame output is disabled unless the viewer explicitly configures `--viewer-screen-frame-output`, requests `screen:view`, and configures a local audit sink. The output write occurs only after inbound sender, peer routing, authorization id, visible active unexpired status, and `screen:view` gates pass, then publishes by replacing the latest-frame path from same-directory temporary output without serving partial files. The local viewer control surface is disabled unless explicitly configured, binds only to `127.0.0.1`, clears stale latest-frame bytes on startup, and serves only that configured latest-frame file after a current authorized write, not temporary output files. It does not render a hidden desktop UI, capture the local screen, expose LAN/public HTTP access, or suppress the host indicator. |
| Hidden input | Viewer control prompt and local surface input commands are explicit one-event commands, reject malformed, macro-shaped, text-buffer-shaped, raw-JSON, or oversized command input without echoing it, and send only through `sendInputEvent()` after active visible viewer status. The local surface also exposes explicit same-page keyboard buttons that send one bounded key-down/key-up pair through the existing input path; it does not capture keyboard input outside the visible page, buffer typed text, record keystrokes, or create macros. The Windows input adapter rejects non-Windows, inactive, invisible, expired, permissionless, disconnected, wrong-authorization, malformed, macro-shaped, text-buffer-shaped, or raw-command-shaped input before native runner invocation. It has no import-time or construction-time input side effects and no input capture or keylogging path. Agent-shell host input application is disabled by default, host-only, audit-required, gated by existing inbound authorization checks, and reports sanitized failures. |
| Audit repudiation | Security-relevant relay and agent-shell lifecycle events are audited; accepted relay forwarding writes audit before recipient delivery and fails closed if that audit write fails. Agent-shell capture writes metadata-only audit before native capture, accepted frame-send audit before socket write, viewer output audit before writing frame bytes to the explicit output file, and host input-application audit before invoking the Windows input adapter. |
| Invalid or abusive joins | Pairing tickets are hashed, expiring, use-limited, and device-distinct; invalid token and malformed message attempts are rate-limited with bounded audit metadata. |
| Denial of service | Relay bounds raw WebSocket message size, heartbeat timeouts, local rate limits, room size, duplicate peer ids, and runtime start lifecycle. Production distributed abuse controls remain future work. |
| Permission creep | Protocol and authorization validation reject clipboard, file-transfer, diagnostics, covert, credential, keylogging, evasion, prompt-bypass, remote-shell, installer, startup, service, privilege, and native-admin permission shapes until explicitly reviewed where allowed. |
| Unsafe contribution workflow | OpenSpec is required for behavior changes affecting remote assistance, security, networking, native APIs, installer, services, or user-visible workflows; high-risk surfaces require security review. |

## Future Review Gates

Before adding any native or production capability, update this threat model and
the relevant OpenSpec artifacts with:

- Data-flow boundaries for the new capability.
- Abuse cases and fail-closed behavior.
- Host-visible consent, pause, revoke, terminate, and disconnect behavior.
- Authorization and permission checks for every sensitive action.
- Audit events and audit failure behavior.
- Secret and remote-content redaction requirements.
- Installer, startup, service, privilege, and uninstall/disable behavior when
  applicable.

Production native capture UI/media pipeline work, production input UX,
clipboard, file transfer, diagnostics, production identity, production relay,
installer, startup, service, and privilege work must not begin until those gates
are explicit and reviewed.
