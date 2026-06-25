## Context

`mvp:native-preflight` executes three fixed, read-only PowerShell probes on
Windows: shell availability, capture prerequisites, and input wrapper
compilation prerequisites. Each probe already emits compressed JSON success
metadata, but the Node helper currently treats process exit success as
sufficient and ignores stdout.

## Goals / Non-Goals

**Goals:**

- Parse each PowerShell probe stdout as bounded JSON.
- Accept only an object whose sole field is `ok: true`.
- Fail the corresponding probe with its existing bounded reason code when the
  output is empty, malformed, false, oversized, non-object, array-shaped, or
  has any extra field.
- Keep CLI output and aggregate JSON output free of raw probe stdout and
  exceptions.

**Non-Goals:**

- No new PowerShell probe scripts.
- No native screen capture or OS input invocation.
- No network, relay, host, viewer, browser, service, startup, installer,
  privilege elevation, clipboard, file transfer, diagnostics, or unattended
  behavior.
- No new dependency.

## Decisions

- Validate stdout in `runPowerShellPreflightScript()` so production CLI behavior
  and tests that inject `runPowerShell` can share the same success contract.
- Use a small local parser instead of a JSON schema dependency. The accepted
  shape is intentionally tiny: top-level object, exactly one property, and
  `ok === true`.
- Preserve the existing public failure reason mapping. A malformed success
  marker for the capture probe still reports
  `capture-prerequisite-unavailable`, and malformed output is never echoed.

## Risks / Trade-offs

- Stricter output parsing may fail on machines where PowerShell emits extra
  stdout noise before the JSON marker. Mitigation: fail closed with bounded
  diagnostics; these probes are fixed internal scripts and should remain quiet.
- The parser does not preserve raw parse details. Mitigation: this is
  intentional to avoid leaking local paths, secrets, or PowerShell diagnostics
  through readiness output.
