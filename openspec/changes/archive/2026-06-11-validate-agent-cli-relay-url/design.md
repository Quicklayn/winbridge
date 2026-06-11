## Context

The agent-shell CLI validates most structured options before runtime startup. `--relay` remains raw and can be a relative string, HTTP URL, filesystem path, or other non-WebSocket value until WebSocket construction fails later.

## Goals / Non-Goals

**Goals:**
- Validate relay URL syntax at CLI parse time.
- Allow only `ws:` and `wss:` protocols.
- Preserve the current local development default.

**Non-Goals:**
- No production relay trust, certificate pinning, allow-list, account identity, shared token policy, or deployment configuration.
- No changes to relay server behavior.

## Decisions

1. Use the standard `URL` parser and protocol allow-list.

   Rationale: `new URL()` gives structured validation without adding a dependency, and `ws:`/`wss:` maps directly to WebSocket endpoints.

2. Keep URL normalization minimal.

   Rationale: returning `url.toString()` gives consistent absolute URL formatting while preserving query parameters such as development `?token=` use.

## Risks / Trade-offs

- Users with shorthand local relay values such as `localhost:8787` must include `ws://`. Mitigation: documented examples already use WebSocket URLs or rely on the default.
