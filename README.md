# WinBridge

WinBridge is a consent-first Windows-to-Windows remote assistance project.

The current repository state is a bootstrap foundation: OpenSpec workflow, security boundaries, protocol schemas, a development relay, a non-native agent shell, a Windows screen capture adapter wired into an explicit consent-bound host development frame source, an explicit viewer output-file path for authorized frames, a loopback-only local viewer control surface for development MVP checks, an MVP command kit for printing a visible relay/host/viewer launch sequence, an interactive viewer control prompt for authorized development input commands, and explicit host opt-in Windows input application for authorized development input events. It does **not** implement a production desktop viewer UI, production remote-control UX, unattended access, or production deployment yet.

## Safety Scope

WinBridge is designed for authorized support sessions only.

Allowed direction:

- Explicit host approval before access.
- Visible active-session indicator on the host.
- Immediate host disconnect and permission revocation.
- Authenticated, authorized, audited sensitive actions.
- Deny-by-default session authorization for future sensitive actions.

Out of scope and prohibited:

- Hidden sessions.
- Stealth installation.
- Unauthorized persistence.
- Credential theft or keylogging.
- AV/EDR evasion.
- Bypassing Windows consent or security prompts.
- Hidden screen capture or hidden remote input.

## Repository Layout

```text
apps/
  agent-shell/     Non-native host/viewer protocol exerciser.
  relay/           WebSocket development relay.
packages/
  audit-log/       Shared development audit sinks.
  protocol/        Shared consent, session, and message schemas.
  windows-capture/ Windows-only one-shot capture adapter behind explicit visible grants.
  windows-input/   Windows-only input adapter boundary behind explicit visible grants.
docs/              Architecture, security, privacy, release, GitHub setup, roadmap, orchestration.
openspec/          Spec-driven planning source of truth.
```

Release and privacy gates:

- [Release readiness checklist](docs/release-checklist.md)
- [Bootstrap privacy notice](docs/privacy-notice.md)
- [Bootstrap threat model](docs/threat-model.md)

## Quick Start

```powershell
npm install
npm run check
npm test
npm run build
npm run openspec:validate
```

Or run the full local gate:

```powershell
npm run verify
```

`npm test` runs Vitest serially per test file with the forks worker pool. If a
Windows Vitest worker exits with the recognized transient IPC channel-closed
failure, the runner retries that test file once; ordinary test failures are not
retried.

The `@winbridge/windows-capture` package is a reviewed native boundary for MVP
host viewing. It performs no capture at import or construction time, requires an
explicit active visible `screen:view` grant, rejects non-Windows and
expired/disconnected/invisible grants before native calls, and returns a bounded
JPEG preview or PNG frame only to the immediate caller. The host agent shell can now opt into
this adapter with `--dev-screen-frame-source windows-capture`. The viewer agent
shell can opt into saving the latest authorized received frame to an explicit
local file with `--viewer-screen-frame-output` and can expose that file through
a loopback-only development viewer surface with `--viewer-control-surface-port`.

The `@winbridge/windows-input` package is a reviewed native boundary for
development host control. It performs no input at import or construction time,
requires Windows plus an active visible unexpired connected grant with the
matching `authorizationId` and `input:pointer` or `input:keyboard` permission,
normalizes one protocol-supported pointer or keyboard event into a bounded
native runner request, and sanitizes runner failures. The host agent shell can
opt into this adapter with `--host-apply-input true`, but only when a local
agent audit sink is configured.

Generate a reviewed visible-session MVP command sequence:

```powershell
npm run mvp:commands
```

Print the same non-executing command plan as bounded JSON for local automation:

```powershell
npm run mvp:commands -- --json
```

Print only the bounded preflight command plan as JSON:

```powershell
npm run mvp:commands -- --preflight-only --json
```

Print only one bounded text command block for the machine you are working on:

```powershell
npm run mvp:commands -- --only relay
npm run mvp:commands -- --only host
npm run mvp:commands -- --only viewer
npm run mvp:commands -- --only browser
npm run mvp:commands -- --only preflight
```

The command kit validates the session id, pairing code, relay URL, audit paths,
viewer frame path, loopback viewer surface port, and finite capture cadence,
then prints the `mvp:ready` preflight gate plus separate relay, host, viewer,
and browser steps. It does not start processes, open sockets, capture the
screen, apply input, write files, install services, configure startup
persistence, run unattended, elevate privileges, or bypass Windows prompts. The
`--only` filter is text-only, rejects unknown or incompatible values, and still
derives the selected block from the same fully validated non-executing plan. Do
not combine `--only` with `--generate-pairing`; print the full generated plan
once or pass the same explicit `--pairing` value to every role-filtered
command. The generated host command uses the interactive host consent prompt,
visible session state, metadata-only audit,
`--host-apply-input true`, finite Windows capture, and
`--host-control-prompt true`. Host controls start after approved active visible
authorization, so the host terminal can run `pause`, `resume`,
`revoke screen:view`, `revoke input:pointer`, `revoke input:keyboard`,
`terminate`, or `disconnect` immediately after approval.

By default the generated MVP host command uses a finite 10 minute frame stream.
Use `--capture-duration-minutes <1-16>` to choose another bounded duration, or
`--capture-count <frames>` when you need an exact finite frame count. Duration
and raw frame count are mutually exclusive, and the helper rejects combinations
that would exceed the supported finite stream bound.

The generated host and viewer commands include explicit display names for
clearer consent prompts. Use `--host-name "Assisted PC"` and
`--viewer-name "Support Viewer"` to customize those bounded labels. They are
development display metadata only, not production account authentication, and
the helper rejects blank, untrimmed, oversized, control-character,
format-control, or secret-bearing names before printing commands.

The generated viewer command also includes a bounded request reason shown in
the host consent prompt. Use
`--request-reason "Troubleshoot display settings"` to customize it. The reason
is consent context only and does not grant access; pairing, explicit host
approval, visible session state, permissions, revocation, and audit gates remain
authoritative.

The generated host and viewer commands also enable the existing development
signal readiness probe: the host command prints `--host-signal-probe-ack true`,
and the viewer command prints `--viewer-signal-probe-after-ms 1000`. Use
`--viewer-signal-probe-after-ms <0-2147483647>` to customize the bounded delay.
This probe is metadata-only readiness context after active visible `screen:view`
authorization; it does not grant access and does not send screen, input,
clipboard, file-transfer, diagnostic, SDP, or ICE payloads.

For a token-protected development relay, set the same local environment
variable in the relay, host, and viewer terminals, then print commands that
reference it without printing the token value:

```powershell
$env:WINBRIDGE_RELAY_SHARED_TOKEN = "dev-shared-token"
npm run mvp:commands -- --token-env WINBRIDGE_RELAY_SHARED_TOKEN
```

The command kit rejects raw `--token` values. Generated commands include the
pairing code and local file paths, so keep the output inside the trusted test
session. The default `logs\*.jsonl` and `frames\latest.jpg` parent directories
are created by the audit and frame-output runtime sinks on first authorized
write; the command kit itself still only prints commands and does not create
files or directories. The generated browser step is a visible PowerShell
`Start-Process 'http://127.0.0.1:<port>/'` command for the loopback viewer
surface; it also reminds the developer to wait for `frame=ready`, pointer
readiness, and the visible `Pointer Off/On` control before browser pointer
actions can send input.
It opens a browser only when the developer explicitly runs that printed command
on the viewer PC.

For a two-PC trial, do not use the default `ws://localhost:8787/` relay URL for
both machines. Rerun the command kit with the relay PC LAN IP or DNS name, for
example `npm run mvp:commands -- --relay-host 192.168.1.10`, which generates
`ws://192.168.1.10:8787/`. Use `--relay ws://<host>:<port>` when you need a
custom relay port or full URL. For non-loopback relay URLs, the printed relay
step explicitly sets
`WINBRIDGE_RELAY_BIND_HOST=0.0.0.0` so the development relay can accept LAN
connections. This is still an explicit development action; the command kit does
not probe IP addresses, open firewall ports, or start background services. Do
not use `0.0.0.0` as the `--relay` connection target for host/viewer commands;
the command kit accepts it only as the generated relay bind setting.

Check local MVP prerequisites on each Windows machine before a two-PC trial:

```powershell
npm run mvp:doctor
```

The doctor verifies Windows platform, supported Node.js version, required root
npm scripts, required root script alignment for the reviewed `dev:agent`,
`dev:relay`, and `mvp:smoke` workflows, required workspace package manifests,
and required MVP source entrypoints. Script-alignment failures use only the
bounded `script-misaligned` reason and do not echo script bodies or package JSON
content. It is read-only: it does not start relay, host, viewer, browser,
capture, input, sockets, HTTP listeners, services, startup persistence,
unattended access, privilege elevation, or Windows prompt bypass.

Check local native Windows prerequisites on the assisted Windows machine before
using the real capture/input MVP host path:

```powershell
npm run mvp:native-preflight
```

The native preflight is read-only. It checks Windows platform, bounded
PowerShell execution, capture prerequisite assembly/type availability, and input
wrapper compilation readiness. Each fixed PowerShell probe must emit only the
strict bounded JSON success marker `{ "ok": true }`; empty, malformed, false,
extra-field, non-object, array-shaped, or oversized probe output fails closed
with the probe's bounded reason code and is not echoed. It does not call
`CopyFromScreen`, call `SendInput`, start WinBridge processes, open sockets or
HTTP listeners, write files, launch a browser, install services, configure
startup persistence, elevate privileges, run unattended, or bypass Windows
prompts.

Run the local read-only readiness gate before a two-PC trial:

```powershell
npm run mvp:ready
```

`mvp:ready` runs `mvp:doctor`, `mvp:native-preflight`, a non-executing
localhost `mvp:commands -- --json` command-plan validation, and a
non-executing representative LAN command-plan validation, and a non-executing
shared-token command-plan validation sequentially. It also validates the
target-specific text outputs from `mvp:commands -- --only relay`, `host`,
`viewer`, `browser`, and `preflight`, so the per-machine operator blocks are
checked before a live trial. It then prints only bounded step status. The LAN
validation uses a fixed safe `--relay-host` value only to exercise the two-PC
command generator path; the token validation uses the fixed
`WINBRIDGE_RELAY_SHARED_TOKEN` environment variable name only to exercise the
token-protected command generator path. It does not detect local IP addresses,
probe ports, start processes, read token values, or open sockets. The LAN
validation also requires the non-executing relay command to use the reviewed
`WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'` setting without echoing the command. It
does not echo child output, filtered or generated command strings, pairing
codes, local URLs, paths, tokens, frame bytes, or input contents, and does not
run the local smoke workflow unless explicitly requested. For machine-readable
output:

```powershell
npm run mvp:ready -- --json
```

For a machine-specific local gate, use an explicit role. Relay readiness checks
the doctor and relay command block. Host readiness checks the doctor, native
Windows preflight, and host command block. Viewer readiness checks the doctor,
native Windows preflight, viewer command block, and browser command block. Role
mode is local and does not run smoke; `--include-smoke` is rejected with
`--role`.

```powershell
npm run mvp:ready -- --role relay
npm run mvp:ready -- --role host
npm run mvp:ready -- --role viewer
npm run mvp:ready -- --role viewer --json
```

To also run the bounded local static smoke workflow after the default readiness
checks pass, including the explicit LAN-style local relay smoke mode:

```powershell
npm run mvp:ready -- --include-smoke
```

For machine-readable readiness with the smoke subchecks included:

```powershell
npm run mvp:ready -- --json --include-smoke
```

The aggregate JSON keeps child output and generated command strings hidden and
may include fixed smoke subchecks for relay, host indicator, frame, surface,
signal, surface guard, input, audit, lifecycle, and viewer-disconnect readiness
for the default smoke and LAN-style smoke steps.

Run a bounded local MVP smoke check before a two-PC trial:

```powershell
npm run mvp:smoke
```

The smoke check builds the workspace, starts local relay, host, and viewer
development processes, uses explicit static host approval with
`--visible-session true`, publishes a static authorized frame to a temporary
viewer output file, verifies the loopback viewer surface and `/frame` endpoint,
verifies the host process emitted the bounded active visible host indicator
marker with a positive permission count,
verifies the sanitized viewer `/status` endpoint reports
`state=active`, `visibleToHost=true`, `signalProbeAckReceived=true`, and
bounded pointer/keyboard input readiness for the current consent-bound signal
readiness probe without raw authorization ids or permission arrays, verifies
that the local `/input` endpoint rejects fixed unsafe mutation requests with
missing token, foreign origin, and unsafe content type before accepted input
handling, submits one bounded pointer command and one bounded keyboard command
with explicit modifiers through the token-protected local `/input` path,
verifies that both configured host and viewer JSONL audit logs contain bounded
audit records, verifies that scheduled host revocation of `input:pointer` makes
a later pointer command fail closed through the same local `/input` path,
verifies that the token-protected local `/disconnect` path closes the viewer
side through the existing local surface route, and then stops the child
processes. The host indicator, signal readiness, audit, surface guard,
lifecycle, and viewer-disconnect checks are metadata-only. Successful JSON output may include a
fixed audit summary with host/viewer record counts, outcome counts, and coverage booleans
for expected smoke evidence such as consent, frame, input, and revocation. The
summary is read-only and does not print raw signal payloads, authorization ids,
event ids, actor ids, target ids, audit paths, raw audit contents, raw audit
actions, details, reasons, raw input commands, mutation tokens, or pairing
codes. It is a local preflight only: it does not use Windows capture, apply OS
input, launch a browser, install services, configure startup persistence, run
unattended, elevate privileges, or bypass Windows prompts.

For troubleshooting, run `npm run mvp:smoke -- --keep-artifacts` to retain the
temporary smoke work directory after the bounded local check. The retained
directory is for local inspection only; smoke diagnostics still avoid printing
frame bytes, mutation tokens, audit paths, raw audit contents, raw child output,
pairing codes, tokens, or input contents.

To exercise the smoke workflow with a LAN-style relay URL shape before a
two-PC trial, run:

```powershell
npm run mvp:smoke -- --lan-relay
```

This remains a same-machine local smoke check. It connects the smoke host and
viewer through `ws://127.0.0.1:<resolved-port>/` while preserving the same
static frames, visible host authorization, host indicator verification,
loopback viewer surface, bounded input endpoint checks, audit checks, and
cleanup behavior. It does not discover
LAN interfaces, connect to remote hosts, open firewall ports, use Windows
capture, apply OS input, launch a browser, install services, configure startup
persistence, run unattended, elevate privileges, or bypass Windows prompts.

Run the development relay:

```powershell
npm run dev:relay
```

Require a bounded local development shared token:

```powershell
$env:WINBRIDGE_RELAY_SHARED_TOKEN = "dev-shared-token"
npm run dev:relay
```

Omit `WINBRIDGE_RELAY_SHARED_TOKEN` for local development mode. Do not set it to an empty, whitespace-only, untrimmed, control-character, bidi/zero-width-control, or oversized value.
When a relay shared token is configured, pass the same bounded value to the agent shell with `--token`; do not embed relay tokens or credentials in `--relay` URLs.
Development shared-token values must be already trimmed, 1024 UTF-8 bytes or less, and must not contain ASCII control characters or Unicode bidi/zero-width formatting controls.
Direct development relay clients must present exactly one matching canonical lowercase `token` query parameter when a shared token is configured; missing, duplicate, case-variant, or wrong token parameters are rejected before session join.
When shared-token configuration is omitted, direct clients must also omit canonical and case-variant `token` query parameters; token-bearing connections are rejected before session join instead of being silently treated as authorized.

Configure the local relay port with an exact integer TCP port:

```powershell
$env:WINBRIDGE_RELAY_PORT = "8787"
npm run dev:relay
```

By default the development relay binds to `127.0.0.1`. For an explicit LAN MVP
trial, bind it to all IPv4 interfaces before running the relay:

```powershell
$env:WINBRIDGE_RELAY_BIND_HOST = "0.0.0.0"
npm run dev:relay
```

`WINBRIDGE_RELAY_BIND_HOST` accepts only `127.0.0.1`, `localhost`, or
`0.0.0.0`. Do not expose this development relay as an Internet-facing service;
pairing, optional shared-token configuration, protocol validation, and host
consent still apply, but production deployment hardening is not implemented.

Persist development relay audit records as JSONL:

```powershell
$env:WINBRIDGE_RELAY_AUDIT_LOG_PATH = "logs\\relay-audit.jsonl"
npm run dev:relay
```

Omit `WINBRIDGE_RELAY_AUDIT_LOG_PATH` to keep console audit output. Do not set it to an empty, whitespace-only, untrimmed, control-character, bidi/zero-width-control, oversized, Windows reserved device path value such as `NUL`, `CON`, `COM1`, or `LPT1`, Windows alternate data stream path value such as `logs\relay-audit.jsonl:hidden`, or Windows device namespace path value such as `\\.\pipe\relay-audit` or `\\?\C:\logs\relay-audit.jsonl`.
Relay audit attribution remains secret-safe: raw attempted protocol identifiers are omitted or redacted when they contain pairing codes or obvious token, credential, cookie, or key secret-marker families, including marker words separated by `.`, `_`, `-`, or `:`.

Development relay heartbeat is enabled by default. For local tuning:

```powershell
$env:WINBRIDGE_RELAY_HEARTBEAT_INTERVAL_MS = "30000"
$env:WINBRIDGE_RELAY_HEARTBEAT_TIMEOUT_MS = "10000"
npm run dev:relay
```

Set `WINBRIDGE_RELAY_HEARTBEAT_ENABLED=false` only for focused development tests that should not start heartbeat timers. The enabled flag must be exactly one of `true`, `false`, `yes`, `no`, `1`, or `0` with no leading or trailing whitespace.
Heartbeat interval and timeout values must be exact integer milliseconds from `1` through `2147483647`.

Development invalid-token and invalid-message rate limits use canonical exact integer env values with no leading zeros. Limits must be from `1` through `1000000`; windows must be exact milliseconds from `1000` through `2147483647`:

```powershell
$env:WINBRIDGE_RELAY_INVALID_TOKEN_LIMIT = "5"
$env:WINBRIDGE_RELAY_INVALID_TOKEN_WINDOW_MS = "60000"
$env:WINBRIDGE_RELAY_INVALID_MESSAGE_LIMIT = "5"
$env:WINBRIDGE_RELAY_INVALID_MESSAGE_WINDOW_MS = "60000"
npm run dev:relay
```

Development relay pairing tickets are host-created, hashed, expiring, and consumed by viewer joins:

```powershell
$env:WINBRIDGE_RELAY_PAIRING_TICKET_TTL_MS = "300000"
$env:WINBRIDGE_RELAY_PAIRING_TICKET_MAX_USES = "1"
npm run dev:relay
```

The host should join before the viewer. Pairing only admits a distinct viewer device to the relay room; it does not grant screen, input, clipboard, file, or diagnostic permissions.
Pairing ticket TTL values must be exact integer milliseconds from `0` through `86400000`; maximum uses must be an exact integer from `1` through `10`. Runtime-injected pairing settings are validated into an immutable snapshot before tickets are created.

In separate terminals, exercise the protocol:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456
npm run dev:agent -- viewer --session demo --pairing 123-456
```

Optional `--name` display values must be non-blank, already trimmed, at most 120 characters, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, and contain no secret-bearing metadata such as raw tokens, credentials, pairing codes, authorization headers, cookies, private keys, screen contents, clipboard contents, file-transfer contents, or diagnostics dumps.
Optional `--session`, `--peer`, and `--device` values are protocol identifiers for development metadata only; they must be syntactically valid and must not contain secret-bearing marker text such as tokens, credentials, cookies, keys, or authorization metadata. The agent creates one local device identity per runtime connection and includes it in both `join-session` and `hello` peer metadata; `hello.deviceIdentity.displayName` must match the top-level `hello` display name.
Viewer-only `--request` values must use exact comma-separated permission tokens with no spaces around entries, for example `screen:view,input:pointer`. Host invocations reject explicit `--request` before runtime startup.
Viewer-only `--request-reason` values may accompany a non-empty `--request` to explain the access request to the host. Request reasons must be non-blank, already trimmed, at most 240 characters, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, and contain no secret-bearing metadata such as raw tokens, credentials, pairing codes, authorization headers, cookies, private keys, screen contents, clipboard contents, file-transfer contents, or diagnostics dumps. Host invocations, unsafe reasons, and request reasons without requested permissions fail before runtime startup, relay connection, or protocol sends.
Optional host `--grant` values use the same exact permission-token format and can only narrow an approved host grant to a non-empty subset of the current viewer request.
Clipboard permissions `clipboard:read` and `clipboard:write` are intentionally rejected until a future OpenSpec change and security review define a consent-first clipboard capability.
File transfer permission `file-transfer` is intentionally rejected until a future OpenSpec change and security review define a consent-first file-transfer capability.
Diagnostics-shaped permission `diagnostics:view` is intentionally rejected until a future OpenSpec change and security review define a consent-first diagnostics capability.
Optional workflow reason values such as `--revoke-reason`, `--pause-reason`, `--resume-reason`, `--terminate-reason`, and `--disconnect-reason` must be non-blank, already trimmed, at most 240 characters, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, and contain no secret-bearing metadata such as raw tokens, credentials, pairing codes, authorization headers, cookies, private keys, screen contents, clipboard contents, file-transfer contents, or diagnostics dumps. `--disconnect-reason` is host-only and is additionally capped to 123 UTF-8 bytes so it fits WebSocket close reason metadata.
Host workflow options such as `--host-decision`, `--host-consent-prompt`, `--visible-session`, `--authorization-ttl-ms`, `--grant`, host lifecycle timers/reasons, host status/control options, and host signal acknowledgement are host-only. Viewer invocations reject those explicit options before runtime startup, including no-op values such as `--host-decision none`, `--host-consent-prompt false`, and `--visible-session false`.

Exercise the development consent workflow:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

To exercise a narrower development grant than the viewer requested:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --grant screen:view
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view,input:pointer
```

`--grant` is host-only and requires either `--host-decision approve` or `--host-consent-prompt true`. If omitted, approval grants the full request as before. If the configured grant contains an invalid, duplicate, empty, viewer-mode, deny/none-mode, or unrequested permission, the shell fails closed before approval, active state, control, signal, or workflow audit messages.

For a closer development consent loop, let the host terminal prompt for each request:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-consent-prompt true --visible-session true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view --request-reason "Troubleshoot display settings"
```

The prompt shows the host the observed viewer peer id, validated viewer display name when available, bounded viewer device id/platform metadata when a trusted viewer `hello` includes it, requested permission names, permission count, and the validated request reason or `unavailable` before accepting input. It does not display remote self-asserted `trustLevel` values as verified trust context. It accepts only exact `approve` or `deny` responses before the host consent timeout expires. Prompt mode defaults to a 60000 ms timeout; use `--host-consent-timeout-ms 30000` with `--host-consent-prompt true` to configure a shorter or longer bounded wait. Static `--host-decision approve|deny` remains for deterministic automation and is mutually exclusive with `--host-consent-prompt true`. The displayed viewer identity is development peer metadata, not production account authentication, and it does not grant permissions or bypass consent.

This baseline consent loop still does not capture the screen or send input. It only sends session authorization protocol messages and exposes local secret-safe host indicator events plus bounded viewer status snapshots for development UI wiring. Signaling payloads must be JSON-compatible objects; JavaScript-only values that JSON would drop or coerce are rejected before forwarding.

Exercise the consent-bound development signal path with a static viewer probe:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view --viewer-signal-probe-after-ms 1000
```

The viewer signal probe is viewer-only and requires an explicit `screen:view` request. It sends one static `signal` payload only after the viewer observes active visible `screen:view` authorization, includes bounded non-secret `kind=viewer-signal-probe` metadata, and uses the same runtime signal gates as tests. Pause, revoke, termination, expiration, local disconnect, remote disconnect, invisible approval, or missing `screen:view` prevents the probe before a local sent event or socket write. The probe does not include SDP, ICE candidates, user-provided JSON, screen contents, input, clipboard data, file-transfer data, diagnostics data, tokens, pairing codes, or display names.

For a static development round-trip check, opt the host into acknowledging trusted viewer probes:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --host-signal-probe-ack true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view --viewer-signal-probe-after-ms 1000
```

The host acknowledgement is host-only and defaults to off. It sends at most one static acknowledgement `signal` per authorization id, only after the inbound viewer probe has already passed runtime signal authorization gates. The acknowledgement uses the same public runtime send path as manual signals, so pause, revoke, termination, expiration, local disconnect, remote disconnect, missing recipient, routing mismatch, invisible approval, or missing `screen:view` fail closed before a local sent event or socket write. The acknowledgement payload contains only the current `authorizationId`, bounded non-secret `kind=host-signal-probe-ack` metadata, and a static marker; it does not include SDP, ICE candidates, user-provided JSON, screen contents, input, clipboard data, file-transfer data, diagnostics data, tokens, pairing codes, credentials, private reasons, or display names.

After a trusted host acknowledgement for the current active authorization, bounded viewer status may include `signalProbeAckReceived=true`. This status metadata is local and part of an immutable read-only viewer status snapshot: it does not expose raw signal payload markers, kind metadata, or contents, and does not grant signaling, capture, input, clipboard, file-transfer, diagnostics, reconnect, or host-control capability. The flag is omitted after authorization loss or local/remote disconnect.

Exercise the consent-bound development remote interaction message paths:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --dev-screen-frame-after-ms 1000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

`--dev-screen-frame-after-ms` is host-only. It waits until the host runtime has an active visible authorization with `screen:view`, then sends exactly one development `screen-frame` message. By default `--dev-screen-frame-source static` sends a tiny static PNG marker through `sendScreenFrame()`; optional `--dev-screen-frame-id`, `--dev-screen-frame-format`, `--dev-screen-frame-width`, `--dev-screen-frame-height`, and `--dev-screen-frame-data-base64` values are bounded and validated before runtime startup. The static source does not read files, capture the real screen, start a native Windows capture adapter, or expose raw frame bytes in events, logs, or audit records.

To exercise the Windows capture source on a Windows host:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --dev-screen-frame-after-ms 1000 --dev-screen-frame-source windows-capture
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

`--dev-screen-frame-source windows-capture` is host-only. It waits for active visible unexpired `screen:view` authorization, verified peer routing, open socket, connected viewer, and metadata-only local capture audit before invoking the Windows capture adapter. The captured JPEG preview or PNG frame then goes through the existing `sendScreenFrame()` authorization, routing, audit-before-send, socket, and redaction gates, so pause, revoke, expiration, disconnect, audit failure, adapter failure, or runtime rejection fails closed. Capture source rejects static payload options such as `--dev-screen-frame-data-base64`; it does not render a viewer desktop, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, bypass Windows prompts, or hide capture from the host.

To save the latest authorized received frame on the viewer side:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --dev-screen-frame-after-ms 1000 --dev-screen-frame-source windows-capture
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view --audit-log logs\viewer-audit.jsonl --viewer-screen-frame-output frames\latest.jpg
```

`--viewer-screen-frame-output` is viewer-only and requires both `--request screen:view` and local audit configuration through `--audit-log` or `WINBRIDGE_AGENT_AUDIT_LOG_PATH`. It overwrites the configured file with the latest authorized inbound PNG/JPEG frame only after the existing inbound sender, peer routing, authorization id, visible active unexpired status, and `screen:view` gates pass, and only after metadata-only output audit succeeds. Frame publication creates the configured output directory when needed, writes to a same-directory temporary file first, and then replaces the configured latest-frame path, so the local viewer surface observes either the previous complete frame or the new complete frame; failed directory creation or replacement fails closed, cleans the temporary file when possible, and leaves the previous frame in place. Runtime events, logs, status, and audit records continue to redact frame bytes and screen contents. The option does not render a desktop UI, capture the local screen, inject OS input, sync clipboard, transfer files, collect diagnostics, install services, configure startup persistence, elevate privileges, run unattended, bypass Windows prompts, or hide the host active-session indicator.

To use the local development viewer surface for MVP end-to-end checks:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-consent-prompt true --visible-session true --host-control-prompt true --audit-log logs\host-audit.jsonl --host-apply-input true --dev-screen-frame-after-ms 1000 --dev-screen-frame-source windows-capture --dev-screen-frame-count 100 --dev-screen-frame-interval-ms 1000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view,input:pointer,input:keyboard --audit-log logs\viewer-audit.jsonl --viewer-screen-frame-output frames\latest.jpg --viewer-control-surface-port 35987
```

Open `http://127.0.0.1:35987/` on the viewer machine. The page displays only
the latest authorized frame from the explicit output file. Visible input
controls stay disabled until the page has a ready displayed frame and sanitized
active visible viewer status with matching bounded input readiness metadata.
Browser pointer actions on the displayed frame are disabled by default and
require `input:pointer` readiness plus the visible `Pointer Off/On` control
before pointer movement, wheel, or button events can send input. Explicit key
buttons and modifier toggles require `input:keyboard` readiness. The manual
command box is available when at least one input readiness flag is true, but the
runtime still rejects commands whose exact permission is absent. The page
preloads replacement frames before swapping the displayed frame, so ordinary
refreshes do not disarm pointer control while a ready frame remains visible;
initial missing frames keep input controls disabled. The frame also suppresses
browser-native context menu and image drag defaults only on that frame.
Command-box input and browser pointer input use the same `sendInputEvent()`
path as the terminal viewer prompt. It also provides
explicit buttons for common keys such as Enter, Escape, Tab, Backspace, and
arrow navigation. Visible Shift, Ctrl, Alt, and Meta toggles can be applied to
one explicit key button press and are cleared after that attempted key press;
each click still sends one bounded key-down/key-up pair through the same
consent-bound input path. The surface is viewer-only, binds only to
`127.0.0.1`,
requires `--viewer-screen-frame-output`, clears any pre-existing latest-frame
file on startup, ignores same-directory temporary frame output files, and
rejects malformed ports before relay startup. Input and
disconnect POSTs require the generated local page's same-origin per-run token
before request bodies or authorization state are read. The local readiness gate
is only a UI affordance: token, origin, content-type, active visible
authorization, permission, routing, socket, audit, pause, revoke, termination,
expiration, disconnect, and redaction gates still run for every input POST.
Disconnect remains available even while input controls are not ready. It does
not expose a LAN/public server, read arbitrary files, capture keyboard input
outside the visible page, send modifier-only input, buffer typed text, create
macros, sync clipboard, transfer files,
install services, configure startup persistence, elevate privileges, run
unattended, hide the host indicator, or bypass Windows prompts. HTTP responses
and CLI diagnostics stay metadata-only and do not echo pointer coordinates,
buttons, key values, frame bytes, tokens, pairing codes, credentials, or private
reasons.

The viewer page also shows local frame freshness metadata such as
`frameAgeMs=<bucket>` and marks the displayed frame stale when no replacement
frame has loaded within the local threshold. This is browser-local readiness
metadata only; it is not a capture timestamp, does not grant permissions, and
does not expose frame paths, frame bytes, URLs, authorization ids, tokens,
pairing codes, or raw protocol data.

When the generated command plan enables the development signal probe, the local
viewer page may show `signalProbeAckReceived=true` in its status text after a
trusted host acknowledgement for the current active visible `screen:view`
authorization. That flag is readiness metadata only; it does not expose raw
signal payloads and does not grant input, capture, reconnect, clipboard,
file-transfer, diagnostics, or host-control capability.

To exercise bounded frame cadence on the same consent-bound path:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --dev-screen-frame-after-ms 1000 --dev-screen-frame-count 3 --dev-screen-frame-interval-ms 1000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

`--dev-screen-frame-count` and `--dev-screen-frame-interval-ms` make the host send a finite stream of static or Windows-captured development frames. Count must be an exact integer from `1` through `1000`; multi-frame streams require a positive exact interval. Each frame uses a deterministic derived frame id and increasing sequence. Static frames go through `sendScreenFrame()` authorization, routing, audit-before-send, and redaction gates. Windows-captured streams additionally wait for each async capture/send attempt to finish before scheduling the next frame and stop on authorization loss, disconnect, audit failure, adapter failure, runtime rejection, or local shutdown. This still does not read arbitrary frame files or render a viewer desktop.

Exercise a consent-bound development input message:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request input:pointer --dev-input-after-ms 1000 --dev-input-kind pointer-move --dev-pointer-x 0.5 --dev-pointer-y 0.5
```

`--dev-input-after-ms` is viewer-only and requires a matching requested permission: pointer events require `input:pointer`, and keyboard events require `input:keyboard`. It waits until the viewer runtime observes an active visible authorization, then sends exactly one development `input-event` message through `sendInputEvent()`. Pointer options are bounded normalized coordinates/buttons/wheel deltas; keyboard options are protocol-supported key names plus unique modifiers. This path does not inject OS input, bypass Windows prompts, capture keystrokes, accept arbitrary JSON, or expose raw input payloads in events, logs, or audit records.

To apply authorized development input on a Windows host, explicitly opt in on the
host and configure local audit:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --audit-log logs\host-audit.jsonl --host-apply-input true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request input:pointer --dev-input-after-ms 1000 --dev-input-kind pointer-move --dev-pointer-x 0.5 --dev-pointer-y 0.5
```

`--host-apply-input true` is host-only, disabled by default, and rejected without
`--audit-log` or `WINBRIDGE_AGENT_AUDIT_LOG_PATH`. The host writes
metadata-only input-application audit before invoking the Windows input adapter;
audit failure, stale authorization, pause, revoke, termination, expiration,
disconnect, wrong permission, or adapter failure blocks trusted success. Runtime
events, logs, and audit records still redact pointer coordinates, buttons, keys,
modifiers, raw input payloads, tokens, pairing codes, credentials, and private
reason text. This development path does not capture input, keylog, sync
clipboard, transfer files, install services, configure startup persistence,
elevate privileges, run unattended, hide the host indicator, or bypass Windows
prompts.

Use the development host control prompt to invoke immediate local controls from the host terminal:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-consent-prompt true --visible-session true --host-control-prompt true
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view,input:pointer
```

Host control prompt mode accepts exact commands: `help`, `status`, `pause`, `resume`, `revoke screen:view`, `revoke input:pointer`, `revoke input:keyboard`, `terminate`, and `disconnect`. It is host-only and mutually exclusive with `--host-status-after-ms`. When combined with `--host-consent-prompt true`, the consent prompt owns stdin first; the host control prompt starts only after an approved active visible authorization. `help` prints a static command list and does not read runtime status, send protocol messages, or invoke controls. `status` prints bounded local host status metadata such as indicator state, visibility, permission count, authorization id/status when available, optional viewer device id/platform bound when the active or paused authorization was approved, and optional `inactiveCause` after local host indicator deactivation; it does not send protocol messages, invoke controls, reconnect peers, expose private disconnect reason text, or display remote self-asserted `trustLevel` values as verified trust. Other commands call the same managed runtime controls as tests, so invisible sessions, expired grants, terminal sessions, disconnected peers, and missing permissions still fail closed before lifecycle protocol messages. After successful exact `terminate` or `disconnect`, the host control prompt stops locally so the terminal no longer presents an active control surface for the terminated or closed local session; failed attempts keep the prompt available with sanitized error output.

Print a bounded host-side local status snapshot once from the development CLI:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-status-after-ms 1000
```

`--host-status-after-ms` is host-only, accepts an exact integer delay from `0` through `2147483647`, and does not require requested permissions. It schedules an immutable read-only local status snapshot in the ordinary host runtime. The scheduled status read itself only reads local host status, including optional viewer device id/platform bound when the active or paused authorization was approved and optional `inactiveCause` after local host indicator deactivation. Viewer device status context is development metadata, not production account authentication, and it omits viewer peer id, viewer display name, and remote self-asserted `trustLevel`. Later same-peer `hello` metadata does not rewrite an already approved status context. Reading or attempting to mutate the returned snapshot does not add signaling, protocol messages, workflow audit events, permission grants, reconnects, private disconnect text exposure, capture, input, consent bypass, or host control invocation beyond the runtime startup and other explicit host workflow options already configured for that process.

Managed viewer runtimes also expose an immutable read-only `getViewerStatus()` local snapshot for future viewer UI wiring. It reports only bounded lifecycle metadata such as `state`, `visibleToHost`, `permissionCount`, optional authorization id/status, optional `signalProbeAckReceived=true` after a trusted current-authorization host signal acknowledgement, optional relay-defined `remoteDisconnectReasonCode` after trusted host disconnect, and optional local `localInactiveCause` after explicit viewer leave or local viewer socket close. After a trusted host disconnect notice, the snapshot reports inactive local state with `visibleToHost=false` and `permissionCount=0` while preserving optional authorization id/status metadata and the bounded disconnect reason code. After managed local viewer leave, the snapshot reports inactive local state with `visibleToHost=false`, `permissionCount=0`, and `localInactiveCause=local-leave`, and omits authorization id/status metadata from the left connection scope. After local viewer socket close without a trusted host disconnect, it reports inactive local state with `localInactiveCause=socket-closed` and omits stale authorization id/status metadata from the closed connection scope. It is viewer-only; reading or attempting to mutate the returned snapshot does not send protocol messages, emit workflow audit events, grant permissions, start signaling, reconnect peers, expose raw close reason text, invoke host controls, start capture, send input, or bypass consent workflows.

Print that bounded viewer-side local status snapshot from the development CLI:

```powershell
npm run dev:agent -- viewer --session demo --pairing 123-456 --viewer-status-after-ms 1000
```

`--viewer-status-after-ms` is viewer-only, accepts an exact integer delay from `0` through `2147483647`, and does not require requested permissions. It reads only local viewer status, including optional local inactive cause metadata after explicit viewer leave or local viewer socket close, and does not start signaling, send protocol messages, emit workflow audit events, grant permissions, reconnect peers, expose private disconnect text, or invoke host controls.

Use the development viewer control prompt for repeated local viewer status reads,
local viewer leave, or explicit one-event input commands after authorization:

```powershell
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view,input:pointer,input:keyboard --viewer-control-prompt true
```

Viewer control prompt mode accepts exact commands: `help`, `status`,
`disconnect`, `pointer-move <x> <y>`, `pointer-down <x> <y> <button>`,
`pointer-up <x> <y> <button>`, `pointer-wheel <x> <y> <deltaX> <deltaY>`,
`key-down <KeyName> [alt,control,meta,shift]`, and
`key-up <KeyName> [alt,control,meta,shift]`. It is viewer-only and mutually
exclusive with `--viewer-status-after-ms` and `--viewer-disconnect-after-ms`.
`help` prints a static command list and does not read runtime status, send
protocol messages, invoke viewer leave, or invoke host controls. `status`
prints the same bounded local viewer status snapshot as the one-shot status
helper, including optional `localInactiveCause` after explicit viewer leave or
local viewer socket close. `disconnect` invokes the managed viewer-only
`leave()` control and closes only the local viewer runtime; it does not send
forged `peer-disconnected`, lifecycle, signal, control, or workflow audit
messages, and it cannot invoke host controls. Input commands read current viewer
status and send exactly one `input-event` through `sendInputEvent()`, so active
visible authorization, permission, peer routing, socket, disconnect,
audit-before-send, and redaction gates still apply. Prompt output never echoes
raw command lines and does not expose pointer coordinates, buttons, keys,
modifiers, tokens, pairing codes, credentials, or private reasons. After a
successful exact `disconnect`, the viewer control prompt stops locally so the
terminal no longer presents an active control surface for the left viewer
session; failed disconnect or input attempts keep the prompt available with
sanitized error output.

Simulate a viewer leaving the session locally:

```powershell
npm run dev:agent -- viewer --session demo --pairing 123-456 --viewer-disconnect-after-ms 5000
```

`--viewer-disconnect-after-ms` is viewer-only, accepts an exact integer delay from `0` through `2147483647`, and does not require requested permissions or active authorization. It invokes the managed viewer-only `leave()` control and closes only the local viewer runtime; host runtimes reject this control without closing the host transport. The viewer does not send forged `peer-disconnected`, lifecycle, signal, control, or workflow audit messages. The relay observes the socket close and notifies the remaining host.

Persist development host workflow audit records as JSONL:

```powershell
$env:WINBRIDGE_AGENT_AUDIT_LOG_PATH = "logs\\agent-audit.jsonl"
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true
```

The same path can be passed with `--audit-log logs\\agent-audit.jsonl`. Agent audit files record only secret-safe workflow audit metadata; they do not store raw protocol payloads, screen contents, input, or private reason text. The file audit sink creates the configured parent directory on first write for safe paths such as `logs\\agent-audit.jsonl`; creation or append failures are surfaced instead of falling back silently. Audit action, reason, target type, and detail key metadata must be bounded, trimmed where applicable, and free of control or bidi/zero-width formatting controls. Viewer frame output requires this local audit configuration; the explicit output image file contains the authorized frame bytes, while the audit file remains metadata-only.
Omit `WINBRIDGE_AGENT_AUDIT_LOG_PATH` and `--audit-log` to skip local agent audit file persistence. Do not set either audit path to an empty, whitespace-only, untrimmed, control-character, bidi/zero-width-control, oversized, Windows reserved device path value such as `NUL`, `CON`, `COM1`, or `LPT1`, Windows alternate data stream path value such as `logs\agent-audit.jsonl:hidden`, or Windows device namespace path value such as `\\.\pipe\agent-audit` or `\\?\C:\logs\agent-audit.jsonl`.

Use a short development authorization TTL:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --authorization-ttl-ms 30000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

Authorization TTL values must be exact positive integer milliseconds from `1` through `2147483647`.
Lifecycle workflow timer values such as pause, resume, revoke, terminate, and disconnect delays must be exact integer milliseconds from `0` through `2147483647`.

Expiration simulation sends protocol state, local host indicator, and audit messages only.

Simulate host pause/resume during development:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --pause-after-ms 5000 --resume-after-ms 5000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

Pause/resume simulation only sends protocol state, control, local host indicator, and audit messages. It does not perform remote actions.

Simulate host revocation during development:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --revoke-after-ms 5000 --revoke-permission screen:view
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

Revocation simulation sends bound protocol control, notification, state, local host indicator, and audit messages only; it does not perform remote actions. Viewer-side authorization remains fail-closed after revocation: later stale lifecycle messages for the same authorization id cannot restore the revoked `screen:view` permission, and terminal authorization ids cannot be reopened by approved decision replay for the same id. A different authorization id from the observed host starts a new consent scope; the previous revocation floor does not remove or restore permissions for that new authorization.

Simulate host session termination during development:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --terminate-after-ms 5000
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

Termination simulation only sends protocol and local host indicator messages; it does not capture the screen, send input, or install any background service.

Simulate host local disconnect during development:

```powershell
npm run dev:agent -- host --session demo --pairing 123-456 --host-decision approve --visible-session true --disconnect-after-ms 5000 --disconnect-reason "Host closed session"
npm run dev:agent -- viewer --session demo --pairing 123-456 --request screen:view
```

Disconnect simulation closes the host relay connection after visible activation and deactivates the local host indicator. The optional disconnect reason is local close metadata only; runtime events redact the text and audit records keep only bounded lifecycle details. The host does not send forged disconnect notices; the relay observes the close and sends `peer-disconnected` to the viewer.

## OpenSpec

Use OpenSpec for behavior changes:

```powershell
npx --yes @fission-ai/openspec@latest list
npx --yes @fission-ai/openspec@latest validate --all --strict --no-interactive
```

Important specs live in `openspec/specs/` after completed changes are archived.

## GitHub

This repo includes GitHub Actions and templates. CI runs verification on Windows with Node `20.19.0` and Node `24`. See `docs/github-setup.md` for remote setup commands and project bootstrap steps.
