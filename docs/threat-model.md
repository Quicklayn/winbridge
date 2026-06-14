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
- Repository workflow, OpenSpec artifacts, CI, and release documentation.

Out of scope until future OpenSpec design and security review:

- Screen capture, frame transport, and remote input injection.
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
- Future remote assistance content such as screen frames, input, clipboard,
  files, and diagnostics remains an explicit non-asset for the current
  bootstrap because it must not be collected.

## Trust Boundaries

- CLI and environment input to local runtime configuration.
- Agent-shell WebSocket connections to the development relay.
- Relay room registration, pairing-ticket consumption, and message forwarding.
- Protocol envelope parsing and schema validation.
- Audit sink writes before security-relevant side effects.
- GitHub pull requests, CI, and OpenSpec review gates.

## Threats And Current Controls

| Threat | Current bootstrap controls |
| --- | --- |
| Spoofed peer or role | Relay binds forwarding to the registered socket peer, session, and role; spoofed sender, actor, target, relay-originated, and host-only workflow messages are rejected. |
| Consent bypass | Viewer requests are deny-by-default; host approval must be explicit; host visibility is required before action-capable authorization states unlock signal probes. |
| Hidden active session | Host indicator events activate only after explicit visible approval and deactivate on pause, revoke, termination, expiration, disconnect, runtime stop, or socket close. |
| Stale grant replay | Viewer state is bound to host authority and authorization id; terminal and same-authorization stale lifecycle messages cannot restore revoked permissions. |
| Secret disclosure in diagnostics | CLI/runtime events, relay errors, audit metadata, raw events, close reasons, and signal summaries redact or omit raw tokens, pairing codes, private reasons, payloads, display names, and remote-content markers. |
| Audit repudiation | Security-relevant relay and agent-shell lifecycle events are audited; accepted relay forwarding writes audit before recipient delivery and fails closed if that audit write fails. |
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

Native capture, input, clipboard, file transfer, diagnostics, production
identity, production relay, installer, startup, service, and privilege work must
not begin until those gates are explicit and reviewed.
