## Context

The current MVP transport can validate and forward `screen-frame` messages, and
the agent shell can exercise static development frames after active visible
authorization. It intentionally does not capture the real Windows desktop. MVP
remote viewing needs a native host capture primitive, but that primitive must be
isolated, opt-in, testable, and unable to create hidden sessions or unattended
behavior by itself.

## Goals / Non-Goals

**Goals:**

- Add a `packages/windows-capture` workspace package that exposes a small
  TypeScript API for one explicit screen capture.
- Require an explicit capture grant object with active authorization,
  `screen:view`, visible host indicator state, and a connected peer before
  invoking the native command runner.
- Use Windows built-in PowerShell/.NET APIs to capture a PNG without adding
  native build dependencies in this bootstrap stage.
- Bound capture dimensions, encoded payload size, command timeout, and
  diagnostics.
- Test safety and parsing behavior with a mocked command runner.

**Non-Goals:**

- No CLI integration, continuous streaming integration, viewer rendering, input
  injection, clipboard, file transfer, diagnostics collection, service,
  installer, startup persistence, elevation, unattended access, AV/EDR evasion,
  Windows prompt bypass, or hidden capture.
- No production-quality low-latency capture pipeline or WebRTC media encoding.
- No capture on non-Windows platforms.

## Decisions

1. Create a separate workspace package.

   Rationale: capture is a high-risk native boundary and should not be embedded
   directly into `apps/agent-shell`. A package boundary keeps the API small and
   lets later host runtime integration depend on explicit grant checks.

   Alternative considered: add capture helpers directly to agent-shell. Rejected
   because it mixes native behavior with consent workflow code and makes later
   review harder.

2. Require a caller-provided capture grant.

   The adapter will accept a `WindowsScreenCaptureGrant` that must include active
   authorization status, visible host state, `screen:view`, connected peer state,
   and an authorization id. The adapter does not approve sessions or inspect
   runtime internals; it fails closed unless the caller proves that the runtime
   already has a valid visible consent state.

   Alternative considered: let the adapter call runtime APIs directly. Rejected
   because it would couple a native utility package to agent-shell internals.

3. Use an injectable native command runner.

   The default runner will call `powershell.exe` with `-NoProfile`,
   `-NonInteractive`, and a fixed inline script that captures the primary screen
   to PNG bytes. Tests use an injected runner, so CI does not need to capture the
   real desktop.

   Alternative considered: add a native addon or external screenshot package.
   Rejected for this bootstrap because it adds supply-chain and build complexity
   before the UI/control plane is ready.

4. Return screen bytes only through the explicit capture result.

   The package will not log frame bytes, write files, persist images, or expose
   raw screen content in error messages. Returned bytes are necessary for remote
   viewing, but diagnostics remain metadata-only.

## Risks / Trade-offs

- Windows PowerShell capture can be slower than native DirectX/Desktop
  Duplication capture -> acceptable for an MVP bootstrap adapter; later media
  work can replace the runner behind the same grant boundary.
- Returning PNG bytes exposes screen contents to the immediate caller -> caller
  must already hold an active visible `screen:view` grant, and no logging or file
  persistence is added.
- Screen capture may fail on locked desktops, headless sessions, or restricted
  Windows environments -> adapter reports bounded generic errors and does not
  retry or bypass prompts.
- The adapter is not yet wired into the agent runtime -> this keeps the native
  capability reviewable; a later OpenSpec change must connect it to consent-bound
  streaming.
