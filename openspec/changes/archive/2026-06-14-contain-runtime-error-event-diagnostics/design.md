## Context

The managed agent shell reports startup, socket, and runtime failures through sanitized local events and bounded logs. The primary `reportRuntimeError` path currently prepares a sanitized runtime error event and already contains diagnostic logger failures, but the diagnostic event callback itself can still throw before the logger path runs and before a direct host control rethrows the intended sanitized runtime error.

This change is limited to local diagnostic containment for the non-native development agent shell. It does not add remote access capabilities or alter relay/protocol contracts.

## Goals / Non-Goals

**Goals:**

- Contain diagnostic event callback failures emitted while reporting sanitized runtime errors.
- Preserve direct host control fail-closed semantics when required audit persistence fails.
- Keep runtime diagnostics bounded and secret-safe.
- Add a focused regression test for the direct pause audit-failure path with a throwing diagnostic event callback.

**Non-Goals:**

- No capture, input, clipboard, file transfer, diagnostics content transfer, reconnect, installer, startup persistence, service, privilege elevation, token format, native Windows API, or relay changes.
- No hidden sessions, stealth behavior, credential access, keylogging, AV/EDR evasion, Windows prompt bypass, or consent bypass.
- No broader redesign of the runtime event pipeline.

## Decisions

- Wrap the `options.onEvent` call inside `reportRuntimeError` with a local `try/catch`.
  - Rationale: this is the smallest containment point shared by direct host controls and other primary runtime error paths.
  - Alternative considered: switch all callers to `reportRuntimeErrorBestEffort`. That would blur the distinction between paths that intentionally throw sanitized errors and cleanup paths that should never throw.
- Keep the logger call after the event callback attempt.
  - Rationale: if the local event callback fails, bounded logging should still be attempted for observability.
  - Alternative considered: return immediately after callback failure. That would reduce observability without improving security.
- Test a direct host pause audit persistence failure with a diagnostic event callback that records the sanitized event and then throws raw callback text.
  - Rationale: the test proves both that the callback failure is contained and that raw audit/callback text does not leak through events or logs.

## Risks / Trade-offs

- Diagnostic event callback bugs can hide the local runtime error event from that callback's downstream consumer. -> The runtime still attempts bounded logging and preserves fail-closed control behavior.
- A broad catch can mask programming mistakes in local test callbacks. -> The catch is restricted to diagnostic reporting after a sanitized runtime error has already been prepared; protocol send, authorization, audit persistence, and lifecycle gates remain outside this catch.
