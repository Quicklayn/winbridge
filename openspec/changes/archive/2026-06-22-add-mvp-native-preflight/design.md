# Design

## CLI

Create `scripts/mvp-native-preflight.mjs` and expose it as
`npm run mvp:native-preflight`.

The command supports only `--help`; successful default execution prints bounded
readiness lines:

- `WinBridge MVP native preflight passed.`
- `platform=windows`
- `powershell=ok`
- `capture-prerequisites=ok`
- `input-prerequisites=ok`
- `safety=read-only-no-capture-no-input`

Failures print `WinBridge MVP native preflight failed. reason=<code>` and exit
non-zero. Reason codes are bounded:

- `unsupported-platform`
- `powershell-unavailable`
- `capture-prerequisite-unavailable`
- `input-prerequisite-unavailable`

## Checks

The runner is dependency-injected for tests. Production checks use
`execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script])`
with a bounded timeout and output buffer.

The PowerShell availability check runs a fixed no-op command. The capture
prerequisite check loads `System.Windows.Forms` and `System.Drawing` and verifies
the expected type names can be resolved. It does not read `Screen.PrimaryScreen`
or call `CopyFromScreen`.

The input prerequisite check compiles a minimal fixed `SendInput` wrapper type
with `DllImport("user32.dll")`, but it does not instantiate input events or call
`SendInput`.

## Security Review

Because this touches native Windows boundaries, implementation must include an
explicit review against the project safety invariants:

- no capture invocation
- no input invocation
- no raw diagnostic leakage
- no networking, services, startup persistence, elevation, unattended behavior,
  evasion, or prompt bypass
