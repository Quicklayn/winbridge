## Context

`apps/agent-shell` is a non-native protocol exerciser. Host-side approval is currently controlled by `hostDecision`/`--host-decision`, so a dev host can only preselect approve, deny, or no action before a viewer request arrives. Real remote assistance needs explicit host consent at request time, but native Windows UI, capture, and input remain future work.

## Goals / Non-Goals

**Goals:**

- Add an opt-in interactive prompt path for host approval or denial.
- Keep the static host-decision path unchanged for deterministic automation and tests.
- Reuse the existing host workflow for audit-before-send, visible activation, indicator events, and lifecycle simulations after a decision is resolved.
- Fail closed on prompt cancellation, prompt I/O failure, non-host role usage, non-interactive configuration mistakes, or invalid prompt results.
- Keep prompt output and runtime diagnostics secret-safe.

**Non-Goals:**

- No native Windows consent UI, tray indicator, capture, input, clipboard, file transfer, installer, service, startup persistence, or privilege elevation.
- No production account identity, MFA, or durable authorization store.
- No relay protocol changes.

## Decisions

1. Add a runtime-level `hostDecisionProvider` callback rather than embedding stdin in `runtime.ts`.
   - Rationale: runtime tests can inject deterministic decisions, and CLI I/O stays in the CLI boundary.
   - Alternative considered: read directly from stdin inside `handleHostAuthorizationRequest`. Rejected because it couples protocol tests to process I/O and makes failure handling harder to cover.

2. Treat prompt decisions as a replacement for static `hostDecision`, not an additional authority.
   - Rationale: exactly one host decision source is easier to reason about and prevents accidental auto-approval plus prompt approval conflicts.
   - Alternative considered: let prompt override any static value. Rejected because explicit automation flags should stay deterministic and mutually exclusive with interactive consent.

3. Reuse the existing approval/denial send path after the decision is resolved.
   - Rationale: existing audit persistence, visible-session gating, indicator, expiration, pause/resume, revoke, terminate, and disconnect behavior should remain identical across static and interactive consent.
   - Alternative considered: duplicate a separate interactive workflow. Rejected because consent-critical paths would drift.

4. CLI prompt output shows bounded metadata only.
   - Rationale: the host needs role, requested permission names, and static action choices, but not raw protocol payloads, pairing codes, tokens, private reasons, or diagnostics.
   - Alternative considered: print full request JSON for transparency. Rejected because local console output can be copied or persisted and should not become a secret leak surface.

## Risks / Trade-offs

- [Risk] Interactive prompt can hang a CLI host waiting for input. -> Mitigation: keep it opt-in and keep `--host-decision` available for automation.
- [Risk] Prompt implementation can accidentally approve on invalid input. -> Mitigation: accept only exact `approve` or `deny`; any other result fails closed as no decision.
- [Risk] Prompt path can weaken audit-before-send ordering. -> Mitigation: resolve the decision first, then call the same host workflow branch that prepares audit records before protocol sends.
- [Risk] This is not a production consent UI. -> Mitigation: document it as a development shell path and keep native Windows UI as a future OpenSpec change.
