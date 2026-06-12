## Context

The managed agent shell appends `token` to the relay URL when `AgentShellRuntimeOptions.token` is configured. The runtime logs only the relay origin on successful connection and emits redacted local event views for protocol messages.

This change makes that token hygiene invariant explicit with an integration test that exercises the real relay shared-token path.

## Goals / Non-Goals

**Goals:**

- Prove a configured relay token allows the host shell to join a token-protected development relay.
- Prove local runtime logs and runtime event records do not contain the raw token marker.
- Preserve existing fail-closed token validation and connection behavior.

**Non-Goals:**

- No production authentication design.
- No new identity provider, MFA, token storage, or credential persistence.
- No changes to consent, authorization, relay forwarding, capture, input, clipboard, file transfer, diagnostics, installer, startup, service, or privilege behavior.

## Decisions

1. Add integration coverage using the real relay runtime.
   - Rationale: the risk includes how the token is appended to the WebSocket URL and what the agent logs after connection.
   - Alternative considered: unit-test URL construction, but that would not prove local runtime event/log behavior.

2. Use a unique token marker string.
   - Rationale: absence checks across logs and event records catch accidental leakage without asserting unrelated formatting.

## Risks / Trade-offs

- The test extends shared helper options for relay shared-token and host token. Keep this test-only surface narrow and defaulted so existing cases are unaffected.

## Migration Plan

This is test/spec hardening only. If it fails, runtime logging or event projection must redact token-bearing surfaces before archive.

## Open Questions

None.
