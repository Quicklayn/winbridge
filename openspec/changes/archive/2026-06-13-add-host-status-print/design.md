## Context

The managed agent shell runtime already exposes `getHostStatus()` for host runtimes and rejects viewer callers. The interactive host control prompt uses this snapshot for its exact `status` command. Viewer runtimes also have a separate one-shot `--viewer-status-after-ms` helper that schedules a read-only status print after runtime startup.

## Goals / Non-Goals

**Goals:**

- Add a symmetric host-only one-shot status print for local development.
- Reuse the existing host status snapshot and output shape so prompt and one-shot output stay consistent.
- Validate configuration before runtime startup and reject viewer-mode or malformed delays.
- Keep the helper read-only and secret-safe.

**Non-Goals:**

- No new host lifecycle controls.
- No protocol messages, workflow audit events, reconnect behavior, or permission changes.
- No native Windows UI, capture, input, clipboard, file-transfer, diagnostics, installer, startup, service, token, or privilege work.

## Decisions

- Reuse `formatHostControlStatus()` for the one-shot status line.
  - Rationale: the existing formatter is already tested for bounded metadata and secret-safe output.
  - Alternative considered: duplicate a new formatter in a host status module. Rejected because duplicated formatting can drift.
- Add a small scheduling helper analogous to `viewer-status.ts`.
  - Rationale: it keeps `index.ts` simple and allows focused unit tests that prove the helper reads status only once and never calls controls or sends.
- Make `--host-status-after-ms` host-only and mutually exclusive with `--host-control-prompt true`.
  - Rationale: the prompt already provides repeated status reads; disallowing both avoids overlapping local control surfaces and mixed terminal output.
- Run the one-shot status print inside the ordinary managed host runtime rather than adding a no-network status-only mode.
  - Rationale: active, paused, terminal, and inactive-cause host status snapshots are useful only after the runtime observes normal relay and consent workflow events.
  - Alternative considered: create a no-network status command that constructs a runtime without calling `start()`. Rejected because it could only print the initial inactive snapshot and would not exercise the host UI wiring path this helper is meant to support.

## Risks / Trade-offs

- [Risk] The helper prints stale status if fired before the runtime observes a peer or authorization.
  - Mitigation: document and specify that the output is a local snapshot at the configured delay, not a blocking wait for authorization.
- [Risk] The status helper could be mistaken for a no-network command even though the CLI starts the ordinary runtime before scheduling it.
  - Mitigation: specify that existing runtime startup and explicit host workflow options retain their existing protocol behavior; the new guarantee applies to the scheduled status read itself.
- [Risk] Host status lines could become a place where private session metadata leaks.
  - Mitigation: reuse the existing bounded snapshot and formatter; add tests proving no permissions, display names, private reasons, tokens, or raw protocol data are printed.
