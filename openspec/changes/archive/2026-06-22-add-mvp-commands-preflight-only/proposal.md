# Proposal: Add MVP Commands Preflight-Only Output

## Summary

Add a `--preflight-only` mode to the root MVP session command kit so a developer
can print only the bounded readiness commands needed before a two-PC trial.

## Motivation

The default command kit intentionally prints a complete visible-session command
sequence. During readiness checks, developers also need a smaller output that
does not include runnable relay, host, viewer, or browser steps. A dedicated
preflight-only mode makes that workflow harder to misuse and easier to verify.

## Scope

- Parse `--preflight-only` as a flag-only command kit mode.
- Print only `mvp:doctor`, `mvp:native-preflight`, `mvp:smoke`, and bounded
  safety notes in that mode.
- Preserve the existing default command kit output and validation behavior.
- Add focused tests and OpenSpec validation.

## Safety Impact

This change is development-scoped and non-executing. It prints fewer commands
than the existing helper and does not add capture, input, auth, relay, browser,
installer, startup, service, token, log, privilege, persistence, or native
Windows behavior. The output must explicitly state that commands are printed
only and that host consent and visible sessions remain required for actual MVP
trials.

## Non-Goals

- Do not start, orchestrate, or validate live sessions.
- Do not add hidden sessions, unattended access, stealth, credential access,
  keylogging, AV/EDR evasion, Windows prompt bypass, services, startup
  persistence, or privilege elevation.
- Do not change relay, host, viewer, smoke, doctor, or native preflight runtime
  behavior.
