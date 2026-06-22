# Change: Harden agent-shell signal shutdown

## Summary

Make agent-shell CLI signal shutdown idempotent and test-covered so SIGINT or
SIGTERM stops local CLI handles and the managed runtime exactly once before the
process exits.

## Safety Impact

This narrows a local lifecycle failure path for development MVP sessions. It
does not add capture, input, authorization, relay, installer, startup, service,
token, logging, or privilege behavior. It preserves existing consent,
visibility, revoke, disconnect, audit, and permission gates.

## Non-Goals

- No hidden sessions, unattended access, startup persistence, services, or
  privilege elevation.
- No changes to Windows capture, Windows input application, relay routing, or
  protocol permissions.
- No production native UI or installer work.

## Touch Points

- Agent-shell CLI shutdown orchestration.
- Focused unit tests for signal cleanup idempotency and secret-safe error
  reporting handoff.
