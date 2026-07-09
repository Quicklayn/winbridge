## Context

WinBridge already has a command kit (`mvp:commands`) that prints reviewed two-PC command blocks and a foreground role runner (`mvp:run`) that starts exactly one relay, host, or viewer role when the operator supplies explicit session, pairing, relay target, token environment reference, and `--i-understand-foreground`.

The trial helper (`mvp:trial`) is the higher-level non-executing operator checklist. It currently points to `mvp:commands` and LAN probes, but it does not include direct `mvp:run` templates. That leaves operators to translate from command-kit output to the foreground role runner during a real MVP trial.

## Goals / Non-Goals

**Goals:**

- Add fixed relay, host, and viewer `mvp:run` template steps to `mvp:trial`.
- Keep all runner templates non-executing and placeholder-based.
- Reuse the existing relay-host substitution guard so `--relay-host 192.168.1.10` updates the fixed templates without printing relay URLs.
- Make `mvp:ready` accept only the exact reviewed trial-plan shape, including the runner templates.
- Preserve secret-safe output: no raw relay URLs, generated pairing codes, token values, local URLs, local paths, stdout, stderr, frame bytes, input contents, or audit records.

**Non-Goals:**

- No automatic process orchestration, background process manager, browser launch, or shell execution.
- No production viewer UI or production host UI.
- No changes to capture, input, authorization, audit persistence, installer, services, startup, firewall, privilege elevation, or relay transport behavior.
- No unattended or hidden-session access.

## Decisions

1. Add templates to `mvp:trial` rather than changing `mvp:commands`.

   `mvp:commands` already prints detailed role commands and browser guidance. The trial helper is the operator workflow entrypoint, so putting concise `mvp:run` references there makes the live path visible without expanding the command kit surface.

2. Use placeholders for session and pairing values.

   The plan must remain safe to print, commit into logs, and validate. Concrete session ids and pairing codes come from the existing bootstrap command at runtime and must not be embedded in reviewed trial output.

3. Require `--token-env WINBRIDGE_RELAY_SHARED_TOKEN` and `--i-understand-foreground` in every runner template.

   The token-env reference aligns with the current relay/host/viewer token handling without exposing raw token values. The foreground acknowledgement keeps the operator launch path visible and explicit.

4. Keep readiness validation exact.

   `mvp:ready` should fail closed if the trial helper silently drops a runner step, changes a role, prints an unsafe relay URL, or removes the foreground acknowledgement.

## Risks / Trade-offs

- Template drift between `mvp:trial`, `mvp:ready`, and tests -> Mitigation: central tests assert the exact reviewed role sections and readiness rejects mutated plans.
- Operators may still need to substitute placeholders manually -> Mitigation: the trial plan references the existing session bootstrap step and documents that placeholders come from the generated bootstrap values.
- More text in trial output -> Mitigation: add one concise `run-role` step per live role only.
