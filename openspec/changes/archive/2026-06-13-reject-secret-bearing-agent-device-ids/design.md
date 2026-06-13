## Context

WinBridge currently validates agent-shell device identifiers for protocol syntax before the CLI constructs runtime options and before `createAgentShellRuntime` opens a relay connection. The shared protocol/audit layer already has `hasSecretBearingProtocolIdentifierMetadata` to detect token-, credential-, cookie-, key-, and auth-bearing identifier text for redaction-sensitive paths.

The missing boundary is agent-shell input validation: a syntactically valid device id can contain secret-bearing marker text and still be sent as join-session metadata. This change adds fail-closed validation at the agent-shell CLI and runtime boundaries before any relay connection or protocol message.

## Goals / Non-Goals

**Goals:**

- Reject secret-bearing custom CLI `--device` values through bounded usage handling.
- Reject secret-bearing direct runtime `deviceId` values before relay startup.
- Keep default generated device ids and ordinary custom device ids valid.
- Keep errors/logs/events from exposing the raw rejected device id.
- Preserve existing relay/protocol audit redaction behavior.

**Non-Goals:**

- Change shared `DeviceIdentitySchema` or all protocol users.
- Change relay routing, pairing, signaling, or audit persistence semantics.
- Add or change capture, input, clipboard, diagnostics, file transfer, installer, startup, services, privileges, or Windows-native behavior.
- Store, parse, or recover any credential material.

## Decisions

- Reuse `hasSecretBearingProtocolIdentifierMetadata` from `@winbridge/protocol`.
  - Rationale: this keeps the agent-shell validation boundary aligned with existing audit redaction semantics.
  - Alternative considered: add an agent-shell-only marker list. That would drift from protocol audit behavior and require duplicate maintenance.

- Enforce at both agent-shell entry points: CLI argument parsing and direct managed runtime creation.
  - Rationale: callers can bypass CLI parsing by importing `createAgentShellRuntime`, so runtime validation must be authoritative before relay startup.
  - Alternative considered: CLI-only validation. That would leave library callers able to send secret-bearing device ids.

- Do not change `DeviceIdentitySchema` in this increment.
  - Rationale: shared protocol schemas are used by relay and audit tests that intentionally accept and redact unsafe-looking identifiers at downstream boundaries. This change is an earlier agent-shell boundary, not a protocol contract migration.
  - Alternative considered: making all protocol device ids reject secret markers. That is broader and could break existing relay/audit redaction behavior outside this requirement.

- Reuse existing bounded error paths.
  - Rationale: `AgentShellUsageError` and `RUNTIME_IDENTIFIER_ERROR_MESSAGE` are static and do not include raw user input, preserving secret-safe diagnostics.
  - Alternative considered: add a specific user-facing error. That increases diagnostic detail but raises the chance of accidentally echoing sensitive input.

## Risks / Trade-offs

- Existing users with custom device ids containing words like `token`, `secret`, `cookie`, `authorization`, or `key` marker families will be rejected. Mitigation: default generated ids remain valid and docs will clarify that device ids are metadata, not a place for secrets.
- The protocol layer will still accept such identifiers in other contexts. Mitigation: this is intentional scope control; relay/audit redaction remains the downstream guard while agent-shell fails closed earlier.
- Marker matching can reject benign ids that contain sensitive marker substrings. Mitigation: fail-closed behavior is appropriate for device metadata, which does not need secret-looking vocabulary.

## Migration Plan

- Implement the CLI/runtime validation and focused tests in one release.
- Existing safe custom device ids need no migration.
- Users with rejected custom ids should choose opaque non-secret device identifiers such as `device-host-01` or use the generated defaults.
- Rollback is the previous validation behavior; no data migration is required.

## Open Questions

- None for this increment.
