## MODIFIED Requirements

### Requirement: MVP session smoke check verifies the local static workflow

The project SHALL provide a root development smoke check that starts a bounded
local relay, host, and viewer session through the existing CLI entrypoints,
using static development frames and explicit visible host authorization. The
host CLI child process SHALL emit a bounded visible active-session indicator
marker that the smoke check can observe in captured child output. The smoke
check SHALL verify that this host indicator marker is active, visible to the
host, and has a positive permission count before continuing to frame, surface,
signal, input, audit, and lifecycle checks. The smoke check SHALL verify that
the viewer publishes a latest-frame file for the current run, that the loopback
viewer surface serves both the generated HTML and current frame endpoint, that
the loopback viewer status endpoint reports the bounded host acknowledgement
readiness flag `signalProbeAckReceived=true` for the current consent-bound
signal probe, that the loopback viewer surface rejects fixed unsafe local
mutation requests for missing token, foreign origin, and unsafe content type
before input acceptance, that the loopback viewer surface accepts one bounded
pointer command and one bounded keyboard command with explicit modifiers
through its token-protected local `/input` path, and that both configured host
and viewer local JSONL audit files contain bounded schema-like audit records
for the smoke run. The smoke check MUST stop all child processes after success,
failure, timeout, or interrupt. By default, it SHALL remove the temporary smoke
work directory before exit. When the developer explicitly passes
`--keep-artifacts`, the smoke check SHALL retain the smoke work directory and
print bounded metadata identifying that directory on success. When invoked with
`--json`, the smoke check SHALL emit bounded machine-readable result metadata
containing only `ok`, optional safe reason codes, per-check bounded status
records, artifact cleanup state, and the retained artifact directory only when
explicitly requested with `--keep-artifacts`. It MUST NOT invoke Windows
capture, apply OS input, launch a browser, install services, configure startup
persistence, run unattended, elevate privileges, collect credentials, read
clipboard data, transfer files, collect diagnostics dumps, evade AV/EDR, bypass
Windows prompts, or hide the host visible-session state.

#### Scenario: Smoke check observes CLI-visible host indicator

- **WHEN** a developer runs the root MVP smoke check with default options
- **THEN** the host CLI child output includes a bounded
  `[winbridge-agent] host indicator` marker for the active visible session
- **AND** the smoke check verifies that marker before frame, surface, signal,
  input, audit, and lifecycle checks
- **AND** the marker and smoke diagnostics MUST NOT expose raw protocol
  payloads, tokens, pairing codes, credentials, private reasons, screen
  contents, input contents, clipboard contents, file-transfer contents,
  diagnostics dumps, or full secrets

#### Scenario: Smoke check verifies local surface mutation guards

- **WHEN** the smoke workflow has verified the loopback viewer surface and
  extracted the bounded per-run mutation token
- **THEN** it posts fixed negative input requests for missing token, foreign
  origin, and unsafe content type
- **AND** each request is rejected before accepted input handling
- **AND** the smoke helper reports only the fixed `surface-guards` subcheck
  metadata
- **AND** diagnostics MUST NOT expose mutation tokens, origins, URLs, ports,
  response bodies, raw input commands, authorization ids, child output, pairing
  codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Surface guard failure fails closed

- **WHEN** any fixed surface guard probe is accepted, times out, or returns an
  unexpected unsafe result
- **THEN** the smoke helper exits non-zero with a bounded
  `surface-guards-not-ready` reason
- **AND** it stops any started child processes before returning control
- **AND** diagnostics MUST NOT expose mutation tokens, origins, URLs, ports,
  response bodies, raw input commands, authorization ids, child output, pairing
  codes, credentials, screen contents, input contents, or full secrets

#### Scenario: Ready helper accepts fixed surface guard subcheck

- **WHEN** `npm run mvp:ready -- --include-smoke --json` consumes bounded
  smoke JSON containing the fixed `surface-guards` subcheck
- **THEN** the ready helper accepts and reports that fixed subcheck for both
  default smoke and LAN-style smoke when included
- **AND** malformed, missing, duplicate, or unexpected surface guard subcheck
  metadata fails closed without exposing unsafe values
