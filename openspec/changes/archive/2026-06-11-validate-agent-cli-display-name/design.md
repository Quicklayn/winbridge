## Context

The agent shell creates a local device identity during startup and sends that metadata in `join-session`. The protocol layer already validates device identity display names as non-empty strings up to 120 characters. The CLI currently passes `--name` through without validation, which means malformed display names can fail after a WebSocket is opened instead of during argument parsing.

This is a development CLI and identity metadata hardening change. It does not add production identity, account authentication, capture, input, installer, service, startup, token, log, or privilege behavior.

## Goals / Non-Goals

**Goals:**

- Reject invalid `--name` values before runtime startup.
- Match the shared device identity display-name shape: non-empty and at most 120 characters.
- Preserve the existing omitted-name default.
- Preserve exact valid display names rather than trimming them.

**Non-Goals:**

- No production account identity or device trust model.
- No display-name canonicalization or uniqueness policy.
- No changes to relay join authorization, pairing, or session permission semantics.
- No native UI, capture, input, installer, startup, service, or privilege changes.

## Decisions

1. Validate display names in `parseArgs`.

   CLI argument parsing already owns fail-fast validation for relay URLs, protocol identifiers, permissions, lifecycle reasons, and audit paths. Adding display-name validation there keeps malformed identity metadata from opening a relay connection. Alternative considered: rely on `createDeviceIdentity` during runtime startup. That keeps validation centralized in protocol code but fails later than the CLI validation contract.

2. Reuse the protocol display-name contract.

   The parser will validate against the same non-empty and max-length constraints used by `DeviceIdentitySchema`, without trimming valid values. Alternative considered: creating a stricter CLI-only display-name profile. That would diverge from the protocol contract without a current product requirement.

3. Keep usage errors bounded.

   Invalid display names will map to the existing `AgentShellUsageError`, which prints usage but does not echo the invalid display name value.

## Risks / Trade-offs

- Scripts that used blank or oversized `--name` values will now fail before connecting. This is intended fail-fast behavior and can be fixed by omitting `--name` or providing a valid value.
- Preserving leading or trailing spaces in otherwise non-empty names keeps exact protocol semantics, but operators may find such names visually confusing. This change only rejects fully blank names to avoid changing accepted non-blank metadata unexpectedly.
