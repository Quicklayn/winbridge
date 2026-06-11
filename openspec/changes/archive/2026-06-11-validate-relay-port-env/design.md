## Context

The relay runtime already validates pairing and heartbeat settings, but the CLI entrypoint parses `WINBRIDGE_RELAY_PORT` inline. `Number.parseInt` accepts values like `8787abc`, and invalid ranges are not rejected until the HTTP server attempts to listen.

## Goals / Non-Goals

**Goals:**
- Centralize relay port environment parsing in testable relay code.
- Reject malformed, negative, fractional, and out-of-range ports before calling `server.listen`.
- Preserve default behavior and test support for port `0`.

**Non-Goals:**
- No change to binding address; relay remains bound to `127.0.0.1`.
- No production deployment configuration, TLS, token lifecycle, or account authentication.

## Decisions

1. Export `createRelayPortConfig(env)` from `server.ts`.

   Rationale: the entrypoint can call a tested helper without importing test-only code, and integration tests can cover exact accepted/rejected env values.

2. Use exact decimal integer parsing.

   Rationale: exact parsing avoids ambiguous partial values while keeping Windows PowerShell env configuration simple.

## Risks / Trade-offs

- Existing local env values with whitespace or comments will be rejected. Mitigation: documented examples use plain numeric strings, and explicit failure is safer than silently binding a different port.
