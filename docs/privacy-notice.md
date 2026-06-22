# Privacy Notice

This notice describes the current WinBridge bootstrap repository. It is not a production privacy policy for a hosted remote assistance service.

## Current Product State

WinBridge currently provides protocol schemas, a development relay, a non-native agent shell, OpenSpec requirements, tests, documentation, a Windows-only development capture adapter, an explicit viewer output-file path for authorized frames, a loopback-only local viewer control surface for development MVP checks, an interactive viewer control prompt for authorized one-event input commands, and explicit host opt-in Windows input application for authorized development input events. It does not implement:

- Production user-facing desktop remote pointer/keyboard control UI.
- Clipboard synchronization.
- File transfer.
- Diagnostics collection.
- Unattended access.
- Native Windows host or viewer UI.
- Installer, startup persistence, background service, or privilege elevation behavior.
- Production accounts, telemetry, hosted storage, or production deployment.

## Data Processed During Local Development

When developers run the local relay or agent shell, the project processes development metadata needed to exercise consent and authorization workflows:

- Session ids, peer ids, device ids, roles, and bounded display-name metadata.
- Pairing tickets and pairing-code checks for local development rooms.
- Requested and granted permission names.
- Authorization ids, authorization status, visible-session state, lifecycle state, and bounded reason metadata.
- Relay connection lifecycle metadata such as joins, disconnects, heartbeat timeouts, forwarding decisions, and rejection reasons.
- Optional local JSONL audit records when a developer configures an audit log path.
- Optional local screen-frame bytes only when a developer explicitly enables the
  host Windows capture or static frame source and the viewer explicitly enables
  `--viewer-screen-frame-output` after consent-bound `screen:view`
  authorization. The local viewer control surface can display only that
  configured latest-frame file on `127.0.0.1`; it does not read arbitrary paths
  or upload frame bytes.
- Optional bounded protocol pointer/keyboard event metadata in development
  transport tests, the interactive viewer control prompt, direct package tests,
  the local viewer control surface, or explicit host input application. The
  viewer control prompt and local surface accept only exact one-event command
  lines or visible page pointer actions and do not capture keyboard input
  outside submitted commands. The Windows input adapter accepts only one
  protocol-supported event at a time under an active visible connected grant,
  and the agent shell applies it only after explicit host opt-in and
  metadata-only local audit.

This metadata is for local development and verification. It is not a production account identity system and does not grant access by itself.

## Data Not Collected By The Current Bootstrap

The current bootstrap must not collect or persist remote assistance content except for the explicit development viewer frame output described above:

- No hidden screenshots, hidden screen contents, or hidden screen capture.
- No automatic frame persistence; screen-frame files are written only to an
  explicit local viewer path after authorization and metadata-only local audit.
- No keystroke capture, keylogging output, text buffers, macros, input capture,
  persisted pointer/keyboard contents, unattended input, or hidden remote input;
  viewer prompt and local surface input commands are explicit one-event command
  lines or visible page pointer actions, and diagnostics remain metadata-only.
- No clipboard contents.
- No file contents or file-transfer bytes.
- No diagnostics dumps.
- No credentials, API keys, cookies, private keys, authorization headers, or raw tokens.
- No production telemetry or crash uploads.

Signal probe payloads used by development tests are static protocol markers only and must not include SDP, ICE candidates, screen contents, input, clipboard data, file-transfer data, diagnostics data, tokens, pairing codes, credentials, private reasons, or display names.

## Local Logs And Audit Files

By default, development diagnostics are written to the local console as bounded metadata. Developers can opt in to local JSONL audit files:

- Relay audit path: `WINBRIDGE_RELAY_AUDIT_LOG_PATH`.
- Agent audit path: `WINBRIDGE_AGENT_AUDIT_LOG_PATH` or `--audit-log`.

Audit paths are validated before use. Audit records are redacted before output or persistence and must not contain raw secrets or remote assistance content. Viewer frame output, the local viewer control surface, and host input application require local audit configuration through the frame-output path dependency. The audit file remains metadata-only while the explicit frame output file contains the authorized frame bytes; host input application does not persist input contents. Local audit and output files remain on the developer's machine and are not uploaded by the project.

## Consent And Control

The project is designed for authorized remote assistance only:

- Host approval is explicit.
- Active sessions must be visible to the host before sensitive actions.
- Host pause, revoke, terminate, and disconnect controls are first-class safety requirements.
- Sensitive actions require authorization and audit coverage before native
  capture or runtime input side effects.

Hidden sessions, stealth installation, unauthorized persistence, credential theft, keylogging, AV/EDR evasion, Windows prompt bypass, hidden capture, and hidden input are prohibited.

## Before Production Use

Before any production release or hosted service, this notice must be replaced or extended with a production privacy policy covering account data, hosting, retention, subprocessors, telemetry, crash reporting, support access, user rights, and deletion workflows.
