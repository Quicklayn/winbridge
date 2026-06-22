# Change: add-mvp-native-preflight

## Why

The MVP command flow can now exercise a local static smoke check and print a
two-PC relay/host/viewer sequence, but it does not provide a read-only check for
native Windows prerequisites needed by the real MVP host path. A developer can
reach the two-PC trial and only then discover that PowerShell, screen-capture
assemblies, or the input runner type cannot be loaded on the assisted Windows
machine.

## What Changes

Add a root `npm run mvp:native-preflight` command that validates native Windows
prerequisites without starting WinBridge processes or invoking capture/input
side effects. The preflight checks Windows platform, bounded PowerShell
execution, loading capture-related .NET assemblies, and compiling the
SendInput wrapper type without calling `CopyFromScreen` or `SendInput`.

Update the MVP command kit and README to include this read-only preflight before
the two-PC trial.

## Safety Impact

The preflight is local and read-only. It MUST NOT start relay, host, viewer,
browser, sockets, HTTP listeners, capture, input, services, startup persistence,
unattended behavior, privilege elevation, clipboard, file transfer, diagnostics
dumps, AV/EDR evasion, Windows prompt bypass, or hidden session behavior.

Diagnostics are bounded reason codes only. They MUST NOT echo raw PowerShell
output, local file paths, tokens, pairing codes, credentials, screen contents,
input contents, keystrokes, private reason text, or full secrets.

## Non-Goals

- No actual screen capture.
- No actual OS input application.
- No arbitrary PowerShell script execution.
- No production installer or service validation.
- No network, relay, host, viewer, or browser startup.
