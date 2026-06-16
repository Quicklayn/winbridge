# windows-screen-capture Specification

## Purpose
TBD - created by archiving change add-windows-screen-capture-adapter. Update Purpose after archive.
## Requirements
### Requirement: Windows screen capture requires visible consent grant

The Windows screen capture adapter SHALL invoke native capture only when the
caller provides an active visible capture grant that includes a valid
authorization id, `screen:view` permission, visible host indicator state,
connected peer state, and a Windows platform context. The adapter MUST reject
missing, inactive, invisible, permissionless, disconnected, expired, non-Windows,
or malformed grants before invoking a native command runner.

#### Scenario: Capture runs with active visible grant
- **WHEN** the adapter is called on Windows with an active visible unexpired grant that includes `screen:view` and a connected peer
- **THEN** it invokes the native command runner exactly once
- **AND** it returns a bounded PNG frame with width, height, captured timestamp, byte length, and base64 data

#### Scenario: Capture lacks visible grant
- **WHEN** the adapter is called with a missing, inactive, invisible, expired, permissionless, disconnected, malformed, or non-Windows grant
- **THEN** it fails before invoking native capture, writing files, sending protocol messages, emitting audit records, logging screen contents, hiding the session, or bypassing consent

#### Scenario: Capture is attempted on non-Windows platform
- **WHEN** the adapter is called with a platform context other than Windows
- **THEN** it rejects before invoking PowerShell, native APIs, protocol sends, file writes, service behavior, startup persistence, elevation, or prompt bypass

### Requirement: Windows screen capture output is bounded and metadata-safe

The Windows screen capture adapter SHALL validate native capture output before
returning it. Output MUST be PNG-only, width and height MUST be positive bounded
integers, encoded payload size MUST stay within the configured frame byte limit,
and diagnostics MUST NOT expose raw frame bytes, encoded frame data, screenshots,
screen contents, credentials, tokens, pairing codes, private reasons, or full
secrets.

#### Scenario: Native runner returns malformed output
- **WHEN** the native command runner returns invalid JSON, unsupported format, invalid dimensions, invalid base64, empty image data, or oversized image data
- **THEN** the adapter rejects before returning a frame, writing files, sending protocol messages, hiding the session, or exposing raw screen contents in diagnostics

#### Scenario: Native runner fails
- **WHEN** the native command runner fails, times out, or reports an error
- **THEN** the adapter reports only bounded generic failure metadata
- **AND** it MUST NOT expose raw command output, screenshots, screen contents, credentials, tokens, pairing codes, private reasons, or full secrets

### Requirement: Windows screen capture adapter remains non-authorizing

The Windows screen capture adapter SHALL remain a capture primitive only. It
MUST NOT approve sessions, grant permissions, activate host visibility, connect
to the relay, send protocol messages, start continuous streaming, render viewer
UI, inject input, sync clipboard, transfer files, collect diagnostics, install
services, configure startup persistence, elevate privileges, run unattended,
collect credentials, keylog, evade AV/EDR, bypass Windows prompts, or hide
capture from the host.

#### Scenario: Adapter is imported or constructed
- **WHEN** application code imports the package or constructs an adapter
- **THEN** no native capture, protocol send, audit write, service action, startup action, elevation, input, clipboard, file, diagnostic, or credential collection side effect occurs

#### Scenario: Capture succeeds
- **WHEN** an explicit one-shot capture succeeds
- **THEN** the adapter returns the captured frame to the immediate caller only
- **AND** it MUST NOT start a loop, reconnect peers, send the frame, persist the frame, render a viewer, inject input, alter host controls, or bypass revocation
