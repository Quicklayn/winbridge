## Context

`mvp:commands` can already generate a pairing code for the full command plan,
but it still defaults to the shared `demo` session id and rejects generated
metadata in role-filtered output. `mvp:trial` also prints role references with
placeholders, so operators have to remember to run one full generated plan
before preparing individual machines.

## Goals / Non-Goals

**Goals:**

- Add a reviewed full-plan `--generate-session` option.
- Keep generated session ids valid protocol identifiers and non-secret.
- Surface one full-plan bootstrap reference from `mvp:trial`.
- Keep role-filtered and preflight-only outputs deterministic and explicit.

**Non-Goals:**

- No process runner, terminal launcher, relay connection, LAN discovery, or
  browser automation.
- No production pairing lifecycle, account auth, token generation, token
  printing, or secret exchange.
- No change to consent, capture, input, audit write, installer, startup,
  service, or privilege behavior.

## Decisions

1. Add `--generate-session` instead of changing the default.

   Rationale: existing tests and local examples may depend on stable defaults.
   The real-trial path becomes explicit through `mvp:trial` bootstrap while
   deterministic examples remain available.

2. Reject generated metadata in role-filtered and preflight-only output.

   Rationale: each role must use the same session and pairing values from one
   coordinated full plan. Letting each machine generate independently would
   make the trial fail or tempt operators to retry unsafe ad hoc values.

3. Print a command reference in `mvp:trial`, not generated values.

   Rationale: the trial helper is a bounded non-executing plan surface. It can
   tell operators which reviewed bootstrap command to run without printing
   relay URLs, token values, concrete pairing codes, local URLs, or runtime
   commands.

## Risks / Trade-offs

- Operators may still use defaults directly -> README and trial output will
  make the generated bootstrap command the recommended live-trial starting
  point.
- Generated session ids could be mistaken for authentication -> docs and
  wording will call them coordination metadata only; relay token and host
  consent remain separate.
- More trial text -> one fixed bootstrap step is added to the existing
  preflight section.
