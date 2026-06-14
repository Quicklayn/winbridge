## Context

The runtime already computes `expiresAt` for approved authorization decisions and stores it in host/viewer authorization snapshots. Host indicator events and status snapshots currently expose state, visibility, permission count, authorization id/status, and inactive causes, but omit the expiration timestamp. This limits local operators' ability to see the remaining consent boundary from status/indicator surfaces.

## Goals / Non-Goals

**Goals:**

- Surface `expiresAt` as bounded lifecycle metadata for active or paused visible grants.
- Keep expiration metadata local to runtime events/logs/status formatters.
- Avoid stale expiration metadata in inactive, terminal, local leave, socket-close, or trusted disconnect status views.
- Preserve all existing consent, visibility, revocation, audit, and fail-closed gates.

**Non-Goals:**

- No change to authorization TTL selection or expiration scheduling.
- No new protocol message field; existing protocol already carries `expiresAt` where needed.
- No new capture, input, clipboard, file-transfer, diagnostics, reconnect, unattended, installer, startup, service, privilege, or native Windows capability.
- No production identity model or native UI.

## Decisions

- Reuse the existing ISO `expiresAt` string from validated runtime authorization snapshots.
  - Rationale: this value is already protocol-validated and used to enforce expiration.
  - Alternative considered: compute `expiresInMs`. That introduces clock-dependent display churn and makes status tests less stable.
- Emit `expiresAt` only while state is `active` or `paused`.
  - Rationale: terminal/inactive states already communicate that the grant is no longer action-capable; carrying stale expiry metadata could mislead operators.
  - Alternative considered: include the timestamp on inactive expired state. That is less useful for immediate consent visibility and adds ambiguity to disconnected status output.
- Keep formatting in existing status/indicator lines.
  - Rationale: the project already uses compact bounded key/value CLI output; adding one optional key preserves that convention.

## Risks / Trade-offs

- ISO timestamps are less immediately readable than countdowns. Mitigation: they are stable, unambiguous, and avoid clock-drift display bugs.
- More lifecycle metadata appears in local logs. Mitigation: `expiresAt` is bounded authorization metadata, not peer identity, private reason, token, pairing code, payload, or remote content.
- Exact output expectations need updates. Mitigation: focused formatter and runtime lifecycle tests cover active/paused inclusion and inactive omission.
